import { useState, useCallback } from "react";
import PageSection from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "@inertiajs/react";
import { UploadCloud, FileType, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { importMethod } from "@/routes/participantes";

export default function ImportCSV({ initialSorteoId }: { initialSorteoId?: string | number | null }) {
    const { data, setData, post, progress, processing, errors, reset, clearErrors } = useForm({
        file: null as File | null,
        sorteo_id: initialSorteoId ? String(initialSorteoId) : "",
    });

    const [dragActive, setDragActive] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
        
        if (!isCsv) {
            alert("Por favor sube un archivo CSV válido.");
            return;
        }
        
        setData("file", file);
        clearErrors();
        setUploadSuccess(null);
    }, [setData, clearErrors]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file || !data.sorteo_id) return;

        post(importMethod.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setUploadSuccess("El archivo se ha subido correctamente. El procesamiento continuará en segundo plano.");
                reset('file');
            },
            onError: () => {
                setUploadSuccess(null);
            },
        });
    };

    const removeFile = () => {
        setData("file", null);
        clearErrors();
    };

    return (
        <PageSection
            title="Importar Inscriptos"
            description="Sube un archivo CSV con la lista de personas que compraron cartones."
            size="large"
        >
            <form onSubmit={submitImport} className="space-y-6">
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200",
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50",
                        errors.file ? "border-destructive/50 bg-destructive/5" : ""
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept=".csv,text/csv,application/vnd.ms-excel"
                        onChange={handleChange}
                        disabled={processing}
                    />
                    
                    {!data.file ? (
                        <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-full pt-5 pb-6 cursor-pointer"
                        >
                            <div className="p-4 rounded-full bg-muted mb-4">
                                <UploadCloud className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground">
                                CSV (max. 50MB)
                            </p>
                        </label>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full p-4">
                            <div className="flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm w-full max-w-md">
                                <div className="p-2 rounded bg-primary/10">
                                    <FileType className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {data.file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(data.file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeFile();
                                    }}
                                    disabled={processing}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {errors.file && (
                    <p className="text-sm text-destructive font-medium">{errors.file}</p>
                )}
                
                {errors.sorteo_id && (
                    <p className="text-sm text-destructive font-medium">Error de Sorteo: {errors.sorteo_id}</p>
                )}

                {progress && (
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                        ></div>
                        <p className="text-xs text-right mt-1 text-muted-foreground">{progress.percentage}%</p>
                    </div>
                )}

                {uploadSuccess && (
                    <Alert className="border-green-500/50 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>¡Éxito!</AlertTitle>
                        <AlertDescription>
                            {uploadSuccess}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={!data.file || processing}>
                        {processing ? "Subiendo..." : "Importar Inscriptos"}
                    </Button>
                </div>
            </form>
        </PageSection>
    );
}
