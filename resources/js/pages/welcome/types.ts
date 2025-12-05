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
    winner: Participante & { ganador_en?: number };
    total_participants: number;
    available_participants: number;
    previous_winners: number;
    posicion_sorteo: number;
    timestamp: string;
}
