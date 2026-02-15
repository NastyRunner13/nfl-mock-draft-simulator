'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DraftPick, POSITION_COLORS, POSITION_NAMES, Position, TOTAL_TEAMS } from '@/types';
import {
    useDraft,
    getTeamForPick,
    getRoundForPick,
    isUserTurn,
    getRemainingNeeds,
} from '@/context/DraftContext';
import { teams } from '@/data/teams';

import ProgressTracker from './ProgressTracker';
import CurrentPick from './CurrentPick';
import BigBoard from './BigBoard';
import DraftHistory from './DraftHistory';
import TeamNeeds from './TeamNeeds';
import SuggestedPicks from './SuggestedPicks';
import PickAnimation from './PickAnimation';
import RoundTransition from './RoundTransition';
import TeamLogo from './TeamLogo';

// ─── Constants ──────────────────────────────────────────────────────────────

const AI_DISPLAY_DURATION = 2000; // ms to show pick animation card

// ─── Component ──────────────────────────────────────────────────────────────

export default function DraftBoard() {
    const { state, dispatch } = useDraft();

    // AI pick animation state
    const [animatingPick, setAnimatingPick] = useState<DraftPick | null>(null);
    const [animationVisible, setAnimationVisible] = useState(false);

    // Round transition state
    const [transitionRound, setTransitionRound] = useState<number | null>(null);
    const lastRoundRef = useRef(1);

    // Fast-forward state
    const [isFastForwarding, setIsFastForwarding] = useState(false);
    const [ffPicks, setFfPicks] = useState<DraftPick[]>([]);
    const [hoveredFfCard, setHoveredFfCard] = useState<number | null>(null);
    const ffAbortRef = useRef<AbortController | null>(null);

    // Abort controller for regular AI picks
    const abortRef = useRef<AbortController | null>(null);

    // Ref-based guard to prevent the auto-trigger effect from re-entering
    // (avoids the race condition where dispatching SET_AI_PICKING would
    //  cause the effect cleanup to abort the in-flight fetch)
    const aiPickInFlightRef = useRef(false);

    // ─── Round Transition Detection ─────────────────────────────────────────

    useEffect(() => {
        const currentRound = getRoundForPick(state.currentPickIndex);
        if (currentRound > lastRoundRef.current && state.phase === 'drafting') {
            setTransitionRound(currentRound);
        }
        lastRoundRef.current = currentRound;
    }, [state.currentPickIndex, state.phase]);

    const handleTransitionComplete = useCallback(() => {
        setTransitionRound(null);
    }, []);

    // ─── AI Pick Logic ──────────────────────────────────────────────────────

    const makeAiPick = useCallback(
        async (controller: AbortController) => {
            const teamId = getTeamForPick(state.currentPickIndex);
            const team = teams.find((t) => t.id === teamId);
            if (!team) return;

            aiPickInFlightRef.current = true;
            dispatch({ type: 'SET_AI_PICKING', isPicking: true });

            try {
                const response = await fetch('/api/draft/ai-pick', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        team: {
                            name: team.name,
                            needs: team.needs,
                            context: team.context,
                        },
                        availablePlayers: state.availablePlayers,
                        round: getRoundForPick(state.currentPickIndex),
                        pickNumber: state.currentPickIndex + 1,
                        draftHistory: state.draftedPlayers.map((dp) => ({
                            teamName: dp.team.name,
                            playerName: dp.player.name,
                            position: dp.player.position,
                        })),
                    }),
                });

                if (controller.signal.aborted) return;

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                const selectedPlayer = state.availablePlayers.find(
                    (p) => p.id === data.playerId
                );

                if (!selectedPlayer) {
                    throw new Error('AI selected invalid player');
                }

                const pick: DraftPick = {
                    pickNumber: state.currentPickIndex + 1,
                    round: getRoundForPick(state.currentPickIndex),
                    team,
                    player: selectedPlayer,
                    reasoning: data.reasoning,
                    isUserPick: false,
                };

                // Show animation card
                setAnimatingPick(pick);
                setAnimationVisible(true);

                // After display duration, dispatch the pick and hide animation
                await new Promise((resolve) =>
                    setTimeout(resolve, AI_DISPLAY_DURATION)
                );

                if (controller.signal.aborted) { aiPickInFlightRef.current = false; return; }

                setAnimationVisible(false);
                setTimeout(() => {
                    setAnimatingPick(null);
                    aiPickInFlightRef.current = false;
                    if (!controller.signal.aborted) {
                        dispatch({ type: 'MAKE_PICK', pick });
                    }
                }, 400); // Wait for exit animation
            } catch (err) {
                if (controller.signal.aborted) { aiPickInFlightRef.current = false; return; }

                console.error('AI pick failed, using client-side fallback:', err);

                // Client-side fallback: pick first player matching a need, or BPA
                const remainingNeeds = getRemainingNeeds(
                    teamId,
                    state.draftedPlayers
                );
                let fallbackPlayer = state.availablePlayers[0]; // BPA default

                for (const need of remainingNeeds) {
                    const match = state.availablePlayers.find((p) => {
                        if (need === 'OL')
                            return p.position === 'OT' || p.position === 'OG';
                        return p.position === need;
                    });
                    if (match) {
                        fallbackPlayer = match;
                        break;
                    }
                }

                const pick: DraftPick = {
                    pickNumber: state.currentPickIndex + 1,
                    round: getRoundForPick(state.currentPickIndex),
                    team,
                    player: fallbackPlayer,
                    reasoning: `Selected ${fallbackPlayer.name} — best available player at a position of need.`,
                    isUserPick: false,
                };

                setAnimatingPick(pick);
                setAnimationVisible(true);

                await new Promise((resolve) =>
                    setTimeout(resolve, AI_DISPLAY_DURATION)
                );

                if (controller.signal.aborted) return;

                setAnimationVisible(false);
                setTimeout(() => {
                    setAnimatingPick(null);
                    aiPickInFlightRef.current = false;
                    if (!controller.signal.aborted) {
                        dispatch({ type: 'SET_ERROR', error: null });
                        dispatch({ type: 'MAKE_PICK', pick });
                    }
                }, 400);
            }
        },
        [state.currentPickIndex, state.availablePlayers, state.draftedPlayers, dispatch]
    );

    // ─── Auto-trigger AI picks ──────────────────────────────────────────────

    useEffect(() => {
        if (
            state.phase !== 'drafting' ||
            isUserTurn(state) ||
            aiPickInFlightRef.current ||
            isFastForwarding ||
            transitionRound !== null
        ) {
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        // Small delay before AI starts picking
        const timer = setTimeout(() => {
            makeAiPick(controller);
        }, 500);

        return () => {
            clearTimeout(timer);
            // Only abort if the pick hasn't already completed
            if (aiPickInFlightRef.current) {
                controller.abort();
                aiPickInFlightRef.current = false;
            }
            abortRef.current = null;
        };
    }, [
        state.phase,
        state.currentPickIndex,
        state.userTeamId,
        isFastForwarding,
        transitionRound,
        makeAiPick,
    ]);

    // ─── Fast Forward Logic ─────────────────────────────────────────────────

    const handleFastForward = useCallback(async () => {
        if (isFastForwarding || isUserTurn(state)) return;

        // Abort any in-progress regular AI pick and wait for it to settle
        if (aiPickInFlightRef.current) {
            abortRef.current?.abort();
            aiPickInFlightRef.current = false;
            // Let the abort propagate before we start FF
            await new Promise((r) => setTimeout(r, 100));
        }

        dispatch({ type: 'SET_AI_PICKING', isPicking: false });
        setAnimatingPick(null);
        setAnimationVisible(false);
        setIsFastForwarding(true);
        setFfPicks([]);
        const collectedPicks: DraftPick[] = [];

        const controller = new AbortController();
        ffAbortRef.current = controller;

        let pickIndex = state.currentPickIndex;
        let availablePlayers = [...state.availablePlayers];
        let draftedPlayers = [...state.draftedPlayers];

        while (pickIndex < 28) {
            const teamId = getTeamForPick(pickIndex);

            // Stop if it's the user's turn
            if (teamId === state.userTeamId) break;

            const team = teams.find((t) => t.id === teamId);
            if (!team || controller.signal.aborted) break;

            try {
                const response = await fetch('/api/draft/ai-pick', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        team: {
                            name: team.name,
                            needs: team.needs,
                            context: team.context,
                        },
                        availablePlayers,
                        round: getRoundForPick(pickIndex),
                        pickNumber: pickIndex + 1,
                        draftHistory: draftedPlayers.map((dp) => ({
                            teamName: dp.team.name,
                            playerName: dp.player.name,
                            position: dp.player.position,
                        })),
                    }),
                });

                if (controller.signal.aborted) break;

                // API cooldown — prevents rate-limiting and overload
                if (pickIndex < 27) {
                    await new Promise((r) => setTimeout(r, 500));
                    if (controller.signal.aborted) break;
                }

                const data = await response.json();
                const selectedPlayer = availablePlayers.find(
                    (p) => p.id === data.playerId
                );

                if (!selectedPlayer) throw new Error('Invalid player');

                const pick: DraftPick = {
                    pickNumber: pickIndex + 1,
                    round: getRoundForPick(pickIndex),
                    team,
                    player: selectedPlayer,
                    reasoning: data.reasoning,
                    isUserPick: false,
                };

                collectedPicks.push(pick);
                setFfPicks([...collectedPicks]);
                dispatch({ type: 'MAKE_PICK', pick });

                // Update local tracking
                availablePlayers = availablePlayers.filter(
                    (p) => p.id !== selectedPlayer.id
                );
                draftedPlayers = [...draftedPlayers, pick];
                pickIndex++;
            } catch (err) {
                if (controller.signal.aborted) break;

                // Fallback pick
                const remainingNeeds = getRemainingNeeds(teamId, draftedPlayers);
                let fallbackPlayer = availablePlayers[0];

                for (const need of remainingNeeds) {
                    const match = availablePlayers.find((p) => {
                        if (need === 'OL')
                            return p.position === 'OT' || p.position === 'OG';
                        return p.position === need;
                    });
                    if (match) {
                        fallbackPlayer = match;
                        break;
                    }
                }

                const pick: DraftPick = {
                    pickNumber: pickIndex + 1,
                    round: getRoundForPick(pickIndex),
                    team,
                    player: fallbackPlayer,
                    reasoning: `Selected ${fallbackPlayer.name} — best available player at a position of need.`,
                    isUserPick: false,
                };

                collectedPicks.push(pick);
                setFfPicks([...collectedPicks]);
                dispatch({ type: 'MAKE_PICK', pick });

                availablePlayers = availablePlayers.filter(
                    (p) => p.id !== fallbackPlayer.id
                );
                draftedPlayers = [...draftedPlayers, pick];
                pickIndex++;
            }
        }

        setIsFastForwarding(false);
        // Keep ffPicks visible for a moment, then clear
        setTimeout(() => setFfPicks([]), 3000);
    }, [isFastForwarding, state, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            ffAbortRef.current?.abort();
        };
    }, []);

    // ─── Derived State ──────────────────────────────────────────────────────

    const userTurn = isUserTurn(state);
    const showFastForwardBtn =
        !userTurn &&
        !isFastForwarding &&
        state.phase === 'drafting';

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="draft-board">
            <ProgressTracker />

            <div className="draft-board-layout">
                {/* Left Column */}
                <div className="draft-board-left">
                    <CurrentPick />

                    {/* Fast Forward Button */}
                    {showFastForwardBtn && (
                        <button
                            className="fast-forward-btn"
                            onClick={handleFastForward}
                        >
                            <span className="ff-icon">⏩</span>
                            Fast Forward to My Pick
                        </button>
                    )}

                    {/* Error Banner */}
                    {state.error && (
                        <div className="error-banner">{state.error}</div>
                    )}

                    <BigBoard />
                </div>

                {/* Right Column */}
                <div className="draft-board-right">
                    {userTurn && <SuggestedPicks />}
                    <TeamNeeds />
                    <DraftHistory />
                </div>
            </div>

            {/* Pick Animation Overlay */}
            <PickAnimation
                pick={animatingPick}
                visible={animationVisible}
                displayDuration={AI_DISPLAY_DURATION}
            />

            {/* Fast-Forward Stacked Cards */}
            {ffPicks.length > 0 && (
                <div className="ff-stack-container">
                    <div className="ff-stack-label">
                        <span className="ff-stack-icon">⏩</span>
                        {isFastForwarding
                            ? `Fast forwarding… (${ffPicks.length} picks)`
                            : `${ffPicks.length} picks made`}
                    </div>
                    <div className="ff-stack-cards">
                        {ffPicks.map((pick, index) => (
                            <div
                                key={pick.pickNumber}
                                className={`ff-stack-card ${hoveredFfCard === pick.pickNumber ? 'hovered' : ''}`}
                                style={
                                    {
                                        '--stack-index': index,
                                        zIndex: ffPicks.length - index,
                                    } as React.CSSProperties
                                }
                                onMouseEnter={() =>
                                    setHoveredFfCard(pick.pickNumber)
                                }
                                onMouseLeave={() => setHoveredFfCard(null)}
                            >
                                <span className="ff-card-pick-num">
                                    #{pick.pickNumber}
                                </span>
                                <div className="ff-card-team">
                                    <TeamLogo
                                        abbreviation={pick.team.abbreviation}
                                        color={pick.team.color}
                                        size={20}
                                    />
                                    <span className="ff-card-team-name">
                                        {pick.team.abbreviation}
                                    </span>
                                </div>
                                <div className="ff-card-player">
                                    <span className="ff-card-player-name">
                                        {pick.player.name}
                                    </span>
                                    <span
                                        className="ff-card-pos"
                                        style={{
                                            backgroundColor:
                                                POSITION_COLORS[
                                                pick.player.position as Position
                                                ] + '15',
                                            color: POSITION_COLORS[
                                                pick.player.position as Position
                                            ],
                                        }}
                                    >
                                        {pick.player.position}
                                    </span>
                                </div>

                                {/* Reasoning tooltip on hover */}
                                {hoveredFfCard === pick.pickNumber &&
                                    pick.reasoning && (
                                        <div className="ff-card-reasoning">
                                            {pick.reasoning}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Round Transition Overlay */}
            {transitionRound !== null && (
                <RoundTransition
                    round={transitionRound}
                    onComplete={handleTransitionComplete}
                />
            )}
        </div>
    );
}
