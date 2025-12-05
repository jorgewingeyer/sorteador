/**
 * Tarjeta informativa que explica el sistema de sorteo
 * Responsabilidad única: mostrar información del sistema
 */
export function InfoCard() {
    return (
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
            <p className="text-gray-800 text-lg md:text-xl font-medium leading-relaxed mb-4">
                El sistema seleccionará un ganador de forma{' '}
                <span className="font-black text-red-700">completamente aleatoria</span> entre 
                todos los participantes registrados.
            </p>
            <p className="text-gray-600 text-sm font-medium">
                ✓ Algoritmo criptográficamente seguro<br/>
                ✓ Cada participante tiene las mismas probabilidades<br/>
                ✓ Sistema certificado y auditable
            </p>
        </div>
    );
}
