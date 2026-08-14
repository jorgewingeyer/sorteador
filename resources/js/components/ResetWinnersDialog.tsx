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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResetWinners } from '@/hooks/useResetWinners';
import { AlertTriangle } from 'lucide-react';

interface Sorteo {
    id: number;
    nombre: string;
}

interface ResetWinnersDialogProps {
    sorteos: Sorteo[];
    defaultSorteoId?: string;
}

export function ResetWinnersDialog({ sorteos, defaultSorteoId }: ResetWinnersDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSorteoId, setSelectedSorteoId] = useState<string>(defaultSorteoId || '__all__');
    const { isResetting, error, resetWinners } = useResetWinners();

    const handleReset = async () => {
        const sorteoId = selectedSorteoId === '__all__' ? null : parseInt(selectedSorteoId);
        await resetWinners(sorteoId);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!isResetting) {
            setIsOpen(open);
        }
    };

    const sorteoName =
        selectedSorteoId === '__all__'
            ? 'todos los sorteos'
            : (sorteos.find((s) => String(s.id) === selectedSorteoId)?.nombre ?? 'este sorteo');

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Resetear Ganadores
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Resetear Ganadores</DialogTitle>
                    <DialogDescription>
                        Esta acción eliminará todos los ganadores registrados del sorteo seleccionado y no puede deshacerse.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sorteo a resetear</label>
                        <Select value={selectedSorteoId} onValueChange={setSelectedSorteoId} disabled={isResetting}>
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

                    <Alert className="border-destructive/40 bg-destructive/5 text-destructive dark:border-destructive/30 dark:bg-destructive/10">
                        <AlertTriangle className="size-4" />
                        <AlertTitle>Acción irreversible</AlertTitle>
                        <AlertDescription>
                            Se eliminarán los ganadores de <strong>{sorteoName}</strong>. Los participantes quedarán habilitados para volver a ganar.
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isResetting}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleReset} disabled={isResetting}>
                        {isResetting ? 'Reseteando...' : 'Confirmar Reset'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
