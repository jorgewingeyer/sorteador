import AppLayout from "@/layouts/app-layout";
import PageWrapper from "@/components/PageWrapper";
import { BreadcrumbItem } from "@/types";
import { InstanciaSorteoItem, SorteoItem } from "@/types/sorteo";
import { router } from "@inertiajs/react";
import PageSection from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, RefreshCcw, Play, Trophy, Gift, Eye } from "lucide-react";
import { useState } from "react";
import InstanciaPremiosForm from "./components/InstanciaPremiosForm";
import type { PremioItem } from "@/types/premios";
import instancias from "@/routes/instancias";
import EntregaPremioModal from "./components/EntregaPremioModal";
import VerEntregaModal from "./components/VerEntregaModal";
import { Badge } from "@/components/ui/badge";

interface Ganador {
    id: number;
    carton_number: string;
    premio: { nombre: string; posicion: number };
    participante?: { full_name: string; dni: string };
    inscripto?: { full_name: string; dni: string };
    premio_instancia?: { premio: { nombre: string } };
    winning_position?: number;
    entrega_premio?: {
        id: number;
        fecha_entrega: string;
        dni_receptor: string | null;
        nombre_receptor: string;
        observaciones: string | null;
        foto_evidencia_path: string | null;
    } | null;
}

interface InstanciaPageProps {
    instancia: InstanciaSorteoItem & { premios?: PremioItem[] };
    sorteo: SorteoItem;
    participantsCount: number;
    ganadores: Ganador[];
    premios: PremioItem[];
}

export default function InstanciaPage({ instancia, sorteo, participantsCount, ganadores, premios }: InstanciaPageProps) {
    const [loading, setLoading] = useState(false);
    const [selectedGanador, setSelectedGanador] = useState<Ganador | null>(null);
    const [showEntregaModal, setShowEntregaModal] = useState(false);
    const [showVerEntregaModal, setShowVerEntregaModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sorteos', href: '/sorteo' },
        { title: sorteo.nombre, href: '/sorteo' },
        { title: instancia.nombre, href: `/instancias/${instancia.id}` },
    ];

    const handleClean = () => {
        if (!confirm("¿Estás seguro de limpiar y recargar participantes? Esto eliminará la lista actual de participantes habilitados para esta instancia.")) return;
        setLoading(true);
        router.post(instancias.clean.url({ instancia: instancia.id }), {}, {
            onFinish: () => setLoading(false)
        });
    };

    const handleExecute = () => {
        if (!confirm("¿Estás seguro de ejecutar el sorteo? Se seleccionarán ganadores aleatoriamente.")) return;
        setLoading(true);
        router.post(instancias.execute.url({ instancia: instancia.id }), {}, {
            onFinish: () => setLoading(false)
        });
    };

    const handleEntregar = (ganador: Ganador) => {
        setSelectedGanador(ganador);
        setShowEntregaModal(true);
    };

    const handleVerEntrega = (ganador: Ganador) => {
        setSelectedGanador(ganador);
        setShowVerEntregaModal(true);
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
                    <Button onClick={handleExecute} disabled={loading || participantsCount === 0 || instancia.estado === 'finalizada'}>
                        <Play className="mr-2 h-4 w-4" />
                        Ejecutar Sorteo
                    </Button>
                </div>

                <InstanciaPremiosForm 
                    instancia={instancia} 
                    availablePremios={premios} 
                />

                <PageSection 
                    title="Ganadores" 
                    description="Lista de ganadores de esta instancia."
                    size="full"
                    >
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Posición</TableHead>
                                    <TableHead>Premio</TableHead>
                                    <TableHead>Ganador</TableHead>
                                    <TableHead>Cartón</TableHead>
                                    <TableHead>Estado Entrega</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ganadores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No hay ganadores registrados aún.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ganadores.map((ganador) => (
                                        <TableRow key={ganador.id}>
                                            <TableCell className="font-bold">#{ganador.winning_position || '?'}</TableCell>
                                            <TableCell>{ganador.premio_instancia?.premio?.nombre || 'Premio'}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{ganador.inscripto?.full_name || 'Desconocido'}</div>
                                                <div className="text-xs text-muted-foreground">{ganador.inscripto?.dni}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{ganador.carton_number || '?'}</div>
                                            </TableCell>
                                            <TableCell>
                                                {ganador.entrega_premio ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        Entregado
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                                        Pendiente
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!ganador.entrega_premio ? (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => handleEntregar(ganador)}
                                                    >
                                                        <Gift className="w-4 h-4 mr-2" />
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => handleVerEntrega(ganador)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </PageSection>

                <EntregaPremioModal 
                    open={showEntregaModal} 
                    onOpenChange={setShowEntregaModal} 
                    ganador={selectedGanador}
                    onSuccess={() => {
                        // Opcional: refrescar datos si Inertia no lo hace automáticamente
                        // window.location.reload(); 
                        // Inertia debería manejar esto si el backend devuelve los datos actualizados
                    }}
                />

                <VerEntregaModal
                    open={showVerEntregaModal}
                    onOpenChange={setShowVerEntregaModal}
                    entrega={selectedGanador?.entrega_premio || null}
                    ganadorNombre={selectedGanador?.inscripto?.full_name || 'Ganador'}
                />
            </PageWrapper>
        </AppLayout>
    );
}
