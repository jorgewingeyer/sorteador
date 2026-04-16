/**
 * Footer de la página
 */
export function Footer() {
    return (
        <footer className="relative z-10 flex justify-center pb-4 pt-2">
            <div
                className="inline-block backdrop-blur-md rounded-full px-8 py-2.5"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
                <p className="text-sm font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Sistema de Sorteo · Lotería Chaqueña
                </p>
            </div>
        </footer>
    );
}
