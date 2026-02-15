'use client';

import { useState } from 'react';
import { POSITION_COLORS, POSITION_NAMES, Position, Player } from '@/types';
import { useDraft, isUserTurn, getRemainingNeeds } from '@/context/DraftContext';
import PositionIcon from './PositionIcon';

export default function BigBoard() {
    const { state, makeUserPick } = useDraft();
    const [confirmPlayer, setConfirmPlayer] = useState<Player | null>(null);

    const userTurn = isUserTurn(state);
    const remainingNeeds = state.userTeamId
        ? getRemainingNeeds(state.userTeamId, state.draftedPlayers)
        : [];

    const handlePlayerClick = (player: Player) => {
        if (!userTurn) return;
        setConfirmPlayer(player);
    };

    const handleConfirm = () => {
        if (confirmPlayer) {
            makeUserPick(confirmPlayer.id);
            setConfirmPlayer(null);
        }
    };

    const handleCancel = () => {
        setConfirmPlayer(null);
    };

    const isNeedMatch = (position: Position): boolean => {
        return remainingNeeds.some((need) => {
            if (need === 'OL') return position === 'OT' || position === 'OG';
            return need === position;
        });
    };

    return (
        <div className="big-board">
            <div className="big-board-header">
                <h2>Big Board</h2>
                <span className="available-count">
                    {state.availablePlayers.length} available
                </span>
            </div>

            <div className="player-list">
                {state.availablePlayers.map((player) => (
                    <button
                        key={player.id}
                        className={`player-row ${userTurn ? 'clickable' : 'disabled'} ${isNeedMatch(player.position) && userTurn ? 'need-match' : ''
                            }`}
                        onClick={() => handlePlayerClick(player)}
                        disabled={!userTurn}
                        title={player.summary}
                    >
                        <PositionIcon position={player.position} size={32} />
                        <span className="player-rank">#{player.id}</span>

                        <div className="player-info">
                            <span className="player-name">{player.name}</span>
                            <span className="player-school">{player.school}</span>
                        </div>

                        <span
                            className="position-badge"
                            title={POSITION_NAMES[player.position]}
                            style={{
                                backgroundColor: POSITION_COLORS[player.position] + '20',
                                color: POSITION_COLORS[player.position],
                                borderColor: POSITION_COLORS[player.position] + '40',
                            }}
                        >
                            {player.position}
                        </span>

                        {isNeedMatch(player.position) && userTurn && (
                            <span className="need-indicator" title="Matches team need">
                                ★
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirmPlayer && (
                <div className="confirm-overlay" onClick={handleCancel}>
                    <div
                        className="confirm-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Confirm Selection</h3>

                        <div className="confirm-player">
                            <span className="confirm-rank">#{confirmPlayer.id}</span>
                            <div className="confirm-details">
                                <span className="confirm-name">{confirmPlayer.name}</span>
                                <span
                                    className="position-badge"
                                    title={POSITION_NAMES[confirmPlayer.position]}
                                    style={{
                                        backgroundColor:
                                            POSITION_COLORS[confirmPlayer.position] + '20',
                                        color: POSITION_COLORS[confirmPlayer.position],
                                        borderColor:
                                            POSITION_COLORS[confirmPlayer.position] + '40',
                                    }}
                                >
                                    {confirmPlayer.position}
                                </span>
                            </div>
                            <span className="confirm-school">{confirmPlayer.school}</span>
                        </div>

                        <p className="confirm-summary">{confirmPlayer.summary}</p>

                        {isNeedMatch(confirmPlayer.position) && (
                            <div className="confirm-need-match">
                                ★ Fills a positional need
                            </div>
                        )}

                        <div className="confirm-actions">
                            <button className="btn-cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={handleConfirm}>
                                Draft Player
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
