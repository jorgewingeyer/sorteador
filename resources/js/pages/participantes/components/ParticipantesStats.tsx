import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsData {
    total_registros: number;
    total_cartones_unicos: number;
    duplicados: number;
    mensaje?: string;
}

export function ParticipantesStats({ sorteoId }: { sorteoId?: number }) {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const url = sorteoId 
                ? `/participantes/stats?sorteo_id=${sorteoId}` 
                : '/participantes/stats';
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [sorteoId]);

    if (!stats) return null;

    return (
        <Card className="mb-6 border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas de Participación
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">
                            {stats.total_registros.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">Registros Totales</span>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-green-600">
                            {stats.total_cartones_unicos.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">Cartones Únicos (Habilitados)</span>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-yellow-600">
                            {stats.duplicados.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">Duplicados Ignorados</span>
                    </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 italic">
                    * El sorteo se realizará exclusivamente sobre los {stats.total_cartones_unicos.toLocaleString()} cartones únicos para garantizar equidad.
                </div>
            </CardContent>
        </Card>
    );
}
