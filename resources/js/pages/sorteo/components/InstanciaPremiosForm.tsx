import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useForm, router } from "@inertiajs/react"
import { Trash2, Plus } from "lucide-react"
import PageSection from "@/components/PageSection"
import type { PremioItem } from "@/types/premios"
import type { InstanciaSorteoItem } from "@/types/sorteo"
import instancias from "@/routes/instancias"

interface PremioWithPivot extends PremioItem {
  pivot?: {
    cantidad?: number
    posicion?: number
  }
}

interface Props {
  instancia: InstanciaSorteoItem & { premios?: PremioWithPivot[] }
  availablePremios: PremioItem[]
}

export default function InstanciaPremiosForm({ instancia, availablePremios }: Props) {
  const [selectedPremio, setSelectedPremio] = useState<string>("")
  
  const { data, setData, post, processing, errors, reset } = useForm({
    premio_id: "",
    posicion: "",
    cantidad: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(instancias.premios.add.url({ instancia: instancia.id }), {
      onSuccess: () => {
        reset()
        setSelectedPremio("")
      },
      preserveScroll: true,
    })
  }

  const handleRemove = (premioId: number, posicion: number) => {
    if (!confirm("¿Estás seguro de quitar este premio?")) return
    router.delete(instancias.premios.remove.url({ instancia: instancia.id }), {
      data: { premio_id: premioId, posicion },
      preserveScroll: true,
    })
  }

  // Check if it's an array, otherwise default to empty
  const premiosList: PremioWithPivot[] = Array.isArray(instancia.premios) 
    ? (instancia.premios as PremioWithPivot[]) 
    : (instancia.premios as unknown as { data: PremioWithPivot[] })?.data || [];
   
  const assignedPremios = [...premiosList];
  // Sort by position
  assignedPremios.sort((a, b) => (a.posicion || 0) - (b.posicion || 0))

  return (
    <PageSection
      title="Gestión de Premios"
      description="Asigna los premios que se sortearán en esta instancia."
      size="full"
    >
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        
        {/* Formulario de Agregar */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30 h-fit">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Agregar Premio
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label>Premio</Label>
              <Select 
                value={selectedPremio} 
                onValueChange={(val) => {
                  setSelectedPremio(val)
                  setData("premio_id", val)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar premio" />
                </SelectTrigger>
                <SelectContent>
                  {availablePremios.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.premio_id && <p className="text-sm text-destructive">{errors.premio_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Posición</Label>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="Ej: 1"
                  value={data.posicion}
                  onChange={(e) => setData("posicion", e.target.value)}
                />
                {errors.posicion && <p className="text-sm text-destructive">{errors.posicion}</p>}
              </div>
              
              <div className="space-y-1">
                <Label>Cantidad</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={data.cantidad}
                  onChange={(e) => setData("cantidad", parseInt(e.target.value))}
                />
                {errors.cantidad && <p className="text-sm text-destructive">{errors.cantidad}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              <Plus className="w-4 h-4 mr-2" /> Asignar
            </Button>
          </form>
        </div>

        {/* Lista de Asignados */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Premio</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedPremios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No hay premios asignados a esta instancia.
                  </TableCell>
                </TableRow>
              ) : (
                assignedPremios.map((p) => (
                  <TableRow key={`${p.id}-${p.posicion}`}>
                    <TableCell className="font-bold flex items-center gap-2">
                      <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {p.posicion}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{p.nombre}</div>
                      {p.descripcion && <div className="text-xs text-muted-foreground">{p.descripcion}</div>}
                    </TableCell>
                    <TableCell>
                        {p.pivot?.cantidad || 1}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(p.id, p.posicion!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </PageSection>
  )
}
