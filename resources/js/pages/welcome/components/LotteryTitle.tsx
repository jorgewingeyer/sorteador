const LOGO_PATH = '/storage/logoLoteria.png';

/**
 * Componente de título y logo de la lotería
 * Responsabilidad única: mostrar branding principal
 */
export function LotteryTitle() {
    return (
        <div className="text-center mb-8">
            {/* Logos */}
            <div className="mb-8 flex justify-center items-center gap-8">
                <img 
                    src="/storage/Gobierno-del-Chaco.png" 
                    alt="Gobierno del Chaco" 
                    className="h-24 md:h-32 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                <div className="w-px h-20 bg-white/30 rounded-full"></div>
                <img 
                    src={LOGO_PATH} 
                    alt="Lotería Chaqueña" 
                    className="h-32 md:h-40 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
            </div>
            
            {/* Main Title */}
            <h1 
                className="text-5xl md:text-7xl font-black text-white mb-3 text-with-stroke tracking-tight" 
                style={{ fontFamily: 'Playfair Display, serif' }}
            >
                Sorteo Oficial
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4 drop-shadow-xl">
                Lotería Chaqueña
            </h2>
        </div>
    );
}
