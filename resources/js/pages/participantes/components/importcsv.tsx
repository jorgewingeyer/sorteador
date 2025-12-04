import { useEffect, useMemo, useState } from "react";
import PageSection from "@/components/PageSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputError from "@/components/input-error";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import sorteo from "@/routes/sorteo";
import ParticipantesController from "@/actions/App/Http/Controllers/ParticipantesController";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SorteoItem, SorteoListResponse } from "@/types/sorteo";

export default function ImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [sorteos, setSorteos] = useState<SorteoItem[]>([]);
  const [sorteoId, setSorteoId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<{ imported: number; failed: number; processed: number; chunks: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [sorteoError, setSorteoError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return !!file && !fileError && !!sorteoId;
  }, [file, fileError, sorteoId]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFileError(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (!f) return;
    const nameOk = f.name.toLowerCase().endsWith(".csv");
    const typeOk = (f.type || "").toLowerCase() === "text/csv" || (f.type || "").toLowerCase() === "application/vnd.ms-excel"; // some browsers
    if (!nameOk || (!typeOk && f.type)) {
      setFileError("El archivo debe ser de tipo CSV (.csv)");
    }
  };

  const submitImport = async () => {
    if (!file || !!fileError || !sorteoId) return;
    setImportError(null);
    setSorteoError(null);
    setResult(null);
    setUploading(true);
    setProgress(0);

    const def = ParticipantesController.import();
    const url = def.url;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sorteo_id", sorteoId);

    const xhr = new XMLHttpRequest();
    xhr.open(def.method.toUpperCase(), url);
    xhr.setRequestHeader("Accept", "application/json");
    const xsrf = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("XSRF-TOKEN="));
    if (xsrf) {
      const token = decodeURIComponent(xsrf.split("=")[1] ?? "");
      if (token) xhr.setRequestHeader("X-XSRF-TOKEN", token);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText) as { status: string; stats?: { imported: number; failed: number; processed: number; chunks: number } };
            const stats = json.stats ?? null;
            if (stats) {
              setResult({ imported: stats.imported ?? 0, failed: stats.failed ?? 0, processed: stats.processed ?? 0, chunks: stats.chunks ?? 0 });
            }
          } catch {
            setImportError("La importación terminó, pero no se pudo leer la respuesta.");
          }
        } else if (xhr.status === 413) {
          setImportError("El archivo supera el límite permitido por el servidor. Asegúrate de que no exceda los 50MB y que la configuración del servidor permita archivos grandes.");
        } else if (xhr.status === 422) {
          try {
            const json = JSON.parse(xhr.responseText) as { message?: string; errors?: { file?: string[]; sorteo_id?: string[] } };
            const fileMsg = json.errors?.file?.[0];
            const sorteoMsg = json.errors?.sorteo_id?.[0];
            if (fileMsg) setFileError(fileMsg);
            if (sorteoMsg) setSorteoError(sorteoMsg);
            setImportError(json.message ?? "Los datos enviados no son válidos.");
          } catch {
            setImportError("Los datos enviados no son válidos.");
          }
        } else {
          setImportError("No se pudo completar la importación.");
        }
      }
    };

    xhr.send(fd);
  };

  useEffect(() => {
    const fetchSorteos = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const url = sorteo.list.url({
          query: { page: 1, per_page: 100, sort: "fecha", direction: "desc" },
        });
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        const json = (await res.json()) as SorteoListResponse;
        setSorteos(json?.data ?? []);
      } catch {
        setLoadError("No se pudieron cargar los sorteos.");
      } finally {
        setLoading(false);
      }
    };
    fetchSorteos();
  }, []);

  return (
    <PageSection
      title="Importar CSV"
      description="Importa la lista de participantes desde un archivo CSV."
      size="large"
    >
      <form className="grid w-full gap-6 sm:max-w-2xl" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-2">
          <Label htmlFor="csv">Archivo CSV</Label>
          <Input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            aria-invalid={!!fileError}
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">Solo se permiten archivos CSV.</p>
          <InputError message={fileError ?? undefined} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sorteo">Selecciona el Sorteo</Label>
          <Select value={sorteoId} onValueChange={(v) => { setSorteoId(v); setSorteoError(null); }}>
            <SelectTrigger id="sorteo" aria-invalid={!!loadError || !!sorteoError}>
              <SelectValue placeholder={loading ? "Cargando sorteos..." : "Selecciona un sorteo"} />
            </SelectTrigger>
            <SelectContent>
              {loadError && <SelectItem value="__disabled__" disabled>Sin datos</SelectItem>}
              {!loadError && sorteos.length === 0 && !loading && (
                <SelectItem value="__disabled__" disabled>No hay sorteos disponibles</SelectItem>
              )}
              {sorteos.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nombre} — {s.fecha}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InputError message={sorteoError ?? loadError ?? undefined} />
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" disabled={!isValid || uploading} onClick={submitImport}>
            {uploading ? "Importando…" : "Importar participantes"}
          </Button>
          {!isValid && (
            <span className="text-xs text-muted-foreground">Selecciona un sorteo y un archivo CSV válido.</span>
          )}
        </div>

        {uploading && (
          <div className="grid gap-2">
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-2 rounded bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">Subiendo archivo: {progress}%</span>
          </div>
        )}

        {result && (
          <Alert className="border-green-300/60 bg-green-50 text-green-800 dark:border-green-700/50 dark:bg-green-900/20 dark:text-green-200">
            <AlertTitle>¡Importación finalizada!</AlertTitle>
            <AlertDescription>
              <p>Procesadas: {result.processed}</p>
              <p>Importadas: {result.imported}</p>
              <p>Con errores: {result.failed}</p>
            </AlertDescription>
          </Alert>
        )}

        {importError && (
          <Alert className="border-red-300/60 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-200">
            <AlertTitle>Error de importación</AlertTitle>
            <AlertDescription>
              <p>{importError}</p>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </PageSection>
  );
}
