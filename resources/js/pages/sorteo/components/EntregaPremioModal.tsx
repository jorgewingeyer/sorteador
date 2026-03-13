import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "@inertiajs/react"
import { Loader2 } from "lucide-react"
import entregas from "@/routes/entregas"

interface EntregaPremioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ganador: {
    id: number
    inscripto?: {
      full_name: string
      dni: string
    }
  } | null
  onSuccess: () => void
}

export default function EntregaPremioModal({ open, onOpenChange, ganador, onSuccess }: EntregaPremioModalProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    ganador_id: ganador?.id ?? 0,
    dni_receptor: "",
    nombre_receptor: "",
    observaciones: "",
    foto_evidencia: null as File | null,
  })

  // Actualizar ID cuando cambia el ganador seleccionado
  if (ganador && data.ganador_id !== ganador.id) {
    setData((prev) => ({
      ...prev,
      ganador_id: ganador.id,
      // Pre-llenar con datos del ganador por defecto
      dni_receptor: ganador.inscripto?.dni || "",
      nombre_receptor: ganador.inscripto?.full_name || "",
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(entregas.store.url(), {
      onSuccess: () => {
        reset()
        onSuccess()
        onOpenChange(false)
      },
      forceFormData: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Entrega de Premio</DialogTitle>
          <DialogDescription>
            Complete los datos de la persona que recibe el premio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre_receptor">Nombre quien retira</Label>
            <Input
              id="nombre_receptor"
              value={data.nombre_receptor}
              onChange={(e) => setData("nombre_receptor", e.target.value)}
              placeholder="Nombre completo"
            />
            {errors.nombre_receptor && <p className="text-sm text-red-500">{errors.nombre_receptor}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dni_receptor">DNI quien retira</Label>
            <Input
              id="dni_receptor"
              value={data.dni_receptor}
              onChange={(e) => setData("dni_receptor", e.target.value)}
              placeholder="Número de documento"
            />
            {errors.dni_receptor && <p className="text-sm text-red-500">{errors.dni_receptor}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="foto_evidencia">Foto Evidencia (Opcional)</Label>
            <Input
              id="foto_evidencia"
              type="file"
              accept="image/*"
              onChange={(e) => setData("foto_evidencia", e.target.files ? e.target.files[0] : null)}
            />
            {errors.foto_evidencia && <p className="text-sm text-red-500">{errors.foto_evidencia}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={data.observaciones}
              onChange={(e) => setData("observaciones", e.target.value)}
              placeholder="Detalles adicionales..."
            />
            {errors.observaciones && <p className="text-sm text-red-500">{errors.observaciones}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Entrega
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
