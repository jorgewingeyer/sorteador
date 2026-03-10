import AppLayout from "@/layouts/app-layout";
import PageWrapper from "@/components/PageWrapper";
import { BreadcrumbItem } from "@/types";
import { InstanciaSorteoItem, SorteoItem } from "@/types/sorteo";
import { router } from "@inertiajs/react";
import PageSection from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, RefreshCcw, Play, Trophy } from "lucide-react";
import { useState } from "react";

interface Ganador {
    id: number;
    carton_number: string;
    premio: { nombre: string; posicion: number };
    participante?: { full_name: string; dni: string };
}

interface InstanciaPageProps {
    instancia: InstanciaSorteoItem;
    sorteo: SorteoItem;
    participantsCount: number;
    ganadores: Ganador[];
}

export default function InstanciaPage({ instancia, sorteo, participantsCount, ganadores }: InstanciaPageProps) {
    const [loading, setLoading] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sorteos', href: '/sorteo' },
        { title: sorteo.nombre, href: '/sorteo' },
        { title: instancia.nombre, href: `/instancias/${instancia.id}` },
    ];

    const handleClean = () => {
        if (!confirm("¿Estás seguro de limpiar y recargar participantes? Esto eliminará la lista actual de participantes habilitados para esta instancia.")) return;
        setLoading(true);
        router.post(`/instancias/${instancia.id}/clean`, {}, {
            onFinish: () => setLoading(false)
        });
    };

    const handleExecute = () => {
        if (!confirm("¿Estás seguro de ejecutar el sorteo? Se seleccionarán ganadores aleatoriamente.")) return;
        setLoading(true);
        router.post(`/instancias/${instancia.id}/execute`, {}, {
            onFinish: () => setLoading(false)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <PageWrapper
                title={`${sorteo.nombre} - ${instancia.nombre}`}
                description={`Fecha de ejecución: ${instancia.fecha_ejecucion ?? 'No definida'}`}
            >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estado</CardTitle>
                            {instancia.estado === 'completado' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{instancia.estado}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Participantes Habilitados</CardTitle>
                            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{participantsCount}</div>
                            <p className="text-xs text-muted-foreground">Listos para el sorteo</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ganadores</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ganadores.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-4 my-6">
                    <Button onClick={handleClean} disabled={loading} variant="outline">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Limpiar y Cargar Participantes
                    </Button>
                    <Button onClick={handleExecute} disabled={loading || participantsCount === 0}>
                        <Play className="mr-2 h-4 w-4" />
                        Ejecutar Sorteo
                    </Button>
                </div>

                <PageSection title="Ganadores" description="Lista de ganadores de esta instancia.">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Posición</TableHead>
                                    <TableHead>Premio</TableHead>
                                    <TableHead>Ganador</TableHead>
                                    <TableHead>Cartón</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ganadores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No hay ganadores aún.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ganadores.map((ganador) => (
                                        <TableRow key={ganador.id}>
                                            <TableCell className="font-bold">{ganador.premio.posicion}</TableCell>
                                            <TableCell>{ganador.premio.nombre}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{ganador.participante?.full_name ?? 'Desconocido'}</span>
                                                    <span className="text-xs text-muted-foreground">{ganador.participante?.dni}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">{ganador.carton_number}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </PageSection>
            </PageWrapper>
        </AppLayout>
    );
}
