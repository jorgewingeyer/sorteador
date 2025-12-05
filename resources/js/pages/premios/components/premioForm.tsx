import PageSection from '@/components/PageSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import PremioController from '@/actions/App/Http/Controllers/PremioController';
import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PremioForm() {
    const storeDef = PremioController.store();
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!toastMessage) return;
        const t = setTimeout(() => setToastMessage(null), 4000);
        return () => clearTimeout(t);
    }, [toastMessage]);

    return (
        <PageSection
            title="Nuevo Premio"
            description="Completa la información para registrar un premio que podrá ser asignado a los sorteos."
            size="large"
        >
            <Form
                method={storeDef.method}
                action={storeDef.url}
                className="grid w-full gap-6 sm:max-w-xl"
                resetOnSuccess
                options={{ preserveScroll: true }}
                onSuccess={() => {
                    setToastMessage('¡Premio creado correctamente! Se ha registrado exitosamente.');
                    window.dispatchEvent(new CustomEvent('premios:refresh'));
                }}
            >
                {({ processing, errors }) => (
                    <>
                        {toastMessage && (
                            <Alert className="border-green-300/60 bg-green-50 text-green-800 dark:border-green-700/50 dark:bg-green-900/20 dark:text-green-200">
                                <AlertTitle>¡Premio creado!</AlertTitle>
                                <AlertDescription>{toastMessage}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre del Premio</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Ej.: Televisor 42 pulgadas"
                                aria-invalid={Boolean(errors?.nombre)}
                            />
                            <InputError message={errors?.nombre} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Detalles del premio, características, etc."
                                className="min-h-[100px]"
                                aria-invalid={Boolean(errors?.descripcion)}
                            />
                            <InputError message={errors?.descripcion} />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                Guardar Premio
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Completa los campos requeridos y presiona "Guardar Premio".
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </PageSection>
    );
}