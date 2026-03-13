import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Download, FileText } from "lucide-react"
import { downloadReceipt } from "@/routes/entregas"

interface EntregaPremio {
  id: number
  fecha_entrega: string
  nombre_receptor: string
  dni_receptor: string | null
  observaciones: string | null
  foto_evidencia_path: string | null
}

interface VerEntregaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entrega: EntregaPremio | null
  ganadorNombre?: string
}

export default function VerEntregaModal({ open, onOpenChange, entrega, ganadorNombre }: VerEntregaModalProps) {
  if (!entrega) return null

  const formattedDate = entrega.fecha_entrega 
    ? format(new Date(entrega.fecha_entrega), "dd 'de' MMMM yyyy, HH:mm", { locale: es })
    : "No disponible"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalle de Entrega de Premio</DialogTitle>
          <DialogDescription>
            Información registrada al momento de entregar el premio a <strong>{ganadorNombre}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Fecha de Entrega</Label>
              <div className="font-medium">{formattedDate}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Estado</Label>
              <div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Entregado</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <h4 className="font-semibold text-sm">Datos de quien recibió</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                <div className="font-medium">{entrega.nombre_receptor || "-"}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">DNI / Identificación</Label>
                <div className="font-medium">{entrega.dni_receptor || "-"}</div>
              </div>
            </div>
          </div>

          {entrega.observaciones && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Observaciones</Label>
              <div className="text-sm p-3 bg-muted rounded-md border text-muted-foreground italic">
                "{entrega.observaciones}"
              </div>
            </div>
          )}

          {entrega.foto_evidencia_path && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Evidencia Fotográfica</Label>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                <img 
                  src={`/storage/${entrega.foto_evidencia_path}`} 
                  alt="Evidencia de entrega" 
                  className="object-contain w-full h-full"
                />
              </div>
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <a href={`/storage/${entrega.foto_evidencia_path}`} target="_blank" rel="noopener noreferrer" download>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Evidencia
                </a>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" asChild>
            <a href={downloadReceipt.url({ entrega: entrega.id })} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              Descargar Comprobante PDF
            </a>
          </Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
