import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "@inertiajs/react";
import { SorteoItem } from "@/types/sorteo";

interface SelectSorteoProps {
    sorteos: SorteoItem[];
}

export default function SelectSorteo({ sorteos }: SelectSorteoProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Participantes</h2>
                <p className="text-muted-foreground max-w-[600px]">
                    Selecciona un sorteo para comenzar a importar inscriptos, gestionar la lista de participantes y ver estadísticas.
                </p>
            </div>

            <Card className="w-full max-w-2xl border-2 border-dashed bg-muted/30">
                <CardHeader>
                    <CardTitle>Sorteos Disponibles</CardTitle>
                    <CardDescription>Elige el evento sobre el cual deseas trabajar.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {sorteos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay sorteos creados aún.
                        </div>
                    ) : (
                        sorteos.map((sorteo) => (
                            <Link
                                key={sorteo.id}
                                href={`/participantes?sorteo_id=${sorteo.id}`}
                                className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-lg">{sorteo.nombre}</span>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CalendarIcon className="mr-1 h-3 w-3" />
                                        {sorteo.created_at ? format(new Date(sorteo.created_at), "d 'de' MMMM, yyyy", { locale: es }) : 'Sin fecha'}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
