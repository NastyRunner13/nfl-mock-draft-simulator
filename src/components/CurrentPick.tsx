'use client';

import { POSITION_COLORS, Position, TOTAL_TEAMS } from '@/types';
import { useDraft, getTeamForPick, getRoundForPick, isUserTurn, getRemainingNeeds } from '@/context/DraftContext';
import { teams } from '@/data/teams';

export default function CurrentPick() {
    const { state } = useDraft();

    const currentTeamId = getTeamForPick(state.currentPickIndex);
    const currentRound = getRoundForPick(state.currentPickIndex);
    const pickInRound = (state.currentPickIndex % TOTAL_TEAMS) + 1;
    const overallPick = state.currentPickIndex + 1;
    const team = teams.find((t) => t.id === currentTeamId)!;

    const userTurn = isUserTurn(state);
    const remainingNeeds = getRemainingNeeds(currentTeamId, state.draftedPlayers);

    return (
        <div
            className={`current-pick ${userTurn ? 'user-turn' : ''}`}
            style={{ '--team-color': team.color } as React.CSSProperties}
        >
            <div className="current-pick-inner">
                <div className="pick-info">
                    <span className="pick-round">
                        Round {currentRound} • Pick {pickInRound}
                    </span>
                    <span className="pick-number">#{overallPick}</span>
                </div>

                <div className="pick-team">
                    <span
                        className="team-dot"
                        style={{ backgroundColor: team.color }}
                    />
                    <span className="team-label">{team.name}</span>
                    {team.id === state.userTeamId && (
                        <span className="your-team-badge">YOUR TEAM</span>
                    )}
                </div>

                <div className="pick-status">
                    {userTurn ? (
                        <div className="on-the-clock">
                            <span className="clock-pulse" />
                            ON THE CLOCK
                        </div>
                    ) : state.isAiPicking ? (
                        <div className="ai-thinking">
                            <div className="thinking-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span>AI is deciding…</span>
                        </div>
                    ) : (
                        <span className="ai-waiting">Waiting…</span>
                    )}
                </div>

                {remainingNeeds.length > 0 && (
                    <div className="pick-needs">
                        <span className="needs-label">NEEDS</span>
                        {remainingNeeds.map((need) => (
                            <span
                                key={need}
                                className="need-badge-sm"
                                style={{
                                    backgroundColor:
                                        POSITION_COLORS[need as Position] + '15',
                                    color: POSITION_COLORS[need as Position],
                                }}
                            >
                                {need}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
