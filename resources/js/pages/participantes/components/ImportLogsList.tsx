import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import PageSection from "@/components/PageSection"
import { AlertCircle } from "lucide-react"

interface ImportLog {
  id: number
  file_name: string
  file_size: number
  total_rows: number
  imported_rows: number
  skipped_rows: number
  created_at: string
  user?: { name: string }
  error_log?: Array<{ line: number, error: string }>
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
    <PageSection title="Historial de Importaciones" description="Registro de archivos importados.">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Filas Totales</TableHead>
              <TableHead className="text-right">Errores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Cargando...</TableCell>
              </TableRow>
            )}
            {!loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No hay registros de importación.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: es })}</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{log.file_name}</span>
                        <span className="text-xs text-muted-foreground">{(log.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                </TableCell>
                <TableCell>{log.user?.name ?? 'Sistema'}</TableCell>
                <TableCell className="text-right">{log.total_rows}</TableCell>
                <TableCell className="text-right">
                    {log.error_log && log.error_log.length > 0 ? (
                        <div className="flex items-center justify-end text-red-600 gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{log.error_log.length}</span>
                        </div>
                    ) : (
                        <span className="text-green-600">0</span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageSection>
  )
}
