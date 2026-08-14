import type { WinnerResult } from '../types';

const DRAW_EXECUTED_STORAGE_KEY = 'sorteador:draw-executed';

export interface DrawExecutedPayload {
    instanciaSorteoId: number;
    winner: WinnerResult;
    triggeredAt: string;
}

export const broadcastDrawExecuted = (payload: DrawExecutedPayload): void => {
    if (typeof window === 'undefined') return;

    const serializedPayload = JSON.stringify(payload);
    window.localStorage.setItem(DRAW_EXECUTED_STORAGE_KEY, serializedPayload);
    window.localStorage.removeItem(DRAW_EXECUTED_STORAGE_KEY);
};

export const subscribeToDrawExecuted = (handler: (payload: DrawExecutedPayload) => void): (() => void) => {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const onStorage = (event: StorageEvent) => {
        if (event.key !== DRAW_EXECUTED_STORAGE_KEY || !event.newValue) return;

        try {
            const parsedPayload = JSON.parse(event.newValue) as DrawExecutedPayload;
            handler(parsedPayload);
        } catch (error) {
            console.error('Invalid draw sync payload:', error);
        }
    };

    window.addEventListener('storage', onStorage);

    return () => {
        window.removeEventListener('storage', onStorage);
    };
};
