'use client';

import { useState } from 'react';
import { POSITION_COLORS, POSITION_NAMES, Position, TOTAL_ROUNDS, TOTAL_TEAMS } from '@/types';
import { useDraft } from '@/context/DraftContext';
import TeamLogo from './TeamLogo';

export default function DraftHistory() {
    const { state } = useDraft();
    const [activeRound, setActiveRound] = useState(1);
    const [expandedPick, setExpandedPick] = useState<number | null>(null);

    const roundPicks = state.draftedPlayers.filter(
        (p) => p.round === activeRound
    );

    // Determine current round for auto-tab
    const currentRound =
        state.draftedPlayers.length > 0
            ? state.draftedPlayers[state.draftedPlayers.length - 1].round
            : 1;

    const toggleReasoning = (pickNumber: number) => {
        setExpandedPick(expandedPick === pickNumber ? null : pickNumber);
    };

    return (
        <div className="draft-history">
            <div className="draft-history-header">
                <h2>Draft Results</h2>
            </div>

            {/* Round Tabs */}
            <div className="round-tabs">
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map(
                    (round) => {
                        const roundPickCount = state.draftedPlayers.filter(
                            (p) => p.round === round
                        ).length;
                        return (
                            <button
                                key={round}
                                className={`round-tab ${activeRound === round ? 'active' : ''
                                    } ${round === currentRound ? 'current' : ''}`}
                                onClick={() => setActiveRound(round)}
                            >
                                <span>R{round}</span>
                                <span className="round-count">
                                    {roundPickCount}/{TOTAL_TEAMS}
                                </span>
                            </button>
                        );
                    }
                )}
            </div>

            {/* Picks List */}
            <div className="picks-list">
                {roundPicks.length === 0 ? (
                    <div className="no-picks">No picks yet in Round {activeRound}</div>
                ) : (
                    roundPicks.map((pick, index) => (
                        <div key={pick.pickNumber}>
                            <div
                                className={`pick-entry ${pick.isUserPick ? 'user-pick' : 'ai-pick'
                                    } ${pick.reasoning ? 'has-reasoning' : ''}`}
                                style={
                                    {
                                        animationDelay: `${index * 0.05}s`,
                                    } as React.CSSProperties
                                }
                                onClick={() => pick.reasoning && toggleReasoning(pick.pickNumber)}
                            >
                                <div className="pick-entry-number">
                                    <span className="pick-overall">#{pick.pickNumber}</span>
                                </div>

                                <TeamLogo abbreviation={pick.team.abbreviation} color={pick.team.color} size={28} />

                                <div className="pick-entry-details">
                                    <div className="pick-entry-team">
                                        {pick.team.abbreviation}
                                        {pick.isUserPick && (
                                            <span className="user-pick-badge">YOU</span>
                                        )}
                                    </div>
                                    <div className="pick-entry-player">
                                        <span className="pick-player-name">
                                            {pick.player.name}
                                        </span>
                                        <span
                                            className="position-badge-sm"
                                            title={POSITION_NAMES[pick.player.position as Position]}
                                            style={{
                                                backgroundColor:
                                                    POSITION_COLORS[pick.player.position as Position] +
                                                    '15',
                                                color:
                                                    POSITION_COLORS[pick.player.position as Position],
                                            }}
                                        >
                                            {pick.player.position}
                                        </span>
                                    </div>
                                </div>

                                {pick.reasoning && (
                                    <div className="pick-reasoning-toggle">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            className={`reasoning-chevron ${expandedPick === pick.pickNumber ? 'open' : ''
                                                }`}
                                        >
                                            <path
                                                d="M4 5.5L7 8.5L10 5.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Expandable Reasoning Panel */}
                            {pick.reasoning && expandedPick === pick.pickNumber && (
                                <div className="reasoning-panel">
                                    <div className="reasoning-content">
                                        <span className="reasoning-label">AI Reasoning</span>
                                        <p>{pick.reasoning}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
