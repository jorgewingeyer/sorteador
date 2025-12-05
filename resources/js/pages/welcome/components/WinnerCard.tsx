import type { WinnerResult } from '../types';

interface WinnerCardProps {
    winner: WinnerResult;
}

interface InfoItemProps {
    label: string;
    value: string;
}

/**
 * Componente reutilizable para mostrar un dato del ganador
 * DRY: evita repetir el mismo markup
 */
function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div className="bg-white/80 rounded-xl p-4 border border-yellow-300">
            <p className="text-gray-600 text-xs uppercase tracking-wider mb-1 font-semibold">{label}</p>
            <p className="text-gray-900 text-xl font-bold">{value}</p>
        </div>
    );
}

/**
 * Tarjeta de ganador con información completa
 * Responsabilidad única: mostrar datos del ganador de forma elegante
 */
export function WinnerCard({ winner }: WinnerCardProps) {
    return (
        <div className="glass-card rounded-3xl p-8 md:p-12 transform transition-all duration-500 scale-100 animate-in">
            <div className="text-center">
                {/* Trophy Icon */}
                <div className="mb-6">
                    <div className="text-8xl mb-4 inline-block animate-bounce">🏆</div>
                </div>
                
                {/* Title */}
                <h3 
                    className="text-5xl md:text-6xl font-black mb-6 drop-shadow-lg" 
                    style={{ 
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'Playfair Display, serif'
                    }}
                >
                    ¡GANADOR!
                </h3>
                
                {/* Winner Info */}
                <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-2xl p-8 mb-6 border-2 border-yellow-400">
                    <p className="text-gray-600 text-sm uppercase tracking-wider mb-2 font-semibold">
                        Participante Ganador
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        {winner.winner.full_name}
                    </p>
                    
                    {/* Winner Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
                    </div>
                </div>
                
                {/* Statistics */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-gray-700 text-sm font-semibold">
                    <div className="bg-white/60 rounded-lg px-5 py-3 border border-gray-300">
                        <span className="font-black text-red-700">{winner.total_participants}</span> Participantes Totales
                    </div>
                    <div className="bg-white/60 rounded-lg px-5 py-3 border border-gray-300">
                        <span className="font-black text-green-700">{winner.available_participants}</span> Disponibles
                    </div>
                    {winner.previous_winners > 0 && (
                        <div className="bg-white/60 rounded-lg px-5 py-3 border border-gray-300">
                            <span className="font-black text-blue-700">{winner.previous_winners}</span> Ganadores Previos
                        </div>
                    )}
                    <div className="bg-white/60 rounded-lg px-5 py-3 border border-gray-300">
                        📅 {new Date(winner.timestamp).toLocaleString('es-AR')}
                    </div>
                </div>
            </div>
        </div>
    );
}
