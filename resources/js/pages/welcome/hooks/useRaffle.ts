import { useState } from 'react';
import type { WinnerResult } from '../types';

interface UseRaffleReturn {
    isDrawing: boolean;
    winner: WinnerResult | null;
    showConfetti: boolean;
    handleDraw: () => Promise<void>;
    resetRaffle: () => void;
}

/**
 * Custom hook para manejar la lógica del sorteo
 * Separa la lógica de negocio de la presentación (SRP)
 */
export function useRaffle(): UseRaffleReturn {
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<WinnerResult | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const resetRaffle = () => {
        setWinner(null);
        setShowConfetti(false);
    };

    const handleDraw = async () => {
        setIsDrawing(true);
        setWinner(null);
        setShowConfetti(false);

        try {
            const response = await fetch('/api/sorteo/realizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al realizar el sorteo');
            }

            const data = await response.json();

            // Animación de espera para crear suspense
            await new Promise(resolve => setTimeout(resolve, 2500));

            setWinner(data);
            setShowConfetti(true);

            // Detener confetti después de 6 segundos
            setTimeout(() => setShowConfetti(false), 6000);
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Hubo un error al realizar el sorteo. Por favor, intenta de nuevo.');
        } finally {
            setIsDrawing(false);
        }
    };

    return {
        isDrawing,
        winner,
        showConfetti,
        handleDraw,
        resetRaffle,
    };
}
