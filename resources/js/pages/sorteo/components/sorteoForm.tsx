import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SorteoController from '@/actions/App/Http/Controllers/SorteoController';
import { Form } from '@inertiajs/react';
import PageSection from '@/components/PageSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';

export default function SorteoForm() {
  const storeDef = SorteoController.store();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  return (
    <PageSection
      title="Crea un Nuevo Sorteo"
      description="Crea y programa tu sorteo de forma rápida y profesional."
      size="large"
    >
      <Form
        method={storeDef.method}
        action={storeDef.url}
        className="grid w-full gap-6 sm:max-w-xl"
        resetOnSuccess
        options={{ preserveScroll: true }}
        onSuccess={() => {
          setToastMessage('¡Sorteo creado correctamente! Tu sorteo se ha registrado exitosamente.');
          window.dispatchEvent(new CustomEvent('sorteo:refresh'));
        }}
      >
        {({ processing, errors }) => (
          <>
            {toastMessage && (
              <Alert className="border-green-300/60 bg-green-50 text-green-800 dark:border-green-700/50 dark:bg-green-900/20 dark:text-green-200">
                <AlertTitle>¡Sorteo creado!</AlertTitle>
                <AlertDescription>{toastMessage}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Sorteo</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Ej.: Gran Sorteo Navideño"
                aria-invalid={Boolean(errors?.nombre)}
              />
              <InputError message={errors?.nombre} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  aria-invalid={Boolean(errors?.fecha)}
                />
                <InputError message={errors?.fecha} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={processing}>
                Guardar Sorteo
              </Button>
              <p className="text-sm text-muted-foreground">
                Completa los campos requeridos y presiona "Guardar Sorteo".
              </p>
            </div>
          </>
        )}
      </Form>
    </PageSection>
  );
}
