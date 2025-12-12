import type { WinnerResult } from '../types';

interface WinnerCardProps {
    winner: WinnerResult;
    onClose: () => void;
}

interface InfoItemProps {
    label: string;
    value: string;
}

/**
 * Componente reutilizable para mostrar un dato del ganador
 * Usa unidades relativas al viewport (vmin) para garantizar escalabilidad
 */
function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div className="bg-white/80 rounded-xl border border-yellow-300 p-[1.5vmin] flex flex-col justify-center h-full">
            <p className="text-gray-600 uppercase tracking-wider font-bold leading-none mb-[0.5vmin]" style={{ fontSize: '1.2vmin' }}>
                {label}
            </p>
            <p className="text-gray-900 font-bold leading-tight truncate" style={{ fontSize: '2.5vmin' }}>
                {value}
            </p>
        </div>
    );
}

/**
 * Tarjeta de ganador optimizada para pantallas grandes y TV.
 * Diseño completamente responsivo que evita el scroll mediante unidades relativas (vmin).
 * Se centra perfectamente en la pantalla usando position: fixed.
 */
export function WinnerCard({ winner, onClose }: WinnerCardProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[2vmin]">
            {/* Overlay background to dim the rest of the app */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-700" />
            
            {/* Main Card Container */}
            <div 
                className="relative bg-white/95 backdrop-blur-xl rounded-[3vmin] shadow-2xl border-[0.5vmin] border-yellow-400 w-full max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500"
                style={{
                    boxShadow: '0 0 50px rgba(255, 215, 0, 0.3), 0 20px 40px rgba(0,0,0,0.4)'
                }}
            >
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-0 w-full h-[1vmin] bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-[2vmin] right-[2vmin] z-20 bg-white/50 hover:bg-white/80 text-gray-800 rounded-full p-[1vmin] transition-colors border border-gray-200"
                    title="Cerrar y volver a sortear"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '3vmin', height: '3vmin' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-1 flex flex-col items-center justify-between p-[4vmin] w-full text-center">
                    
                    {/* Header Section: Trophy & Title */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="mb-[1vmin] animate-bounce">
                            <span className="leading-none filter drop-shadow-lg" style={{ fontSize: '8vmin' }}>🏆</span>
                        </div>
                        
                        <h3 
                            className="font-black drop-shadow-md uppercase tracking-wide leading-none mb-[2vmin]" 
                            style={{ 
                                fontSize: '6vmin',
                                background: 'linear-gradient(135deg, #B8860B, #FFD700, #B8860B)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontFamily: 'Playfair Display, serif'
                            }}
                        >
                            ¡GANADOR!
                        </h3>
                    </div>
                    
                    {/* Winner Name - Highlighted */}
                    <div className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[2vmin] p-[3vmin] border-2 border-yellow-200 shadow-inner shrink-0 mb-[2vmin]">
                        <p className="text-gray-500 uppercase tracking-widest font-bold mb-[1vmin]" style={{ fontSize: '1.8vmin' }}>
                            Participante Ganador
                        </p>
                        <p className="font-black text-gray-900 leading-none break-words line-clamp-2" style={{ fontSize: '6vmin' }}>
                            {winner.winner.full_name}
                        </p>
                    </div>
                    
                    {/* Details Grid - Responsive Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-[1.5vmin] w-full overflow-y-auto pr-2" style={{ maxHeight: '30vh' }}>
                        <InfoItem label="DNI" value={winner.winner.dni} />
                        
                        {winner.winner.carton_number && (
                            <InfoItem label="Cartón N°" value={winner.winner.carton_number} />
                        )}
                        
                        {winner.winner.phone && (
                            <InfoItem label="Teléfono" value={winner.winner.phone} />
                        )}
                        
                        {winner.winner.location && (
                            <InfoItem label="Localidad" value={winner.winner.location} />
                        )}
                        
                        {winner.winner.province && (
                            <InfoItem label="Provincia" value={winner.winner.province} />
                        )}
                        
                        {winner.winner.premio && (
                            <InfoItem label="Premio" value={winner.winner.premio} />
                        )}
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-[2vmin] flex flex-wrap items-center justify-center gap-[1.5vmin] shrink-0">
                        <div className="bg-gray-100 rounded-full px-[2vmin] py-[0.8vmin] border border-gray-200">
                            <span className="text-gray-600 font-medium" style={{ fontSize: '1.5vmin' }}>
                                Total: <span className="text-gray-900 font-bold">{winner.total_participants}</span>
                            </span>
                        </div>
                        <div className="bg-gray-100 rounded-full px-[2vmin] py-[0.8vmin] border border-gray-200">
                            <span className="text-gray-600 font-medium" style={{ fontSize: '1.5vmin' }}>
                                Disp: <span className="text-green-700 font-bold">{winner.available_participants}</span>
                            </span>
                        </div>
                        <div className="bg-gray-100 rounded-full px-[2vmin] py-[0.8vmin] border border-gray-200">
                            <span className="text-gray-600 font-medium" style={{ fontSize: '1.5vmin' }}>
                                📅 {new Date(winner.timestamp).toLocaleDateString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
