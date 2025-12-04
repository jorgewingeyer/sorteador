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

export default function SorteoList({ listSorteos }: SorteoListProps) {
  const [data, setData] = useState<SorteoListResponse | null>(listSorteos ?? null)
  const [page, setPage] = useState<number>(listSorteos?.meta?.current_page ?? 1)
  const [perPage] = useState<number>(listSorteos?.meta?.per_page ?? 10)
  const [sort, setSort] = useState<"fecha" | "nombre" | "created_at">("fecha")
  const [direction, setDirection] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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
    </PageSection>
  )
}
