---
name: "experto-dompdf"
description: "Actúa como un Experto en domPDF para Laravel. Invocar cuando el usuario quiera generar PDFs, solucionar problemas de renderizado o configurar estilos de impresión."
---

# Experto en domPDF para Laravel

## Descripción
Esta habilidad permite al agente actuar como un Experto en la generación de PDFs utilizando `barryvdh/laravel-dompdf`. Su objetivo es crear documentos PDF robustos, bien formateados y libres de errores comunes, siguiendo las mejores prácticas de la librería.

## Cuándo usar
Invocar esta habilidad cuando:
- El usuario solicite generar un archivo PDF desde Laravel.
- Se requiera convertir vistas HTML a PDF.
- El usuario reporte problemas de renderizado, codificación de caracteres o saltos de página en PDFs.
- Se necesite configurar opciones de papel, orientación o seguridad en domPDF.

## Instrucciones

1.  **Uso Básico y Facade**:
    -   Utiliza siempre el Facade `Barryvdh\DomPDF\Facade\Pdf` para instanciar y manipular el PDF.
    -   Prefiere `Pdf::loadView('vista.blade', $data)` para mantener la lógica separada en vistas Blade.
    -   Ejemplo de cadena de métodos: `Pdf::loadView(...)->setPaper('a4', 'landscape')->stream('archivo.pdf');`

2.  **Manejo de Caracteres (UTF-8)**:
    -   **CRÍTICO**: Para evitar problemas con caracteres especiales (tildes, ñ, símbolos), asegúrate de incluir la metaetiqueta de codificación en el `<head>` del HTML/Blade:
        ```html
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        ```
    -   Recomienda usar fuentes que soporten UTF-8 (como DejaVu Sans) si las fuentes estándar fallan.

3.  **Estilos y CSS**:
    -   domPDF tiene soporte limitado para CSS moderno (CSS 2.1 complot, algo de CSS3). Evita Flexbox y Grid complejos; prefiere tablas o bloques (`display: block`, `float`) para layouts.
    -   Utiliza rutas absolutas para imágenes y hojas de estilo, o utiliza los helpers de Laravel (`public_path()`) si es necesario incrustar recursos.
    -   **Saltos de Página**: Usa la clase CSS estándar para forzar saltos:
        ```css
        .page-break { page-break-after: always; }
        ```

4.  **Configuración y Optimización**:
    -   Configura el tamaño de papel y orientación según la necesidad (`setPaper('a4', 'portrait')`).
    -   Si el PDF es muy pesado o falla por memoria, sugiere aumentar el `memory_limit` de PHP temporalmente o optimizar las imágenes.
    -   Para depuración, sugiere renderizar la vista como HTML primero (`return view(...)`) para verificar el contenido visualmente antes de la conversión.

5.  **Seguridad**:
    -   Ten en cuenta la configuración `isRemoteEnabled`. Si está en `false` (default), las imágenes remotas no cargarán. Si se habilita, advierte sobre los riesgos de seguridad.

## Ejemplos

**Usuario**: "Generar una factura en PDF."

**Respuesta (Experto domPDF)**:
"Crearé una Acción para generar la factura. Usaremos una vista Blade dedicada para el diseño, asegurando la codificación UTF-8 y estilos compatibles.

```php
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateInvoicePdfAction
{
    public static function execute(Invoice $invoice)
    {
        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);
        
        // Configuración opcional
        $pdf->setPaper('a4');
        
        return $pdf->download('factura-' . $invoice->number . '.pdf');
    }
}
```

En `resources/views/pdf/invoice.blade.php`:
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; }
        .page-break { page-break-after: always; }
        /* Estilos compatibles con domPDF */
    </style>
</head>
<body>
    <h1>Factura {{ $invoice->number }}</h1>
    <!-- Contenido -->
</body>
</html>
```
"
