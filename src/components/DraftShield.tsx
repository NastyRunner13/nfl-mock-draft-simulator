'use client';

interface DraftShieldProps {
    size?: number;
}

/**
 * NFL Draft–style shield logo for branding.
 * A golden/bronze shield with "DRAFT" text + year.
 */
export default function DraftShield({ size = 80 }: DraftShieldProps) {
    return (
        <div className="draft-shield" style={{ width: size, height: size * 1.15 }}>
            <svg
                width={size}
                height={size * 1.15}
                viewBox="0 0 80 92"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="shield-grad" x1="0" y1="0" x2="0.5" y2="1">
                        <stop offset="0%" stopColor="#c9a84c" />
                        <stop offset="40%" stopColor="#f0d78c" />
                        <stop offset="60%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#8b6914" />
                    </linearGradient>
                    <linearGradient id="inner-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a1a2e" />
                        <stop offset="100%" stopColor="#0d0d1a" />
                    </linearGradient>
                    <filter id="shield-shadow">
                        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Outer shield */}
                <path
                    d="M40 2 L76 14 L76 44 C76 64 60 80 40 90 C20 80 4 64 4 44 L4 14 Z"
                    fill="url(#shield-grad)"
                    filter="url(#shield-shadow)"
                />

                {/* Inner shield */}
                <path
                    d="M40 8 L70 18 L70 44 C70 60 57 74 40 83 C23 74 10 60 10 44 L10 18 Z"
                    fill="url(#inner-grad)"
                />

                {/* Gold border accent */}
                <path
                    d="M40 8 L70 18 L70 44 C70 60 57 74 40 83 C23 74 10 60 10 44 L10 18 Z"
                    fill="none"
                    stroke="#c9a84c"
                    strokeWidth="0.5"
                />

                {/* Top stars */}
                <circle cx="30" cy="23" r="1.5" fill="#c9a84c" />
                <circle cx="40" cy="20" r="2" fill="#f0d78c" />
                <circle cx="50" cy="23" r="1.5" fill="#c9a84c" />

                {/* NFL text */}
                <text
                    x="40"
                    y="38"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#c9a84c"
                    fontSize="8"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="3"
                >
                    NFL
                </text>

                {/* Divider line */}
                <line x1="20" y1="43" x2="60" y2="43" stroke="#c9a84c" strokeWidth="0.8" />

                {/* DRAFT text */}
                <text
                    x="40"
                    y="54"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="2"
                >
                    DRAFT
                </text>

                {/* Year */}
                <text
                    x="40"
                    y="68"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#c9a84c"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="1.5"
                >
                    2026
                </text>

                {/* Bottom football icon */}
                <ellipse cx="40" cy="76" rx="4" ry="2.5" fill="none" stroke="#c9a84c" strokeWidth="0.6" />
                <line x1="38" y1="76" x2="42" y2="76" stroke="#c9a84c" strokeWidth="0.4" />
            </svg>
        </div>
    );
}
