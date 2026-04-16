interface DrawButtonProps {
    onClick: () => void;
    isDrawing: boolean;
    isAuthenticated?: boolean;
}

/**
 * Botón principal de sorteo — optimizado para proyectores (unidades vmin)
 */
export function DrawButton({ onClick, isDrawing, isAuthenticated }: DrawButtonProps) {
    if (!isAuthenticated) return null;

    return (
        <div className="flex justify-center mb-8">
            <button
                onClick={onClick}
                disabled={isDrawing}
                className={`
                    relative group shine-effect
                    font-black rounded-2xl
                    transition-all duration-300
                    transform hover:scale-105 active:scale-95
                    ${isDrawing
                        ? 'bg-gray-500 cursor-not-allowed opacity-70'
                        : 'gold-gradient pulse-gold hover:shadow-2xl'
                    }
                    disabled:opacity-70
                    text-gray-900
                `}
                style={{
                    fontSize: 'clamp(1.5rem, 4vmin, 4rem)',
                    padding: 'clamp(1rem, 3vmin, 3rem) clamp(2rem, 8vmin, 8rem)',
                    border: '0.4vmin solid #ca8a04',
                    fontFamily: 'Montserrat, sans-serif',
                }}
            >
                {isDrawing ? (
                    <span className="flex items-center gap-4">
                        <svg
                            className="animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            style={{ width: '5vmin', height: '5vmin' }}
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        SORTEANDO...
                    </span>
                ) : (
                    <span>REALIZAR SORTEO</span>
                )}
            </button>
        </div>
    );
}
