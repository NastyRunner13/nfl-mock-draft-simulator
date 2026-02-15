'use client';

import { POSITION_COLORS, POSITION_NAMES, Position } from '@/types';
import { useDraft, getRemainingNeeds } from '@/context/DraftContext';
import { teams } from '@/data/teams';

export default function TeamNeeds() {
    const { state } = useDraft();

    if (!state.userTeamId) return null;

    const team = teams.find((t) => t.id === state.userTeamId)!;
    const remainingNeeds = getRemainingNeeds(
        state.userTeamId,
        state.draftedPlayers
    );

    const userPicks = state.draftedPlayers.filter((p) => p.isUserPick);

    return (
        <div className="team-needs">
            <div className="team-needs-header">
                <h3>
                    <span
                        className="team-dot"
                        style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                </h3>
            </div>

            <div className="needs-list">
                {team.needs.map((need) => {
                    const isFilled = !remainingNeeds.includes(need);
                    const filledBy = userPicks.find((p) => {
                        if (need === 'OL')
                            return (
                                p.player.position === 'OT' || p.player.position === 'OG'
                            );
                        return p.player.position === need;
                    });

                    return (
                        <div
                            key={need}
                            className={`need-item ${isFilled ? 'filled' : 'unfilled'}`}
                        >
                            <span
                                className="need-position"
                                title={POSITION_NAMES[need as Position]}
                                style={{
                                    backgroundColor:
                                        POSITION_COLORS[need as Position] + (isFilled ? '15' : '25'),
                                    color: POSITION_COLORS[need as Position],
                                    borderColor:
                                        POSITION_COLORS[need as Position] +
                                        (isFilled ? '30' : '50'),
                                }}
                            >
                                {isFilled ? '✓' : ''} {need}
                            </span>
                            {filledBy && (
                                <span className="filled-by">{filledBy.player.name}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {userPicks.length > 0 && (
                <div className="your-picks">
                    <h4>Your Picks</h4>
                    {userPicks.map((pick) => (
                        <div key={pick.pickNumber} className="your-pick-item">
                            <span className="your-pick-round">R{pick.round}</span>
                            <span className="your-pick-name">{pick.player.name}</span>
                            <span
                                className="position-badge-sm"
                                title={POSITION_NAMES[pick.player.position as Position]}
                                style={{
                                    backgroundColor:
                                        POSITION_COLORS[pick.player.position as Position] + '20',
                                    color: POSITION_COLORS[pick.player.position as Position],
                                }}
                            >
                                {pick.player.position}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
