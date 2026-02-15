'use client';

import { useEffect, useState } from 'react';
import { DraftPick, POSITION_COLORS, POSITION_NAMES, Position } from '@/types';
import PositionIcon from './PositionIcon';

interface PickAnimationProps {
    pick: DraftPick | null;
    visible: boolean;
    /** Duration in ms to show the card before auto-dismiss (default 2000) */
    displayDuration?: number;
}

/**
 * Floating pick-reveal card with a 3D flip entrance.
 * Appears at top-right when an AI team makes a pick,
 * shows the pick details with a timer bar, then hides.
 */
export default function PickAnimation({
    pick,
    visible,
    displayDuration = 2000,
}: PickAnimationProps) {
    const [timerRunning, setTimerRunning] = useState(false);

    useEffect(() => {
        if (visible) {
            // Small delay so the CSS transition catches the class change
            const t = setTimeout(() => setTimerRunning(true), 50);
            return () => clearTimeout(t);
        } else {
            setTimerRunning(false);
        }
    }, [visible]);

    if (!pick) return null;

    return (
        <div className={`pick-animation ${visible ? 'visible' : ''}`}>
            <div className="pick-animation-card">
                {/* Timer bar */}
                <div className="pick-animation-timer">
                    <div
                        className={`pick-animation-timer-fill ${timerRunning ? 'running' : ''}`}
                        style={
                            timerRunning
                                ? ({ animationDuration: `${displayDuration}ms` } as React.CSSProperties)
                                : undefined
                        }
                    />
                </div>

                {/* Header */}
                <div className="pick-animation-header">
                    <span className="pick-animation-round">
                        Round {pick.round} • Pick #{pick.pickNumber}
                    </span>
                </div>

                {/* Team */}
                <div
                    className="pick-animation-team"
                    style={{ borderColor: pick.team.color }}
                >
                    <span
                        className="pick-animation-dot"
                        style={{ backgroundColor: pick.team.color }}
                    />
                    {pick.team.name}
                </div>

                {/* "SELECTS" label */}
                <div className="pick-animation-selects">SELECTS</div>

                {/* Player */}
                <div className="pick-animation-player">
                    <PositionIcon position={pick.player.position} size={40} />
                    <div className="pick-animation-player-info">
                        <span className="pick-animation-name">
                            {pick.player.name}
                        </span>
                        <span
                            className="position-badge"
                            title={POSITION_NAMES[pick.player.position]}
                            style={{
                                backgroundColor:
                                    POSITION_COLORS[pick.player.position] + '20',
                                color: POSITION_COLORS[pick.player.position],
                                borderColor:
                                    POSITION_COLORS[pick.player.position] + '40',
                            }}
                        >
                            {pick.player.position}
                        </span>
                    </div>
                </div>

                <div className="pick-animation-school">
                    {pick.player.school}
                </div>

                {/* AI Reasoning */}
                {pick.reasoning && (
                    <div className="pick-animation-reasoning">
                        {pick.reasoning}
                    </div>
                )}
            </div>
        </div>
    );
}
