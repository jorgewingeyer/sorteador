interface ConfettiProps {
    show: boolean;
}

const CONFETTI_COLORS = ['#FFD700', '#FFA500', '#FF4500', '#DC143C', '#FFFFFF'];
const CONFETTI_COUNT = 150;

/**
 * Componente de confetti animado
 * Responsabilidad única: mostrar efecto visual de celebración
 */
export function Confetti({ show }: ConfettiProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                        animationDelay: `${Math.random() * 2}s`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                />
            ))}
        </div>
    );
}
