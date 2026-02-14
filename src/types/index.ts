// Position Types 

export type Position =
    | 'QB'
    | 'WR'
    | 'OT'
    | 'EDGE'
    | 'CB'
    | 'DT'
    | 'S'
    | 'LB'
    | 'TE'
    | 'RB'
    | 'OG'
    | 'OL'; // (covers OT + OG)

// Core Data Models

export interface Player {
    id: number;
    name: string;
    position: Position;
    school: string;
    summary: string;
}

export interface Team {
    id: number;
    name: string;
    abbrevation: string;
    needs: Position[];
    context: string;
    color: string
}

// Draft State

export type DraftPhase = 'team-select' | 'drafting' | 'complete';

export interface DraftPick {
    pickNumber: number;
    round: number;
    team: Team;
    player: Player;
    reasoning?: string;
    isUserPick: boolean;
}

export interface DraftState {
    phase: DraftPhase;
    userTeamId: number | null;
    currentPickIndex: number;
    draftedPlayers: DraftPick[];
    availablePlayers: Player[];
    isAiPicking: boolean;
    error: string | null;
}

// Reducer Actions

export type DraftAction =
    | { type: 'SELECT_TEAM'; teamId: number }
    | { type: 'MAKE_PICK'; pick: DraftPick }
    | { type: 'SET_AI_PICKING'; isPicking: boolean }
    | { type: 'SET_ERROR'; error: string | null }
    | { type: 'RESET_DRAFT' };


// API Types

export interface AiPickRequest {
    team: {
        name: string;
        needs: Position[];
        context: string;
    };
    availablePlayers: Player[];
    round: number;
    pickNumber: number;
    draftHistory: Array<{
        teamName: string;
        playerName: string;
        position: Position;
    }>;
}

export interface AiPickResponse {
    playerId: number;
    reasoning: string;
    isFallback: boolean;
}

// Utility Constants

export const TOTAL_TEAMS = 7;
export const TOTAL_ROUNDS = 4;
export const TOTAL_PICKS = TOTAL_TEAMS * TOTAL_ROUNDS; // 28

export const POSITION_COLORS: Record<Position, string> = {
    QB: '#e74c3c',
    WR: '#3498db',
    OT: '#e67e22',
    EDGE: '#9b59b6',
    CB: '#1abc9c',
    DT: '#e74c3c',
    S: '#f39c12',
    LB: '#2ecc71',
    TE: '#e91e63',
    RB: '#00bcd4',
    OG: '#ff9800',
    OL: '#e67e22',
};

export const POSITION_NAMES: Record<Position, string> = {
    QB: 'Quarterback',
    WR: 'Wide Receiver',
    OT: 'Offensive Tackle',
    EDGE: 'Edge Rusher',
    CB: 'Cornerback',
    DT: 'Defensive Tackle',
    S: 'Safety',
    LB: 'Linebacker',
    TE: 'Tight End',
    RB: 'Running Back',
    OG: 'Offensive Guard',
    OL: 'Offensive Line',
};