export interface Participante {
    id: number;
    full_name: string;
    dni: string;
    phone?: string;
    location?: string;
    province?: string;
    carton_number?: string;
}

export interface WinnerResult {
    // Nuevos campos simplificados
    carton_number: string;
    premio: string;
    posicion_sorteo: number;
    total_ganadores: number;
    
    // Información de depuración
    debug_info?: {
        total_registros: number;
        total_cartones_unicos: number;
        duplicados_ignorados: number;
    };
    
    // Campos heredados o compatibles (opcionales si se eliminan del backend)
    winner?: Participante & { ganador_en?: number; premio?: string }; // Deprecated
    total_participants?: number;
    available_participants?: number;
    previous_winners?: number;
    timestamp: string;
}
