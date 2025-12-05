import { useCallback, useEffect, useMemo, useState } from "react"
import PageSection from "@/components/PageSection"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import sorteo from "@/routes/sorteo"
import { participantes } from "@/routes"
import { router } from "@inertiajs/react"
import { type SorteoItem, type SorteoListProps, type SorteoListResponse } from "@/types/sorteo"
import { ArrowUpDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SorteoController from "@/actions/App/Http/Controllers/SorteoController"
import type { PremioItem, PremioListResponse } from "@/types/premios"
import { GripVertical, Trash2, Plus, CheckCircle2, AlertCircle } from "lucide-react"

export default function SorteoList({ listSorteos, premios }: SorteoListProps & { premios?: PremioListResponse | null }) {
  const [data, setData] = useState<SorteoListResponse | null>(listSorteos ?? null)
  const [page, setPage] = useState<number>(listSorteos?.meta?.current_page ?? 1)
  const [perPage] = useState<number>(listSorteos?.meta?.per_page ?? 10)
  const [sort, setSort] = useState<"fecha" | "nombre" | "created_at">("fecha")
  const [direction, setDirection] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [current, setCurrent] = useState<SorteoItem | null>(null)
  const premioItems: PremioItem[] = useMemo(() => premios?.data ?? [], [premios])
  const [assignments, setAssignments] = useState<Array<{ premio_id: number; posicion: number; nombre: string }>>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [addPremioId, setAddPremioId] = useState<string>("")
  const [addPos, setAddPos] = useState<string>("")
  const [modalMsg, setModalMsg] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  const query = useMemo(() => ({ page, per_page: perPage, sort, direction }), [page, perPage, sort, direction])

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = sorteo.list.url({ query })
      const res = await fetch(url, { headers: { Accept: "application/json" } })
      const json = (await res.json()) as SorteoListResponse
      setData(json)
    } catch {
      setError("No se pudieron cargar los sorteos.")
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    const handler = () => {
      fetchList()
    }
    window.addEventListener('sorteo:refresh', handler)
    return () => {
      window.removeEventListener('sorteo:refresh', handler)
    }
  }, [fetchList])

  const toggleSort = (column: "fecha" | "nombre" | "created_at") => {
    if (sort === column) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSort(column)
      setDirection("asc")
    }
  }

  const items: SorteoItem[] = data?.data ?? []
  const meta = data?.meta

  const openEditor = async (item: SorteoItem) => {
    setCurrent(item)
    setEditOpen(true)
    setModalMsg(null)
    setModalError(null)
    try {
      const url = SorteoController.show.get({ sorteo: item.id }).url
      const res = await fetch(url, { headers: { Accept: "application/json" } })
      const json = await res.json() as { data?: { premios?: Array<{ id: number; nombre: string; posicion: number }> } }
      const premioList = (json.data?.premios ?? [])
      const rows = premioList
        .filter((p) => typeof p.posicion === "number")
        .sort((a, b) => (a.posicion - b.posicion))
        .map((p) => ({ premio_id: p.id, posicion: p.posicion, nombre: p.nombre }))
      setAssignments(rows)
    } catch {
      setModalError("No se pudieron cargar las asignaciones.")
    }
  }

  const onDragStart = (idx: number) => setDragIndex(idx)
  const onDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const onDrop = (idx: number) => {
    if (dragIndex === null) return
    const next = assignments.slice()
    const [moved] = next.splice(dragIndex, 1)
    next.splice(idx, 0, moved)
    const resequenced = next.map((a, i) => ({ ...a, posicion: i + 1 }))
    setAssignments(resequenced)
    setDragIndex(null)
  }

  const addPremio = async () => {
    setModalMsg(null)
    setModalError(null)
    if (!current) return
    const premioIdNum = Number(addPremioId)
    const posNum = Number(addPos)
    if (!Number.isFinite(premioIdNum) || !Number.isFinite(posNum) || posNum < 1) {
      setModalError("Completa premio y posición válidos.")
      return
    }
    const def = SorteoController.addPremio.form.post({ sorteo: current.id })
    router.post(def.action, { premio_id: premioIdNum, posicion: posNum }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: async () => {
        setAddPremioId("")
        setAddPos("")
        await openEditor(current)
        setModalMsg("Premio agregado.")
        window.dispatchEvent(new CustomEvent('sorteo:refresh'))
      },
      onError: () => setModalError("No se pudo agregar el premio."),
    })
  }

  const removePremio = async (premio_id: number, posicion: number) => {
    setModalMsg(null)
    setModalError(null)
    if (!current) return
    const def = SorteoController.removePremio.form.delete({ sorteo: current.id })
    router.post(def.action, { premio_id, posicion }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: async () => {
        await openEditor(current)
        setModalMsg("Premio eliminado.")
        window.dispatchEvent(new CustomEvent('sorteo:refresh'))
      },
      onError: () => setModalError("No se pudo eliminar el premio."),
    })
  }

  const saveOrder = async () => {
    setModalMsg(null)
    setModalError(null)
    if (!current) return
    const payload = { premios: assignments.map((a) => ({ premio_id: a.premio_id, posicion: a.posicion })) }
    const def = SorteoController.reorderPremios.form.patch({ sorteo: current.id })
    router.post(def.action, payload, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: async () => {
        await openEditor(current)
        setModalMsg("Orden guardado.")
        window.dispatchEvent(new CustomEvent('sorteo:refresh'))
      },
      onError: () => setModalError("No se pudo guardar el orden."),
    })
  }

  return (
    <PageSection
      title="Lista de Sorteos"
      description="Mantén un registro de todos los sorteos programados."
      size="large"
    >
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("fecha")}>Fecha <ArrowUpDown className="inline ml-1 size-4" /></TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("nombre")}>Nombre <ArrowUpDown className="inline ml-1 size-4" /></TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4}>Cargando...</TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={4}>{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No hay sorteos disponibles.</TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.fecha}</TableCell>
                <TableCell>{item.nombre}</TableCell>
                <TableCell>
                  <Badge variant={item.estado.variant}>{item.estado.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = participantes({ query: { sorteo_id: String(item.id) } }).url
                      router.visit(url, { preserveScroll: true })
                    }}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditor(item)}
                    className="ml-1"
                  >
                    Editar Premios
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {meta && meta.last_page > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                />
              </PaginationItem>
              {meta.links.map((l, idx) => (
                <PaginationItem key={`${l.label}-${idx}`}>
                  {l.url ? (
                    <PaginationLink
                      href="#"
                      isActive={l.active}
                      onClick={(e) => {
                        e.preventDefault()
                        const num = Number(l.label)
                        if (!Number.isNaN(num)) setPage(num)
                      }}
                    >
                      {l.label}
                    </PaginationLink>
                  ) : (
                    <PaginationLink href="#" onClick={(e) => e.preventDefault()}>{l.label}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.min(meta.last_page, p + 1))
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setAssignments([]); setModalMsg(null); setModalError(null); } }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Editar premios {current ? `— ${current.nombre}` : ""}</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="grid gap-4">
              {modalMsg && (
                <Alert className="border-green-200 bg-green-50 text-green-700">
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>{modalMsg}</AlertDescription>
                </Alert>
              )}
              {modalError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{modalError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Orden actual</Label>
                  {assignments.length > 0 ? (
                    <ul className="grid gap-2 max-h-72 overflow-auto pr-1">
                      {assignments.map((a, idx) => (
                        <li
                          key={`${a.premio_id}-${a.posicion}`}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 p-2 text-xs hover:bg-muted"
                          draggable
                          onDragStart={() => onDragStart(idx)}
                          onDragOver={onDragOver}
                          onDrop={() => onDrop(idx)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="size-4 text-muted-foreground" />
                            <span className="font-medium">Pos {a.posicion}</span>
                            <span className="truncate">— {a.nombre}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePremio(a.premio_id, a.posicion)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">Este sorteo aún no tiene premios asignados.</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Agregar premio</Label>
                  <div className="flex items-center gap-2">
                    <Select value={addPremioId} onValueChange={(v) => setAddPremioId(v)}>
                      <SelectTrigger aria-label="Premio">
                        <SelectValue placeholder="Selecciona premio" />
                      </SelectTrigger>
                      <SelectContent>
                        {premioItems.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Posición"
                      value={addPos}
                      onChange={(e) => setAddPos(e.target.value)}
                      className="w-24"
                    />
                    <Button type="button" size="sm" onClick={addPremio}>
                      <Plus className="mr-1 size-4" /> Añadir
                    </Button>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground">Consejo: Usa “Guardar Orden” para aplicar cambios de posiciones.</p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={saveOrder} disabled={assignments.length === 0}>Guardar Orden</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageSection>
  )
}
