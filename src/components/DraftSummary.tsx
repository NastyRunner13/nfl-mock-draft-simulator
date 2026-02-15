'use client';

import { useEffect, useState } from 'react';
import { POSITION_COLORS, POSITION_NAMES, Position } from '@/types';
import { useDraft } from '@/context/DraftContext';
import { teams } from '@/data/teams';
import DraftShield from './DraftShield';
import TeamLogo from './TeamLogo';
import PositionIcon from './PositionIcon';

interface DraftGrade {
    teamName: string;
    grade: string;
    analysis: string;
}

export default function DraftSummary() {
    const { state, resetDraft } = useDraft();
    const [grades, setGrades] = useState<DraftGrade[]>([]);
    const [gradesLoading, setGradesLoading] = useState(true);

    const undraftedPlayers = state.availablePlayers;

    // Fetch draft grades on mount
    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const teamsData = teams.map((team) => {
                    const teamPicks = state.draftedPlayers.filter(
                        (p) => p.team.id === team.id
                    );
                    return {
                        teamName: team.name,
                        needs: team.needs,
                        context: team.context,
                        picks: teamPicks.map((p) => ({
                            round: p.round,
                            playerName: p.player.name,
                            position: p.player.position,
                            rankOnBoard: p.player.id,
                        })),
                    };
                });

                const response = await fetch('/api/draft/grade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teams: teamsData }),
                });

                if (!response.ok) throw new Error('Failed to fetch grades');

                const data = await response.json();
                setGrades(data.grades);
            } catch (error) {
                console.error('Failed to fetch draft grades:', error);
            } finally {
                setGradesLoading(false);
            }
        };

        fetchGrades();
    }, [state.draftedPlayers]);

    const getGradeColor = (grade: string): string => {
        if (grade.startsWith('A')) return '#10b981';
        if (grade.startsWith('B')) return '#6366f1';
        if (grade.startsWith('C')) return '#f59e0b';
        if (grade.startsWith('D')) return '#ef4444';
        return '#6b7280';
    };

    const getGradeForTeam = (teamName: string): DraftGrade | undefined => {
        return grades.find((g) => g.teamName === teamName);
    };

    return (
        <div className="draft-summary">
            <div className="summary-hero">
                <DraftShield size={100} />
                <div className="summary-badge">DRAFT COMPLETE</div>
                <h1>2026 NFL Mock Draft Results</h1>
                <p className="summary-subtitle">
                    4 rounds • 28 picks • {undraftedPlayers.length} players remaining on
                    the board
                </p>
            </div>

            <div className="summary-grid">
                {teams.map((team) => {
                    const teamPicks = state.draftedPlayers.filter(
                        (p) => p.team.id === team.id
                    );
                    const isUserTeam = team.id === state.userTeamId;
                    const teamGrade = getGradeForTeam(team.name);

                    return (
                        <div
                            key={team.id}
                            className={`summary-team-card ${isUserTeam ? 'user-team' : ''
                                }`}
                            style={{ '--team-color': team.color } as React.CSSProperties}
                        >
                            <div className="summary-team-header">
                                <TeamLogo abbreviation={team.abbreviation} color={team.color} size={36} />
                                <span className="summary-team-name">{team.name}</span>
                                {isUserTeam && (
                                    <span className="user-team-label">YOUR TEAM</span>
                                )}
                            </div>

                            {/* Draft Grade */}
                            {teamGrade && (
                                <div className="draft-grade">
                                    <span
                                        className="grade-letter"
                                        style={{ color: getGradeColor(teamGrade.grade) }}
                                    >
                                        {teamGrade.grade}
                                    </span>
                                    <p className="grade-analysis">{teamGrade.analysis}</p>
                                </div>
                            )}

                            {gradesLoading && (
                                <div className="grade-loading">
                                    <div className="grade-shimmer" />
                                </div>
                            )}

                            <div className="summary-picks">
                                {teamPicks.map((pick) => (
                                    <div key={pick.pickNumber} className="summary-pick">
                                        <PositionIcon position={pick.player.position} size={28} />
                                        <span className="summary-pick-round">
                                            R{pick.round}
                                        </span>
                                        <span className="summary-pick-player">
                                            {pick.player.name}
                                        </span>
                                        <span
                                            className="position-badge-sm"
                                            title={POSITION_NAMES[pick.player.position as Position]}
                                            style={{
                                                backgroundColor:
                                                    POSITION_COLORS[
                                                    pick.player.position as Position
                                                    ] + '15',
                                                color:
                                                    POSITION_COLORS[
                                                    pick.player.position as Position
                                                    ],
                                            }}
                                        >
                                            {pick.player.position}
                                        </span>
                                        <span className="summary-pick-school">
                                            {pick.player.school}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {undraftedPlayers.length > 0 && (
                <div className="undrafted-section">
                    <h3>Remaining on the Board</h3>
                    <div className="undrafted-list">
                        {undraftedPlayers.map((player) => (
                            <div key={player.id} className="undrafted-player">
                                <PositionIcon position={player.position} size={26} />
                                <span className="undrafted-rank">#{player.id}</span>
                                <span className="undrafted-name">{player.name}</span>
                                <span
                                    className="position-badge-sm"
                                    title={POSITION_NAMES[player.position]}
                                    style={{
                                        backgroundColor:
                                            POSITION_COLORS[player.position] + '15',
                                        color: POSITION_COLORS[player.position],
                                    }}
                                >
                                    {player.position}
                                </span>
                                <span className="undrafted-school">{player.school}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="summary-actions">
                <button className="btn-new-draft" onClick={resetDraft}>
                    Start New Draft
                </button>
            </div>
        </div>
    );
}
