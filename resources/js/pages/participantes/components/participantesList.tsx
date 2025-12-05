import { useCallback, useEffect, useMemo, useState } from "react";
import PageSection from "@/components/PageSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import ParticipantesController from "@/actions/App/Http/Controllers/ParticipantesController";
import sorteo from "@/routes/sorteo";
import { participantes as participantesRoute } from "@/routes";
import { usePage } from "@inertiajs/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResetWinnersDialog } from "@/components/ResetWinnersDialog";
import { WinnerBadge } from "@/components/WinnerBadge";
import { DebugFilter } from "@/components/DebugFilter";

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
}

interface ParticipanteListResponse {
  data: ParticipanteItem[];
  meta?: PaginationMeta;
  status?: "ok" | "error";
  error?: { message: string };
}

export default function ParticipantesList() {
  const pageCtx = usePage();
  const [data, setData] = useState<ParticipanteListResponse | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(50);
  const [sort, setSort] = useState<"created_at" | "full_name" | "dni" | "carton_number" | "sorteo_id">("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const [q, setQ] = useState<string>("");
  const [qInput, setQInput] = useState<string>("");
  const [sorteoId, setSorteoId] = useState<string>("");
  const [ganadorStatus, setGanadorStatus] = useState<string>("");
  const [sorteos, setSorteos] = useState<Array<{ id: number; nombre: string }>>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params: Record<string, any> = { 
      page, 
      per_page: perPage, 
      sort, 
      direction,
    };
    
    if (q) params.q = q;
    if (sorteoId) params.sorteo_id = sorteoId;
    if (ganadorStatus) params.ganador_status = ganadorStatus;
    
    return params;
  }, [page, perPage, sort, direction, q, sorteoId, ganadorStatus]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = ParticipantesController.list.url({ query });
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const json = (await res.json()) as ParticipanteListResponse;
      setData(json);
    } catch {
      setError("No se pudieron cargar los participantes.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const url = participantesRoute({ query }).url;
    window.history.replaceState(null, "", url);
  }, [query]);

  useEffect(() => {
    const raw = String(pageCtx.url);
    if (raw) {
      const url = new URL(raw, window.location.origin);
      const sid = url.searchParams.get("sorteo_id") ?? "";
      if (sid) {
        setSorteoId(sid);
      }
      const qParam = url.searchParams.get("q");
      if (qParam) {
        setQ(qParam);
        setQInput(qParam);
      }
      const ganadorParam = url.searchParams.get("ganador_status");
      if (ganadorParam) {
        setGanadorStatus(ganadorParam);
      }
    }
    fetchList();
  }, [fetchList, pageCtx.url]);

  useEffect(() => {
    const loadSorteos = async () => {
      try {
        const res = await fetch(sorteo.list.url({ query: { page: 1, per_page: 100, sort: "fecha", direction: "desc" } }), { headers: { Accept: "application/json" } });
        const json = await res.json() as { data?: Array<{ id: number; nombre: string }> };
        const items: Array<{ id: number; nombre: string }> = (json?.data ?? []).map((s) => ({ id: s.id, nombre: s.nombre }));
        setSorteos(items);
      } catch {
        // ignore
      }
    };
    loadSorteos();
  }, []);

  const toggleSort = (column: "created_at" | "full_name" | "dni" | "carton_number" | "sorteo_id") => {
    if (sort === column) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(column);
      setDirection("asc");
    }
    setPage(1);
  };

  const applySearch = () => {
    setQ(qInput.trim());
    setPage(1);
  };

  const items: ParticipanteItem[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <PageSection
      title="Participantes"
      description="Mantén un registro de todos los participantes en tu sorteo."
      size="large"
    >
      <div className="space-y-4">
        {/* Botón de resetear ganadores */}
        <div className="flex justify-end">
          <ResetWinnersDialog 
            sorteos={sorteos} 
            defaultSorteoId={sorteoId}
          />
        </div>

        {/* Debug Filter - Remover en producción */}
        <DebugFilter ganadorStatus={ganadorStatus} query={query} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre, DNI o Nº de cartón"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
            />
            <button className="inline-flex h-9 items-center rounded-md border bg-transparent px-3 text-sm" onClick={applySearch}>Buscar</button>
          </div>
          <div>
            <Select value={sorteoId} onValueChange={(v) => { setSorteoId(v === "__all__" ? "" : v); setPage(1); }}>
              <SelectTrigger aria-label="Sorteo">
                <SelectValue placeholder="Todos los sorteos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                {sorteos.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={ganadorStatus} onValueChange={(v) => { setGanadorStatus(v === "__all__" ? "" : v); setPage(1); }}>
              <SelectTrigger aria-label="Estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="ganador">🏆 Solo Ganadores</SelectItem>
                <SelectItem value="no_ganador">⏳ No Ganadores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("sorteo_id")}>Sorteo</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("full_name")}>Nombre</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("dni")}>DNI</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Localidad</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("carton_number")}>Nº Cartón</TableHead>
              <TableHead>Ganador</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>Cargando...</TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={8}>{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>No hay participantes para los filtros seleccionados.</TableCell>
              </TableRow>
            )}
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.sorteo_nombre ?? '-'}</TableCell>
                <TableCell>{p.full_name}</TableCell>
                <TableCell>{p.dni}</TableCell>
                <TableCell>{p.phone}</TableCell>
                <TableCell>{p.location}</TableCell>
                <TableCell>{p.province}</TableCell>
                <TableCell>{p.carton_number}</TableCell>
                <TableCell>
                  <WinnerBadge ganadorEn={p.ganador_en} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      {meta && meta.last_page > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{meta.current_page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  </PageSection>
  );
}
