import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageSection from '@/components/PageSection'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import SorteoController from '@/actions/App/Http/Controllers/SorteoController'
import type { PremioItem, PremioListResponse } from '@/types/premios'
import { Form } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  sorteoId?: number | null
  premios?: PremioListResponse | null
}

export default function SorteoPremiosForm({ sorteoId, premios }: Props) {
  const items: PremioItem[] = useMemo(() => premios?.data ?? [], [premios])
  const [query, setQuery] = useState('')
  const [selectedPrizes, setSelectedPrizes] = useState<Record<number, boolean>>({})
  const [entries, setEntries] = useState<Array<{ premio_id: number; posicion: number }>>([])
  const [tempPos, setTempPos] = useState<Record<number, number | ''>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(9)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.nombre.toLowerCase().includes(q))
  }, [items, query])


  const positions = useMemo(() => {
    return entries.map((e) => e.posicion)
  }, [entries])

  const hasDuplicatePositions = useMemo(() => {
    const seen = new Set<number>()
    for (const p of positions) {
      if (seen.has(p)) return true
      seen.add(p)
    }
    return false
  }, [positions])

  const canSubmit = sorteoId && entries.length > 0 && !hasDuplicatePositions

  return (
    <PageSection
      title="Paso 2: Asignar Premios"
      description="Selecciona y ordena los premios para tu sorteo."
      size="large"
    >
      <Form
        method={SorteoController.updatePremios.form.post({ sorteo: sorteoId ?? 0 }).method}
        action={SorteoController.updatePremios.form.post({ sorteo: sorteoId ?? 0 }).action}
        className="grid w-full gap-6"
        resetOnSuccess
        options={{ preserveScroll: true }}
        onSuccess={() => {
          setToastMessage('¡Premios asignados correctamente! Los premios han sido vinculados al sorteo.')
          window.dispatchEvent(new CustomEvent('sorteo:refresh'))
        }}
        disabled={!sorteoId}
      >
        {({ processing /*, errors*/ }) => (
          <>
            {!sorteoId && (
              <Alert className="border-yellow-300/60 bg-yellow-50 text-yellow-800 dark:border-yellow-700/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertTitle>Primero crea el sorteo</AlertTitle>
                <AlertDescription>
                  Crea el sorteo en el Paso 1 para habilitar la asignación de premios.
                </AlertDescription>
              </Alert>
            )}

            {toastMessage && (
              <Alert className="border-green-300/60 bg-green-50 text-green-800 dark:border-green-700/50 dark:bg-green-900/20 dark:text-green-200">
                <AlertTitle>¡Premios asignados!</AlertTitle>
                <AlertDescription>{toastMessage}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2 sm:max-w-xl">
              <Label htmlFor="buscar">Buscar premios</Label>
              <Input
                id="buscar"
                type="text"
                placeholder="Escribe para filtrar por nombre"
                value={query}
                onChange={(e) => { const v = e.target.value; setQuery(v); setVisibleCount(9); }}
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Mostrando {Math.min(visibleCount, filtered.length)} de {filtered.length}</span>
                <div className="flex items-center gap-2">
                  {visibleCount < filtered.length && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setVisibleCount((c) => Math.min(c + 9, filtered.length))}>
                      Ver más
                    </Button>
                  )}
                  {visibleCount > 9 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setVisibleCount(9)}>
                      Ver menos
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid max-h-96 gap-2 overflow-auto sm:grid-cols-3">
                {filtered.slice(0, visibleCount).map((item) => {
                  const checked = !!selectedPrizes[item.id]
                  const pos = tempPos[item.id] ?? ''
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                      <label className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          className="size-4"
                          checked={checked}
                          onChange={(e) => {
                            const c = e.target.checked
                            setSelectedPrizes((prev) => ({ ...prev, [item.id]: c }))
                            if (!c) {
                              setEntries((prev) => prev.filter((en) => en.premio_id !== item.id))
                              setTempPos((prev) => {
                                const next = { ...prev }
                                delete next[item.id]
                                return next
                              })
                            } else {
                              setTempPos((prev) => ({ ...prev, [item.id]: '' }))
                            }
                          }}
                        />
                        <span className="font-medium truncate leading-tight">{item.nombre}</span>
                      </label>

                      <div className="ml-2 flex items-center gap-1">
                        {checked ? (
                          <>
                            <Input
                              id={`pos-${item.id}`}
                              type="number"
                              min={1}
                              value={pos as number | ''}
                              onChange={(e) => {
                                const val = e.target.value
                                const num = val ? Number(val) : ''
                                setTempPos((prev) => ({ ...prev, [item.id]: num }))
                              }}
                              aria-invalid={hasDuplicatePositions}
                              placeholder="Pos."
                              className="w-14 h-7 px-2 text-xs"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const current = tempPos[item.id]
                                if (current === '' || current === undefined) return
                                const n = Number(current)
                                if (!Number.isFinite(n) || n < 1) return
                                if (positions.includes(n)) return
                                setEntries((prev) => [...prev, { premio_id: item.id, posicion: n }])
                                setTempPos((prev) => ({ ...prev, [item.id]: '' }))
                              }}
                            >
                              Añadir
                            </Button>
                          </>
                        ) : (
                          <div className="w-14 h-7" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {hasDuplicatePositions && (
                <p className="text-sm text-destructive">Las posiciones no pueden repetirse.</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Asignaciones</Label>
              {entries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {entries
                    .slice()
                    .sort((a, b) => a.posicion - b.posicion)
                    .map((en) => {
                      const prizeName = items.find((it) => it.id === en.premio_id)?.nombre ?? `Premio #${en.premio_id}`
                      return (
                        <div key={`${en.premio_id}-${en.posicion}`} className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                          <span className="font-medium">Pos {en.posicion}</span>
                          <span className="truncate max-w-[12rem]">— {prizeName}</span>
                          <button
                            type="button"
                            aria-label="Eliminar asignación"
                            className="ml-1 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setEntries((prev) => prev.filter((e) => !(e.premio_id === en.premio_id && e.posicion === en.posicion)))
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aún no agregaste posiciones.</p>
              )}
            </div>

            {entries.map((en, idx) => (
              <div key={`hidden-${en.premio_id}-${en.posicion}`} className="hidden">
                <input name={`premios[${idx}][premio_id]`} value={en.premio_id} />
                <input name={`premios[${idx}][posicion]`} value={en.posicion} />
              </div>
            ))}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={processing || !canSubmit}>
                Guardar Premios
              </Button>
              <p className="text-sm text-muted-foreground">
                Agrega posiciones y visualiza las asignaciones. Puedes deshacer cuando quieras.
              </p>
            </div>
          </>
        )}
      </Form>
    </PageSection>
  )
}
