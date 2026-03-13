import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Link } from "@inertiajs/react"
import { InstanciaSorteoItem } from "@/types/sorteo"
import { Plus } from "lucide-react"
import sorteo from "@/routes/sorteo"

interface InstanciasListProps {
  sorteoId: number
  instancias: InstanciaSorteoItem[]
  limit: number
}

export default function InstanciasList({ sorteoId, instancias, limit }: InstanciasListProps) {
  const [open, setOpen] = useState(false)
  const { data, setData, post, processing, errors, reset } = useForm<{
    nombre: string
    fecha_ejecucion: string
    error?: string
  }>({
    nombre: "",
    fecha_ejecucion: "",
  })

  const canCreate = instancias.length < limit

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(sorteo.instancias.store.url(sorteoId), {
      onSuccess: () => {
        setOpen(false)
        reset()
        window.dispatchEvent(new CustomEvent('sorteo:refresh'))
      },
    })
  }

  return (
    <div className="p-4 bg-muted/50 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold">
            Instancias del Sorteo ({instancias.length}/{limit})
        </h4>
        <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setOpen(true)}
            disabled={!canCreate}
            title={!canCreate ? "Se ha alcanzado el límite de instancias para este sorteo" : "Crear nueva instancia"}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Instancia
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha Ejecución</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instancias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No hay instancias creadas.
                </TableCell>
              </TableRow>
            ) : (
              instancias.map((instancia) => (
                <TableRow key={instancia.id}>
                  <TableCell className="font-medium">{instancia.nombre}</TableCell>
                  <TableCell>{instancia.fecha_ejecucion}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      instancia.estado === 'completado' 
                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {instancia.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/instancias/${instancia.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Instancia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {errors.error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={data.nombre}
                onChange={(e) => setData("nombre", e.target.value)}
                placeholder="Ej: Sorteo de Reyes"
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha de Ejecución</Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={data.fecha_ejecucion}
                onChange={(e) => setData("fecha_ejecucion", e.target.value)}
              />
              {errors.fecha_ejecucion && <p className="text-sm text-red-500">{errors.fecha_ejecucion}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={processing}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
