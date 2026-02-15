'use client';

import { Position, POSITION_COLORS } from '@/types';

interface PositionIconProps {
    position: Position | string;
    size?: number;
}

/**
 * Position-based SVG silhouette icon. Shows a stylized player
 * silhouette based on their position group.
 */
export default function PositionIcon({ position, size = 36 }: PositionIconProps) {
    const color = POSITION_COLORS[position as Position] || '#6b7280';
    const bgColor = color + '12';

    const getPath = (): string => {
        switch (position) {
            case 'QB':
                // Quarterback throwing
                return 'M18 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 14h12c2 0 4 2 4 4v4l-4 2 4 6h-4l-3-5-1 5H12l-1-5-3 5H4l4-6-4-2v-4c0-2 2-4 4-4z';
            case 'WR':
                // Wide receiver catching
                return 'M18 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM9 13h10c2 0 3 1.5 3 3.5v3l2-1 2 2-4 3v2l1 5h-3l-1-4-1 4h-3l-1-4-1 4H9l1-5v-2l-4-3 2-2 2 1v-3c0-2 1-3.5 3-3.5z';
            case 'RB':
                // Running back
                return 'M18 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM9 14h10c2 0 3 2 3 4v3l-2 3 2 6h-4l-2-5-2 5h-4l2-6-2-3v-3c0-2 1-4 3-4z';
            case 'TE':
                // Tight end blocking
                return 'M18 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM7 13h14c2 0 3 2 3 4v4h-3v-2h-2v8h-3v-8h-2v8h-3v-8H9v2H6v-4c0-2 1-4 3-4z';
            case 'OT':
            case 'OG':
            case 'OL':
                // Offensive lineman (wider stance)
                return 'M19 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM6 14h16c2 0 3 2 3 4v5h-3v-3h-2v10h-4V20h-4v10H8V20H6v3H3v-5c0-2 1-4 3-4z';
            case 'EDGE':
                // Edge rusher sprinting
                return 'M17 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM8 12h12c2 0 3 2 3 4v3l3-1v3l-3 1v2l2 6h-4l-2-5-1 5h-3l-1-5-2 5H8l2-6v-2l-3-1v-3l3 1v-3c0-2 1-4 3-4z';
            case 'CB':
                // Cornerback in coverage
                return 'M18 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM10 12h8c2 0 3 2 3 4v2l2 1v3l-2-1v3l1 6h-3l-1-5-1 5h-3l-1-5-1 5H9l1-6v-3l-2 1v-3l2-1v-2c0-2 1-4 3-4z';
            case 'S':
                // Safety
                return 'M18 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM9 13h10c2 0 3 2 3 4v3l1 2-2 2-2-2v2l1 6h-3l-1-5-2 5h-4l1-6v-2l-2 2-2-2 1-2v-3c0-2 1-4 3-4z';
            case 'LB':
                // Linebacker
                return 'M19 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM7 13h14c2 0 3 2 3 4v4l-3 1v2l2 6h-4l-2-5-1 5h-4l-1-5-2 5H5l2-6v-2l-3-1v-4c0-2 1-4 3-4z';
            case 'DT':
                // Defensive tackle (big stance)
                return 'M20 7a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM5 15h18c2 0 3 2 3 4v5h-3v-3h-3v10h-4V21h-4v10H8V21H5v3H2v-5c0-2 1-4 3-4z';
            default:
                // Generic player
                return 'M18 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 14h12c2 0 4 2 4 4v4h-4v8h-3v-8h-2v8h-3v-8H8v-4c0-2 2-4 4-4z';
        }
    };

    return (
        <div
            className="position-icon"
            style={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius: '50%',
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <svg
                width={size * 0.65}
                height={size * 0.65}
                viewBox="0 0 28 30"
                fill={color}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d={getPath()} fillOpacity="0.7" />
            </svg>
        </div>
    );
}
