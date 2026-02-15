'use client';

import { POSITION_COLORS, POSITION_NAMES, Position, Player } from '@/types';
import { useDraft, getRemainingNeeds } from '@/context/DraftContext';

export default function SuggestedPicks() {
    const { state } = useDraft();

    if (!state.userTeamId) return null;

    const remainingNeeds = getRemainingNeeds(
        state.userTeamId,
        state.draftedPlayers
    );

    if (remainingNeeds.length === 0) return null;

    // Find top suggestions: best available at each remaining need
    const suggestions: Array<{ player: Player; matchedNeed: string }> = [];
    const seen = new Set<number>();

    for (const need of remainingNeeds) {
        const match = state.availablePlayers.find((p) => {
            if (seen.has(p.id)) return false;
            if (need === 'OL') return p.position === 'OT' || p.position === 'OG';
            return p.position === need;
        });
        if (match) {
            suggestions.push({ player: match, matchedNeed: need });
            seen.add(match.id);
        }
    }

    // Add BPA if not already in suggestions
    const bpa = state.availablePlayers[0];
    if (bpa && !seen.has(bpa.id)) {
        suggestions.unshift({ player: bpa, matchedNeed: 'BPA' });
    }

    // Cap at 3 suggestions
    const topSuggestions = suggestions.slice(0, 3);

    if (topSuggestions.length === 0) return null;

    return (
        <div className="suggested-picks">
            <div className="suggested-header">
                <h3>
                    <span className="suggested-icon">💡</span> Recommended
                </h3>
            </div>

            <div className="suggested-list">
                {topSuggestions.map(({ player, matchedNeed }) => (
                    <div key={player.id} className="suggested-item">
                        <div className="suggested-item-left">
                            <span className="suggested-rank">#{player.id}</span>
                            <div className="suggested-info">
                                <span className="suggested-name">{player.name}</span>
                                <span className="suggested-school">{player.school}</span>
                            </div>
                        </div>

                        <div className="suggested-item-right">
                            <span
                                className="position-badge-sm"
                                title={POSITION_NAMES[player.position as Position]}
                                style={{
                                    backgroundColor:
                                        POSITION_COLORS[player.position as Position] + '15',
                                    color: POSITION_COLORS[player.position as Position],
                                }}
                            >
                                {player.position}
                            </span>
                            <span
                                className={`suggested-reason ${matchedNeed === 'BPA' ? 'bpa' : 'need'
                                    }`}
                            >
                                {matchedNeed === 'BPA' ? 'Best Available' : `Fills ${matchedNeed}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
