import type { WinnerResult } from '../types';

interface WinnerCardProps {
    winner: WinnerResult;
    onClose: () => void;
}

/**
 * Pantalla completa de ganador — optimizada para proyectores y pantallas LED.
 * Ocupa el 100% del viewport con el mismo gradiente de la página para una
 * transición fluida. Toda la tipografía usa unidades vmin para escalar
 * correctamente en cualquier resolución de pantalla.
 */
export function WinnerCard({ winner, onClose }: WinnerCardProps) {
    const fechaFormateada = new Date(winner.timestamp).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700"
            style={{ background: 'linear-gradient(135deg, #063565 0%, #084B8A 25%, #042242 50%, #084B8A 75%, #063565 100%)' }}
        >
            {/* Barra dorada superior */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />

            {/* Botón cerrar */}
            <button
                onClick={onClose}
                className="absolute top-6 right-8 z-10 text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '3vmin', height: '3vmin' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span style={{ fontSize: 'clamp(0.75rem, 1.5vmin, 1.25rem)' }}>Nuevo sorteo</span>
            </button>

            {/* Contenido principal */}
            <div className="flex flex-col items-center justify-center text-center px-8 w-full">

                {/* Trofeo + título */}
                <div className="mb-4 animate-bounce">
                    <span style={{ fontSize: 'clamp(3rem, 10vmin, 10rem)', lineHeight: 1 }}>🏆</span>
                </div>

                <h2
                    className="font-black uppercase tracking-widest leading-none mb-6"
                    style={{
                        fontSize: 'clamp(1.5rem, 6vmin, 6rem)',
                        background: 'linear-gradient(135deg, #FDE68A, #FFD700, #FDE68A)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'Playfair Display, serif',
                        textShadow: 'none',
                    }}
                >
                    ¡Cartón Ganador!
                </h2>

                {/* Número de cartón — elemento principal */}
                <div className="mb-6">
                    <p
                        className="text-white/50 uppercase tracking-[0.4em] font-bold mb-1"
                        style={{ fontSize: 'clamp(0.75rem, 2vmin, 2rem)' }}
                    >
                        Número de Cartón
                    </p>
                    <p
                        className="font-black text-white leading-none"
                        style={{
                            fontSize: 'clamp(4rem, 22vmin, 22rem)',
                            textShadow: '0 0 60px rgba(255,215,0,0.4), 0 0 120px rgba(255,215,0,0.2)',
                        }}
                    >
                        {winner.carton_number}
                    </p>
                </div>

                {/* Nombre del ganador y premio */}
                {winner.winner && (
                    <div className="mb-4 space-y-1">
                        <p
                            className="text-white font-bold leading-tight"
                            style={{ fontSize: 'clamp(1.25rem, 4.5vmin, 5rem)' }}
                        >
                            {winner.winner.full_name}
                        </p>
                        {winner.winner.location && (
                            <p
                                className="text-white/60 font-medium"
                                style={{ fontSize: 'clamp(0.875rem, 2vmin, 2rem)' }}
                            >
                                {winner.winner.location}{winner.winner.province ? `, ${winner.winner.province}` : ''}
                            </p>
                        )}
                    </div>
                )}

                {/* Premio */}
                <p
                    className="text-yellow-300 font-bold mb-6"
                    style={{ fontSize: 'clamp(1rem, 3.5vmin, 4rem)' }}
                >
                    {winner.premio}
                    <span className="text-white/50 font-normal ml-3" style={{ fontSize: '0.6em' }}>
                        · {winner.posicion_sorteo}º premio
                    </span>
                </p>

                {/* Advertencia múltiples ganadores */}
                {winner.total_ganadores > 1 && (
                    <div className="mb-4 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-6 py-2 animate-pulse">
                        <span className="text-yellow-300 font-bold" style={{ fontSize: 'clamp(0.75rem, 1.8vmin, 1.5rem)' }}>
                            ⚠️ {winner.total_ganadores} personas comparten este cartón
                        </span>
                    </div>
                )}

                {/* Fecha */}
                <p
                    className="text-white/40 font-medium"
                    style={{ fontSize: 'clamp(0.75rem, 1.5vmin, 1.25rem)' }}
                >
                    📅 {fechaFormateada}
                </p>
            </div>

            {/* Barra dorada inferior */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />
        </div>
    );
}
