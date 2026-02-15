'use client';

interface TeamLogoProps {
    abbreviation: string;
    color: string;
    size?: number;
    className?: string;
}

/**
 * Renders a stylized team monogram emblem — a shield-shaped badge
 * with the team abbreviation, using the team's primary color.
 */
export default function TeamLogo({
    abbreviation,
    color,
    size = 48,
    className = '',
}: TeamLogoProps) {
    const fontSize = size * 0.32;
    const darkColor = darkenHex(color, 0.25);

    return (
        <div
            className={`team-logo ${className}`}
            style={{
                width: size,
                height: size,
                minWidth: size,
                minHeight: size,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Shield shape */}
                <defs>
                    <linearGradient id={`grad-${abbreviation}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={darkColor} />
                    </linearGradient>
                    <filter id={`shadow-${abbreviation}`}>
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
                    </filter>
                </defs>

                {/* Shield body */}
                <path
                    d="M24 2 L44 10 L44 26 C44 36 35 44 24 46 C13 44 4 36 4 26 L4 10 Z"
                    fill={`url(#grad-${abbreviation})`}
                    filter={`url(#shadow-${abbreviation})`}
                />

                {/* Inner highlight */}
                <path
                    d="M24 5 L41 12 L41 26 C41 34.5 33 41.5 24 43.5 C15 41.5 7 34.5 7 26 L7 12 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                />

                {/* Top accent line */}
                <path
                    d="M12 12 L36 12"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                />

                {/* Abbreviation text */}
                <text
                    x="24"
                    y="29"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={fontSize}
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="0.5"
                >
                    {abbreviation}
                </text>

                {/* Small star at top */}
                <polygon
                    points="24,7 25,9 27,9 25.5,10.5 26,12.5 24,11 22,12.5 22.5,10.5 21,9 23,9"
                    fill="rgba(255,255,255,0.5)"
                />
            </svg>
        </div>
    );
}

/** Darken a hex color by a factor (0–1) */
function darkenHex(hex: string, factor: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const r = Math.round(rgb.r * (1 - factor));
    const g = Math.round(rgb.g * (1 - factor));
    const b = Math.round(rgb.b * (1 - factor));
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}
