/**
 * Footer de la página
 * Responsabilidad única: mostrar información del pie de página
 */
export function Footer() {
    return (
        <footer className="absolute bottom-6 text-center z-10">
            <div className="inline-block bg-black/40 backdrop-blur-md rounded-full px-8 py-3 border border-white/20">
                <p className="text-white text-sm font-bold text-strong-shadow">
                    Sistema de Sorteo - Lotería Chaqueña
                </p>
            </div>
        </footer>
    );
}
