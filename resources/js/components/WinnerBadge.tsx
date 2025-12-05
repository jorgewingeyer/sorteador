interface WinnerBadgeProps {
    ganadorEn: number | null;
}

/**
 * Componente reutilizable para mostrar el estado de ganador
 * Responsabilidad única: Renderizar badge con posición del sorteo (SRP)
 */
export function WinnerBadge({ ganadorEn }: WinnerBadgeProps) {
    console.log(ganadorEn);
    if (!ganadorEn) {
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                --
            </span>
        );
    }

    return (
        <span 
            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
            title={`Ganador #${ganadorEn}`}
        >
            <span className="text-base">🏆</span>
            <span>#{ganadorEn}</span>
        </span>
    );
}
