'use client';

import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    type ReactNode,
} from 'react';

import {
    DraftState,
    DraftAction,
    DraftPick,
    TOTAL_TEAMS,
    TOTAL_PICKS,
} from '@/types';
import { players } from '@/data/players';
import { teams } from '@/data/teams';

// Helpers

export function getTeamForPick(pickIndex: number): number {
    return (pickIndex % TOTAL_TEAMS) + 1;
}

export function getRoundForPick(pickIndex: number): number {
    return Math.floor(pickIndex / TOTAL_TEAMS) + 1;
}

export function isUserTurn(state: DraftState): boolean {
    if (state.phase !== 'drafting' || state.userTeamId === null) return false;
    return getTeamForPick(state.currentPickIndex) === state.userTeamId;
}

export function getRemainingNeeds(
    teamId: number,
    draftedPlayers: DraftPick[]
): string[] {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return [];

    const draftedPositions = draftedPlayers
        .filter((dp) => dp.team.id === teamId)
        .map((dp) => dp.player.position);

    return team.needs.filter((need) => {
        // OL need can be filled by OT or OG
        if (need === 'OL') {
            return !draftedPositions.some((p) => p === 'OT' || p === 'OG' || p === 'OL');
        }
        return !draftedPositions.includes(need);
    });
}

// Initial State

const initialState: DraftState = {
    phase: 'team-select',
    userTeamId: null,
    currentPickIndex: 0,
    draftedPlayers: [],
    availablePlayers: [...players],
    isAiPicking: false,
    error: null,
};

// Reducer

function draftReducer(state: DraftState, action: DraftAction): DraftState {
    switch (action.type) {
        case 'SELECT_TEAM':
            return {
                ...state,
                phase: 'drafting',
                userTeamId: action.teamId
            };

        case 'MAKE_PICK': {
            const newDrafted = [...state.draftedPlayers, action.pick];
            const newAvailable = state.availablePlayers.filter(
                (p) => p.id !== action.pick.player.id
            );
            const nextPickIndex = state.currentPickIndex + 1;
            const isComplete = nextPickIndex >= TOTAL_PICKS;

            return {
                ...state,
                phase: isComplete ? 'complete' : 'drafting',
                currentPickIndex: nextPickIndex,
                draftedPlayers: newDrafted,
                availablePlayers: newAvailable,
                isAiPicking: false,
                error: null,
            };
        }
        case 'SET_AI_PICKING':
            return {
                ...state,
                isAiPicking: action.isPicking,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.error,
                isAiPicking: false,
            };

        case 'RESET_DRAFT':
            return { ...initialState };

        default:
            return state;
    }
}

// Context

interface DraftContextValue {
    state: DraftState;
    dispatch: React.Dispatch<DraftAction>;
    selectTeam: (teamId: number) => void;
    makeUserPick: (playerId: number) => void;
    resetDraft: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(draftReducer, initialState);

    const selectTeam = useCallback(
        (teamId: number) => {
            dispatch({ type: 'SELECT_TEAM', teamId });
        },
        [dispatch]
    );

    const makeUserPick = useCallback(
        (playerId: number) => {
            const player = state.availablePlayers.find((p) => p.id === playerId);
            if (!player || !state.userTeamId) return;

            const team = teams.find((t) => t.id === state.userTeamId)!;
            const pick: DraftPick = {
                pickNumber: state.currentPickIndex + 1,
                round: getRoundForPick(state.currentPickIndex),
                team,
                player,
                isUserPick: true,
            };

            dispatch({ type: 'MAKE_PICK', pick });
        },
        [state.availablePlayers, state.userTeamId, state.currentPickIndex]
    );

    const resetDraft = useCallback(() => {
        dispatch({ type: 'RESET_DRAFT' });
    }, [dispatch]);

    return (
        <DraftContext.Provider
            value={{ state, dispatch, selectTeam, makeUserPick, resetDraft }}
        >
            {children}
        </DraftContext.Provider>
    );
}

export function useDraft(): DraftContextValue {
    const context = useContext(DraftContext);
    if (!context) {
        throw new Error('useDraft must be used within a DraftProvider');
    }
    return context;
}
