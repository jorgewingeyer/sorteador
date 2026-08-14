import { Fragment, useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import PageSection from "@/components/PageSection"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ImportLogMatch {
  sorteo_id: number
  dni: string
  carton_number: string
}

interface ImportLogDebugEntry {
  type?: "duplicate" | "validation" | "exception"
  line?: number
  original_line?: number
  error: string
  match?: ImportLogMatch
}

interface ImportLog {
  id: number
  file_name: string
  file_size: number
  total_rows: number
  imported_rows: number
  skipped_rows: number
  created_at: string
  user?: { name: string }
  error_log?: ImportLogDebugEntry[]
}

interface ImportLogsResponse {
  data: ImportLog[]
  current_page: number
  last_page: number
  total: number
}

export default function ImportLogsList({ sorteoId }: { sorteoId?: string | number | null }) {
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sorteoId) return
    
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/participantes/logs?sorteo_id=${sorteoId}`)
        const json = await res.json() as ImportLogsResponse
        setLogs(json.data)
      } catch {
        setError("No se pudieron cargar los logs.")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
    
    const interval = setInterval(fetchLogs, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [sorteoId])

  if (!sorteoId) return null

  return (
    <PageSection 
        title="Historial de Importaciones" 
        description="Registro de archivos importados."
        size="full"
        >
      {error ? (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Filas en CSV</TableHead>
              <TableHead className="text-right">Nuevos Inscriptos</TableHead>
              <TableHead className="text-right">Ya existían</TableHead>
              <TableHead className="text-right">Errores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">Cargando...</TableCell>
              </TableRow>
            )}
            {!loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No hay registros de importación.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => {
              const debugEntries = log.error_log ?? []
              const duplicateEntries = debugEntries.filter((entry) => entry.type === "duplicate")

              return (
                <Fragment key={log.id}>
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: es })}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium">{log.file_name}</span>
                            <span className="text-xs text-muted-foreground">{(log.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                    </TableCell>
                    <TableCell>{log.user?.name ?? 'Sistema'}</TableCell>
                    <TableCell className="text-right">{log.total_rows.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium text-green-700 dark:text-green-400">
                      {log.imported_rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {log.skipped_rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                        {debugEntries.length > 0 ? (
                            <div className="flex items-center justify-end text-red-600 gap-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{debugEntries.length}</span>
                            </div>
                        ) : (
                            <span className="text-green-600">0</span>
                        )}
                    </TableCell>
                  </TableRow>
                  {debugEntries.length > 0 && (
                    <TableRow key={`${log.id}-debug`}>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <details>
                          <summary className="cursor-pointer text-sm font-medium">
                            Ver debug completo de descartes ({debugEntries.length}) · Duplicados detectados: {duplicateEntries.length}
                          </summary>
                          <div className="mt-3 max-h-64 overflow-auto space-y-2 pr-2">
                            {debugEntries.map((entry, index) => (
                              <div
                                key={`${log.id}-entry-${index}`}
                                className={`rounded-md border p-2 text-sm ${
                                  entry.type === "duplicate"
                                    ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
                                    : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
                                }`}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={entry.type === "duplicate" ? "destructive" : "secondary"}>
                                    {entry.type === "duplicate" ? "Descartado por duplicado" : "Descartado por validación"}
                                  </Badge>
                                  <span>Línea {entry.line ?? "-"}</span>
                                  {entry.original_line ? <span>Duplica a línea {entry.original_line}</span> : null}
                                  {entry.match ? (
                                    <span>
                                      Match: DNI {entry.match.dni} · Cartón {entry.match.carton_number}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1">{entry.error}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </PageSection>
  )
}
