interface CountdownOverlayProps {
    value: number | null;
}

/**
 * Pantalla completa de cuenta regresiva — optimizada para proyectores.
 * Se muestra sobre todo el contenido durante los segundos previos al sorteo.
 * El número se remonta con un animKey para re-disparar la animación de entrada en cada tick.
 */
export function CountdownOverlay({ value }: CountdownOverlayProps) {
    if (value === null) return null;

    const isGo = value === 0;
    const displayText = isGo ? '¡YA!' : String(value);

    return (
        <div
            className="fixed inset-0 z-[55] flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #063565 0%, #084B8A 25%, #042242 50%, #084B8A 75%, #063565 100%)' }}
        >
            {/* El key fuerza el remontaje en cada cambio de valor, re-disparando la animación */}
            <div key={value} className="animate-in zoom-in-75 fade-in duration-300 flex flex-col items-center gap-4">
                <span
                    style={{
                        fontSize: 'clamp(10rem, 45vmin, 45rem)',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 900,
                        lineHeight: 1,
                        color: isGo ? '#FFD700' : 'white',
                        textShadow: isGo
                            ? '0 0 100px rgba(255,215,0,0.6), 0 0 200px rgba(255,215,0,0.3)'
                            : '0 0 80px rgba(255,255,255,0.35)',
                    }}
                >
                    {displayText}
                </span>

                {!isGo && (
                    <p
                        className="text-white/40 uppercase tracking-[0.5em] font-bold"
                        style={{ fontSize: 'clamp(0.75rem, 2vmin, 1.75rem)' }}
                    >
                        Preparando sorteo...
                    </p>
                )}

                {isGo && (
                    <p
                        className="text-yellow-300/80 uppercase tracking-[0.4em] font-bold"
                        style={{ fontSize: 'clamp(0.875rem, 2.5vmin, 2rem)' }}
                    >
                        ¡Sorteo en curso!
                    </p>
                )}
            </div>
        </div>
    );
}
