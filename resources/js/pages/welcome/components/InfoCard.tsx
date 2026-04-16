/**
 * Mensaje de estado cuando el sistema está listo para sortear
 * Diseñado para ser legible en proyectores desde distancia
 */
export function InfoCard() {
    return (
        <div className="text-center mt-4">
            <p
                className="font-medium"
                style={{ fontSize: 'clamp(1rem, 2vmin, 1.75rem)', color: 'rgba(255,255,255,0.7)' }}
            >
                El sistema seleccionará un ganador de forma{' '}
                <span style={{ color: '#fde047', fontWeight: 700 }}>completamente aleatoria</span>{' '}
                entre todos los cartones registrados
            </p>
        </div>
    );
}
