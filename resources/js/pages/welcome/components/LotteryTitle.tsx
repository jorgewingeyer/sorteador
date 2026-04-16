const LOGO_PATH = '/storage/logoLoteria.png';

interface LotteryTitleProps {
    title?: string | null;
    subtitle?: string | null;
}

/**
 * Componente de título y logo de la lotería
 * Optimizado para proyectores y pantallas LED — unidades relativas al viewport
 */
export function LotteryTitle({ title, subtitle }: LotteryTitleProps) {
    return (
        <div className="text-center mb-6">
            {/* Logos */}
            <div className="mb-6 flex justify-center items-center gap-10">
                <img
                    src="/storage/Gobierno-del-Chaco.png"
                    alt="Gobierno del Chaco"
                    className="object-contain drop-shadow-2xl"
                    style={{ height: '15vh', maxHeight: '160px' }}
                />
                <div className="bg-white/30 rounded-full" style={{ width: '2px', height: '12vh', maxHeight: '120px' }} />
                <img
                    src={LOGO_PATH}
                    alt="Lotería Chaqueña"
                    className="object-contain drop-shadow-2xl"
                    style={{ height: '18vh', maxHeight: '200px' }}
                />
            </div>

            {/* Main Title */}
            <h1
                className="font-black text-with-stroke tracking-tight leading-none mb-3"
                style={{
                    fontSize: 'clamp(2rem, 6vw, 6rem)',
                    fontFamily: 'Playfair Display, serif',
                    color: 'white',
                }}
            >
                {title || 'Sorteo Oficial'}
            </h1>

            {/* Subtitle */}
            <h2
                className="font-bold drop-shadow-xl"
                style={{
                    fontSize: 'clamp(1.25rem, 3vw, 3rem)',
                    color: '#fde047',
                }}
            >
                {subtitle || 'Lotería Chaqueña'}
            </h2>
        </div>
    );
}
