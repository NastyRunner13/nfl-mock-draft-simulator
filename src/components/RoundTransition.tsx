'use client';

import { useEffect, useState } from 'react';

interface RoundTransitionProps {
    round: number;
    onComplete: () => void;
}

/**
 * Full-screen 3D pop overlay that announces a new round.
 * Shows "ROUND X" with a dramatic 3D flip-and-scale animation,
 * then auto-dismisses after 1.8 seconds.
 */
export default function RoundTransition({ round, onComplete }: RoundTransitionProps) {
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const showTimer = setTimeout(() => setAnimating(true), 50);
        const hideTimer = setTimeout(() => {
            setAnimating(false);
            setTimeout(onComplete, 400); // Wait for exit animation
        }, 1800);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [onComplete]);

    return (
        <div className={`round-transition-overlay ${animating ? 'active' : ''}`}>
            <div className={`round-transition-card ${animating ? 'pop-in' : 'pop-out'}`}>
                <div className="round-transition-label">ROUND</div>
                <div className="round-transition-number">{round}</div>
                <div className="round-transition-subtitle">
                    {round === 1 && 'The Draft Begins'}
                    {round === 2 && 'Second Round'}
                    {round === 3 && 'Third Round'}
                    {round === 4 && 'Final Round'}
                </div>
            </div>
        </div>
    );
}
