import { useState } from 'react';
import { router } from '@inertiajs/react';

interface ResetWinnersResult {
    message: string;
    ganadores_reseteados: number;
    sorteo_id: number | null;
    participantes_disponibles: number;
}

interface UseResetWinnersReturn {
    isResetting: boolean;
    error: string | null;
    resetWinners: (sorteoId: number | null) => Promise<void>;
}

/**
 * Custom hook para resetear ganadores
 * Encapsula la lógica de negocio siguiendo SRP
 */
export function useResetWinners(): UseResetWinnersReturn {
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetWinners = async (sorteoId: number | null) => {
        setIsResetting(true);
        setError(null);

        try {
            const response = await fetch('/sorteo/resetear-ganadores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ sorteo_id: sorteoId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al resetear ganadores');
            }

            const data: ResetWinnersResult = await response.json();

            // Mostrar mensaje de éxito
            alert(data.message);

            // Recargar la página para actualizar los datos
            router.reload();
        } catch (err: any) {
            const errorMessage = err.message || 'Hubo un error al resetear los ganadores';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsResetting(false);
        }
    };

    return {
        isResetting,
        error,
        resetWinners,
    };
}
