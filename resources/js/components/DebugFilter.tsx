import { useEffect } from 'react';

interface DebugFilterProps {
    ganadorStatus: string;
    query: Record<string, any>;
}

/**
 * Componente de debug para verificar filtros
 * Solo para desarrollo - remover en producción
 */
export function DebugFilter({ ganadorStatus, query }: DebugFilterProps) {
    useEffect(() => {
        console.group('🔍 Debug Filter');
        console.log('ganadorStatus state:', ganadorStatus);
        console.log('query params:', query);
        console.log('ganador_status en query:', query.ganador_status);
        console.groupEnd();
    }, [ganadorStatus, query]);

    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
            <div className="font-bold mb-2">🔍 Debug Filtro Ganadores</div>
            <div>Estado: <span className="text-yellow-300">{ganadorStatus || '(vacío)'}</span></div>
            <div>En query: <span className="text-green-300">{query.ganador_status || '(no enviado)'}</span></div>
            <div className="mt-2 text-gray-400">
                Query completo: {JSON.stringify(query, null, 2)}
            </div>
        </div>
    );
}
