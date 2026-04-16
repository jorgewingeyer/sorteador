import { useState } from 'react';
import type { WinnerResult } from '../types';
import { playCountdownSound, stopCountdownAudio } from '../utils/sounds';

interface UseRaffleReturn {
    isDrawing: boolean;
    winner: WinnerResult | null;
    showConfetti: boolean;
    countdown: number | null;
    handleDraw: () => Promise<void>;
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

    const handleDraw = async () => {
        if (!instanciaSorteoId) {
            alert('No hay sorteo activo disponible.');
            return;
        }

        setIsDrawing(true);
        setWinner(null);
        setShowConfetti(false);

        // Disparar la API de forma concurrente con la cuenta regresiva
        const apiPromise = fetch('/api/sorteo/realizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ instancia_sorteo_id: instanciaSorteoId }),
        });

        try {
            // Cuenta regresiva: 3 → 2 → 1 → 0 (¡YA!)
            for (let i = 3; i >= 0; i--) {
                setCountdown(i);
                playCountdownSound(i);
                await sleep(i === 0 ? 700 : 1000);
            }
            setCountdown(null);

            // Esperar el resultado de la API (generalmente ya llegó durante el conteo)
            const response = await apiPromise;

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? errorData.message ?? 'Error al realizar el sorteo');
            }

            const data: WinnerResult = await response.json();

            setWinner(data);
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

    return {
        isDrawing,
        winner,
        showConfetti,
        countdown,
        handleDraw,
        resetRaffle,
    };
}
