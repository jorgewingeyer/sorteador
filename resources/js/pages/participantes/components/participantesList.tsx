import { useCallback, useState } from "react";
import PageSection from "@/components/PageSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { router } from "@inertiajs/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResetWinnersDialog } from "@/components/ResetWinnersDialog";
import { WinnerBadge } from "@/components/WinnerBadge";
import { Button } from "@/components/ui/button";
import { SorteoItem } from "@/types/sorteo";
import { participantes } from "@/routes";

interface ParticipanteItem {
  id: number;
  sorteo_id: number;
  sorteo_nombre?: string;
  full_name: string;
  dni: string;
  phone: string;
  location: string;
  province: string;
  carton_number: string;
  ganador_en: number | null;
  created_at: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ParticipanteListResponse {
  data: ParticipanteItem[];
  meta?: PaginationMeta;
  status?: "ok" | "error";
  error?: { message: string };
}

interface Props {
  initialSorteoId?: string | number | null;
  initialData?: ParticipanteListResponse;
  sorteos: SorteoItem[];
}

export default function ParticipantesList({ initialSorteoId, initialData, sorteos }: Props) {
  // Extract query params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sorteoId] = useState(initialSorteoId ? String(initialSorteoId) : (searchParams.get("sorteo_id") || ""));
  const [ganadorStatus, setGanadorStatus] = useState(searchParams.get("ganador_status") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "created_at");
  const [direction, setDirection] = useState(searchParams.get("direction") || "desc");

  // Debounce search input
  const [qInput, setQInput] = useState(q);

  const applyFilters = useCallback((newParams: Record<string, string | number | null | undefined>) => {
    router.get(
      participantes.url(),
      {
        sorteo_id: sorteoId,
        q: qInput,
        ganador_status: ganadorStatus,
        sort,
        direction,
        ...newParams,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  }, [sorteoId, qInput, ganadorStatus, sort, direction]);

  const handlePageChange = (page: number) => {
    applyFilters({ page });
  };

  const handleSort = (column: string) => {
    const newDirection = sort === column && direction === "asc" ? "desc" : "asc";
    setSort(column);
    setDirection(newDirection);
    applyFilters({ sort: column, direction: newDirection });
  };

  const handleSearch = () => {
    setQ(qInput);
    applyFilters({ q: qInput, page: 1 });
  };

  const items = initialData?.data || [];
  const meta = initialData?.meta;

  return (
    <PageSection
      title="Listado de Inscriptos"
      description="Listado completo de personas inscriptas al sorteo."
      size="full"
    >
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-2 flex-1">
             <div className="flex gap-2 w-full md:w-auto">
                <Input
                  placeholder="Buscar por nombre, DNI o cartón..."
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full md:w-64"
                />
                <Button variant="secondary" onClick={handleSearch}>Buscar</Button>
             </div>
             
             <Select value={ganadorStatus} onValueChange={(v) => { setGanadorStatus(v === "all" ? "" : v); applyFilters({ ganador_status: v === "all" ? "" : v, page: 1 }); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ganador">🏆 Ganadores</SelectItem>
                <SelectItem value="no_ganador">⏳ No Ganadores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <ResetWinnersDialog 
                sorteos={sorteos} 
                defaultSorteoId={sorteoId}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("full_name")}>
                    Nombre {sort === "full_name" && (direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("dni")}>
                    DNI {sort === "dni" && (direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("carton_number")}>
                    Nº Cartón {sort === "carton_number" && (direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("created_at")}>
                    Fecha {sort === "created_at" && (direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron inscriptos.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.full_name}</TableCell>
                    <TableCell>{item.dni}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>
                        {item.location && item.province ? `${item.location}, ${item.province}` : (item.location || item.province || '-')}
                    </TableCell>
                    <TableCell>{item.carton_number}</TableCell>
                    <TableCell>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <WinnerBadge ganadorEn={item.ganador_en} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                    onClick={() => meta.current_page > 1 && handlePageChange(meta.current_page - 1)}
                    className={meta.current_page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              <PaginationItem>
                 <span className="px-4 text-sm text-muted-foreground">
                    Página {meta.current_page} de {meta.last_page}
                 </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext 
                    onClick={() => meta.current_page < meta.last_page && handlePageChange(meta.current_page + 1)}
                    className={meta.current_page >= meta.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </PageSection>
  );
}
