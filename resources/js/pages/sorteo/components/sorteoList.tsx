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
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import SorteoController from "@/actions/App/Http/Controllers/SorteoController"
import type { PremioListResponse } from "@/types/premios"
import InstanciasList from "./InstanciasList"
import React from "react"

export default function SorteoList({ listSorteos }: SorteoListProps & { premios?: PremioListResponse | null }) {
  const [data, setData] = useState<SorteoListResponse | null>(listSorteos ?? null)
  const [page, setPage] = useState<number>(listSorteos?.meta?.current_page ?? 1)
  const [perPage] = useState<number>(listSorteos?.meta?.per_page ?? 10)
  const [sort, setSort] = useState<"nombre" | "created_at">("created_at")
  const [direction, setDirection] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedRows(next)
  }

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

  const toggleSort = (column: "nombre" | "created_at") => {
    if (sort === column) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSort(column)
      setDirection("asc")
    }
  }

  const items: SorteoItem[] = data?.data ?? []
  const meta = data?.meta

  const toggleStatus = async (item: SorteoItem, checked: boolean) => {
    setData((prev) => {
      if (!prev) return null
      const updated = prev.data.map((d) => {
        if (d.id === item.id) return { ...d, is_active: checked }
        return d
      })
      return { ...prev, data: updated }
    })

    try {
        const def = SorteoController.toggleStatus.post({ sorteo: item.id })
        router.post(def.url, { is_active: checked }, {
            preserveState: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error("Error al cambiar estado:", errors)
                // Revert optimistic update
                fetchList()
            }
        })
    } catch (e) {
        console.error("Error inesperado:", e)
        fetchList()
    }
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("nombre")}>
                  Nombre
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                  Descripción
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("created_at")}>
                  Creado
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>Cargando...</TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={6}>{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No hay sorteos disponibles.</TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow className={expandedRows.has(item.id) ? "border-b-0 bg-muted/50" : ""}>
                  <TableCell>
                     <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleRow(item.id)}>
                       {expandedRows.has(item.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                     </Button>
                  </TableCell>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                         checked={item.is_active}
                         onCheckedChange={(v) => toggleStatus(item, v)}
                       />
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
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
                      Ver Inscriptos
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(item.id) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <InstanciasList 
                        sorteoId={item.id} 
                        instancias={item.instancias ?? []} 
                        limit={item.instancias_por_sorteo}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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
    </PageSection>
  )
}
