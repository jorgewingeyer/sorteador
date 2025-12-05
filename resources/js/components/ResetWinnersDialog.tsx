import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResetWinners } from '@/hooks/useResetWinners';

interface Sorteo {
    id: number;
    nombre: string;
}

interface ResetWinnersDialogProps {
    sorteos: Sorteo[];
    defaultSorteoId?: string;
}

/**
 * Componente de diálogo para resetear ganadores
 * Responsabilidad única: UI para seleccionar sorteo y confirmar acción
 * Sigue OCP: Abierto para extensión, cerrado para modificación
 */
export function ResetWinnersDialog({ sorteos, defaultSorteoId }: ResetWinnersDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSorteoId, setSelectedSorteoId] = useState<string>(defaultSorteoId || '__all__');
    const { isResetting, resetWinners } = useResetWinners();

    const handleReset = async () => {
        // Confirmar acción
        const sorteoName = selectedSorteoId === '__all__' 
            ? 'todos los sorteos' 
            : sorteos.find(s => String(s.id) === selectedSorteoId)?.nombre || 'este sorteo';

        const confirmed = confirm(
            `¿Estás seguro de que deseas resetear los ganadores de ${sorteoName}? Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        // Ejecutar reset
        const sorteoId = selectedSorteoId === '__all__' ? null : parseInt(selectedSorteoId);
        await resetWinners(sorteoId);
        
        // Cerrar diálogo
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    🔄 Resetear Ganadores
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Resetear Ganadores</DialogTitle>
                    <DialogDescription>
                        Selecciona el sorteo del cual deseas resetear los ganadores. 
                        Esto permitirá que los participantes puedan volver a ganar.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">
                        Sorteo a resetear
                    </label>
                    <Select 
                        value={selectedSorteoId} 
                        onValueChange={setSelectedSorteoId}
                        disabled={isResetting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un sorteo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">
                                <span className="font-semibold">Todos los sorteos</span>
                            </SelectItem>
                            {sorteos.map((sorteo) => (
                                <SelectItem key={sorteo.id} value={String(sorteo.id)}>
                                    {sorteo.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => setIsOpen(false)}
                        disabled={isResetting}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleReset}
                        disabled={isResetting}
                    >
                        {isResetting ? 'Reseteando...' : 'Resetear Ganadores'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
