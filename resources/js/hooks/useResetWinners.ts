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
    success: ResetWinnersResult | null;
    resetWinners: (sorteoId: number | null) => Promise<void>;
}

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export function useResetWinners(): UseResetWinnersReturn {
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<ResetWinnersResult | null>(null);

    const resetWinners = async (sorteoId: number | null) => {
        setIsResetting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/sorteo/resetear-ganadores', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({ sorteo_id: sorteoId }),
            });

            const contentType = response.headers.get('content-type') ?? '';
            const isJson = contentType.includes('application/json');

            if (!response.ok) {
                const message = isJson
                    ? (await response.json()).error ?? 'Error al resetear los ganadores.'
                    : `Error ${response.status}: ${response.statusText}`;
                throw new Error(message);
            }

            const data: ResetWinnersResult = await response.json();
            setSuccess(data);
            router.reload();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Hubo un error al resetear los ganadores.');
        } finally {
            setIsResetting(false);
        }
    };

    return { isResetting, error, success, resetWinners };
}
