'use client';

import { useCallback } from 'react';
import { teams } from '@/data/teams';
import { useDraft } from '@/context/DraftContext';
import { POSITION_COLORS, POSITION_NAMES, Position } from '@/types';
import TeamLogo from './TeamLogo';
import DraftShield from './DraftShield';

export default function TeamSelection() {
    const { selectTeam } = useDraft();

    // 3D tilt effect — track mouse position relative to card
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 12;
            const rotateX = ((centerY - y) / centerY) * 12;

            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;

            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty('--glare-x', `${glareX}%`);
            card.style.setProperty('--glare-y', `${glareY}%`);
        },
        []
    );

    const handleMouseLeave = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const card = e.currentTarget;
            card.style.transform = '';
        },
        []
    );

    return (
        <div className="team-selection">
            <div className="hero">
                <DraftShield size={90} />
                <div className="hero-badge">2026 NFL DRAFT</div>
                <h1 className="hero-title">Mock Draft Simulator</h1>
                <p className="hero-subtitle">
                    Select your team and compete against 6 AI-controlled GMs across 4
                    rounds. Draft from the top 30 prospects and build your roster.
                </p>
            </div>

            <div className="team-grid">
                {teams.map((team) => (
                    <button
                        key={team.id}
                        className="team-card"
                        onClick={() => selectTeam(team.id)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={
                            {
                                '--team-color': team.color,
                            } as React.CSSProperties
                        }
                    >
                        <div className="card-glare" />

                        <div className="team-card-header">
                            <span className="team-pick-badge">Pick #{team.id}</span>
                            <TeamLogo abbreviation={team.abbreviation} color={team.color} size={38} />
                        </div>

                        <h2 className="team-name">{team.name}</h2>

                        <div className="team-needs">
                            {team.needs.map((need) => (
                                <span
                                    key={need}
                                    className="need-badge"
                                    title={POSITION_NAMES[need as Position]}
                                    style={{
                                        backgroundColor:
                                            POSITION_COLORS[need as Position] + '25',
                                        color: POSITION_COLORS[need as Position],
                                        borderColor: POSITION_COLORS[need as Position] + '50',
                                    }}
                                >
                                    {need}
                                </span>
                            ))}
                        </div>

                        <p className="team-context">{team.context}</p>

                        <div className="team-card-cta">
                            <span>Draft for this team →</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
