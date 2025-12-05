import PageSection from "@/components/PageSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PremioListResponse, PremioItem } from "@/types/premios";
import { Badge } from "@/components/ui/badge";

export default function PremioList({ premios }: { premios?: PremioListResponse | null }) {
    const items: PremioItem[] = premios?.data ?? [];
    const hasItems = items.length > 0;

    return (
        <PageSection
            title="Lista de Premios"
            description="Aquí puedes ver la lista de premios disponibles para sorteo."
            size="large"
        >
            {hasItems ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Premio</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Sorteos</TableHead>
                            <TableHead className="text-right">Creado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.nombre}</TableCell>
                                <TableCell className="text-muted-foreground">{item.descripcion ?? "—"}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {(item.sorteos ?? []).map((s) => (
                                            <Badge key={`${item.id}-${s.id}-${s.posicion ?? 'np'}`} variant="secondary">
                                                {s.nombre} {s.posicion != null ? `#${s.posicion}` : ''}
                                            </Badge>
                                        ))}
                                        {(item.sorteos ?? []).length === 0 && (
                                            <Badge variant="outline">Sin sorteos</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{item.created_at ?? "—"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-sm text-muted-foreground">No hay premios cargados.</div>
            )}
        </PageSection>
    );
}
