import { useState } from 'react';
import type { WinnerResult } from '../types';
import { playCountdownSound, stopCountdownAudio } from '../utils/sounds';
import apiSorteo from '@/routes/api/sorteo';

interface UseRaffleReturn {
    isDrawing: boolean;
    winner: WinnerResult | null;
    showConfetti: boolean;
    countdown: number | null;
    handleDraw: () => Promise<void>;
    handleDrawWithResult: (result: WinnerResult) => Promise<void>;
    resetRaffle: () => void;
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Custom hook para manejar la lógica del sorteo.
 * La llamada a la API se dispara al mismo tiempo que la cuenta regresiva
 * para evitar esperas adicionales una vez que termina el conteo.
 */
export function useRaffle(instanciaSorteoId?: number | null): UseRaffleReturn {
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<WinnerResult | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const resetRaffle = () => {
        setWinner(null);
        setShowConfetti(false);
    };

    const runDrawAnimation = async (resolveWinner: () => Promise<WinnerResult>) => {
        if (isDrawing) return;

        setIsDrawing(true);
        setWinner(null);
        setShowConfetti(false);

        try {
            // Cuenta regresiva: 3 → 2 → 1 → 0 (¡YA!)
            for (let i = 3; i >= 0; i--) {
                setCountdown(i);
                playCountdownSound(i);
                await sleep(i === 0 ? 700 : 1000);
            }
            setCountdown(null);

            const result = await resolveWinner();

            setWinner(result);
            setShowConfetti(true);

            setTimeout(() => setShowConfetti(false), 6000);
        } catch (error) {
            stopCountdownAudio();
            console.error('Error:', error);
            const message = error instanceof Error ? error.message : 'Hubo un error al realizar el sorteo. Por favor, intenta de nuevo.';
            alert(message);
        } finally {
            setIsDrawing(false);
            setCountdown(null);
        }
    };

    const handleDraw = async () => {
        if (!instanciaSorteoId) {
            alert('No hay sorteo activo disponible.');
            return;
        }

        await runDrawAnimation(async () => {
            const response = await fetch(apiSorteo.realizar.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ instancia_sorteo_id: instanciaSorteoId }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.error ?? payload.message ?? 'Error al realizar el sorteo');
            }

            return payload as WinnerResult;
        });
    };

    const handleDrawWithResult = async (result: WinnerResult) => {
        await runDrawAnimation(async () => result);
    };

    return {
        isDrawing,
        winner,
        showConfetti,
        countdown,
        handleDraw,
        handleDrawWithResult,
        resetRaffle,
    };
}
