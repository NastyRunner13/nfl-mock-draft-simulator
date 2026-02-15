'use client';

import { POSITION_COLORS, Position, TOTAL_ROUNDS, TOTAL_TEAMS, TOTAL_PICKS } from '@/types';
import { useDraft, getRoundForPick } from '@/context/DraftContext';

export default function ProgressTracker() {
    const { state } = useDraft();

    const currentRound = getRoundForPick(state.currentPickIndex);
    const pickInRound = (state.currentPickIndex % TOTAL_TEAMS) + 1;
    const totalCompleted = state.draftedPlayers.length;
    const progressPercent = (totalCompleted / TOTAL_PICKS) * 100;

    return (
        <div className="progress-tracker">
            {/* Overall progress bar */}
            <div className="progress-bar-container">
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <span className="progress-text">
                    {totalCompleted} / {TOTAL_PICKS} picks
                </span>
            </div>

            {/* Round indicators */}
            <div className="round-indicators">
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map(
                    (round) => {
                        const roundComplete = round < currentRound;
                        const roundActive = round === currentRound;
                        const roundPicks = state.draftedPlayers.filter(
                            (p) => p.round === round
                        );

                        return (
                            <div
                                key={round}
                                className={`round-indicator ${roundComplete ? 'complete' : ''
                                    } ${roundActive ? 'active' : ''}`}
                            >
                                <div className="round-indicator-dot">
                                    {roundComplete ? (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path
                                                d="M2.5 6L5 8.5L9.5 4"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <span>{round}</span>
                                    )}
                                </div>
                                <span className="round-indicator-label">Round {round}</span>
                                {roundActive && (
                                    <span className="round-indicator-pick">
                                        Pick {pickInRound}/{TOTAL_TEAMS}
                                    </span>
                                )}
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}
