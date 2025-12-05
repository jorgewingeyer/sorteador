# Resetear Ganadores - Documentación Técnica

## Descripción

Funcionalidad para resetear los ganadores de un sorteo específico o de todos los sorteos, permitiendo que los participantes puedan volver a ganar en futuros sorteos.

## Arquitectura (SOLID & DRY)

### Estructura de Archivos

```
app/Actions/Sorteo/
└── ResetearGanadores.php          # Action pattern - Lógica de negocio

app/Http/Controllers/
└── SorteoController.php           # Controller con método resetearGanadores

resources/js/
├── hooks/
│   └── useResetWinners.ts         # Custom hook - Lógica del cliente (SRP)
├── components/
│   └── ResetWinnersDialog.tsx     # Componente UI - Dialog reutilizable (SRP)
└── pages/participantes/components/
    └── participantesList.tsx      # Integración del botón
```

---

## Principios Aplicados

### SOLID

#### **S - Single Responsibility Principle**
Cada módulo tiene una única responsabilidad:

- `ResetearGanadores.php`: Solo resetea ganadores en BD
- `useResetWinners.ts`: Solo maneja la comunicación HTTP
- `ResetWinnersDialog.tsx`: Solo maneja la UI del diálogo
- `SorteoController.php`: Solo coordina entre request y action

#### **O - Open/Closed Principle**
- La Action acepta `sorteoId` opcional: abierta para extensión (agregar filtros), cerrada para modificación
- El componente acepta props configurables sin modificar su código interno

#### **L - Liskov Substitution Principle**
- Podrías reemplazar el diálogo con otra implementación sin romper la funcionalidad

#### **I - Interface Segregation Principle**
```typescript
// El diálogo solo recibe lo que necesita
interface ResetWinnersDialogProps {
    sorteos: Sorteo[];
    defaultSorteoId?: string;
}

// El hook solo expone lo necesario
interface UseResetWinnersReturn {
    isResetting: boolean;
    error: string | null;
    resetWinners: (sorteoId: number | null) => Promise<void>;
}
```

#### **D - Dependency Inversion Principle**
Los componentes dependen de abstracciones (interfaces) no de implementaciones concretas.

---

### DRY (Don't Repeat Yourself)

**Antes** (código potencial sin DRY):
```tsx
// En cada lugar que necesite resetear ganadores
const handleReset = async () => {
    const response = await fetch('/sorteo/resetear-ganadores', {
        method: 'POST',
        headers: { ... },
        body: JSON.stringify({ sorteo_id: sorteoId }),
    });
    // Manejo de respuesta
    // Manejo de errores
    // Recargar página
};
```

**Ahora** (con DRY aplicado):
```tsx
// Hook reutilizable encapsula toda la lógica
const { isResetting, resetWinners } = useResetWinners();

// Uso simple en cualquier componente
await resetWinners(sorteoId);
```

---

## Patrón ACTION

### ¿Qué es el Patrón ACTION?

Patrón de diseño que encapsula la lógica de negocio en clases dedicadas, separándola de los controladores.

### Estructura de la Action

```php
namespace App\Actions\Sorteo;

class ResetearGanadores
{
    /**
     * Ejecuta la lógica de reseteo
     * 
     * @param int|null $sorteoId ID del sorteo o null para todos
     * @return array Resultado de la operación
     */
    public static function execute(?int $sorteoId = null): array
    {
        // 1. Construir query
        // 2. Validar datos
        // 3. Ejecutar operación
        // 4. Logging/Auditoría
        // 5. Retornar resultado
    }
}
```

### Ventajas del Patrón ACTION

1. **Reutilización**: La misma action puede usarse desde:
   - Controllers HTTP
   - CLI Commands
   - Jobs/Queue
   - Tests

2. **Testabilidad**: Fácil de testear unitariamente:
```php
$resultado = ResetearGanadores::execute(sorteoId: 5);
$this->assertEquals(10, $resultado['ganadores_reseteados']);
```

3. **Separación de Responsabilidades**:
   - Controller: Valida request, llama action, retorna response
   - Action: Solo lógica de negocio

4. **Mantenibilidad**: Cambios en lógica solo afectan la action

---

## API Endpoints

### POST `/sorteo/resetear-ganadores`

**Autenticación**: Requerida (middleware `auth`)

**Request Body**:
```json
{
    "sorteo_id": 5  // Opcional. Omitir o null para resetear todos
}
```

**Response Success** (200):
```json
{
    "message": "Los ganadores del sorteo han sido reseteados exitosamente.",
    "ganadores_reseteados": 15,
    "sorteo_id": 5,
    "participantes_disponibles": 150
}
```

**Response Error** (400):
```json
{
    "error": "El ID del sorteo debe ser un número válido."
}
```

---

## Uso del Frontend

### 1. Importar el Componente

```tsx
import { ResetWinnersDialog } from '@/components/ResetWinnersDialog';
```

### 2. Renderizar el Botón

```tsx
<ResetWinnersDialog 
    sorteos={sorteos}              // Array de sorteos disponibles
    defaultSorteoId={sorteoId}     // Sorteo preseleccionado (opcional)
/>
```

### 3. El Usuario Interactúa

1. Click en botón "🔄 Resetear Ganadores"
2. Se abre diálogo modal
3. Selecciona sorteo (o "Todos los sorteos")
4. Click en "Resetear Ganadores"
5. Confirma la acción
6. Se ejecuta el reset
7. Página se recarga automáticamente

---

## Flujo de Datos

```
Usuario click botón
       ↓
ResetWinnersDialog (UI)
       ↓
useResetWinners (Hook)
       ↓
POST /sorteo/resetear-ganadores
       ↓
SorteoController::resetearGanadores()
       ↓
ResetearGanadores::execute($sorteoId)
       ↓
Base de Datos (UPDATE participantes SET ganador_en = NULL)
       ↓
Log de Auditoría
       ↓
Response JSON
       ↓
Hook actualiza estado
       ↓
Página se recarga (router.reload())
```

---

## Validaciones

### Backend (PHP)

```php
// Validar que sorteo_id sea numérico si se proporciona
if ($sorteoId !== null && !is_numeric($sorteoId)) {
    return response()->json([
        'error' => 'El ID del sorteo debe ser un número válido.',
    ], 400);
}
```

### Frontend (TypeScript)

```typescript
// Confirmación del usuario antes de ejecutar
const confirmed = confirm(
    `¿Estás seguro de que deseas resetear los ganadores de ${sorteoName}?`
);
if (!confirmed) return;
```

---

## Logging y Auditoría

Cada operación se registra en logs:

```php
Log::warning("Ganadores reseteados para sorteo ID: {$sorteoId}", [
    'sorteo_id' => $sorteoId,
    'total_ganadores_reseteados' => $totalGanadores,
    'timestamp' => now()->toIso8601String(),
]);
```

**Ubicación**: `storage/logs/laravel.log`

**Ejemplo de Log**:
```
[2025-12-05 10:15:30] local.WARNING: Ganadores reseteados para sorteo ID: 5
{
    "sorteo_id": 5,
    "total_ganadores_reseteados": 15,
    "timestamp": "2025-12-05T10:15:30+00:00"
}
```

---

## Testing

### Test Unitario de la Action

```php
use Tests\TestCase;
use App\Actions\Sorteo\ResetearGanadores;
use App\Models\Participante;

class ResetearGanadoresTest extends TestCase
{
    public function test_resetea_ganadores_de_sorteo_especifico()
    {
        // Arrange
        $sorteo = Sorteo::factory()->create();
        Participante::factory()->count(10)->create([
            'sorteo_id' => $sorteo->id,
            'ganador_en' => now(),
        ]);

        // Act
        $resultado = ResetearGanadores::execute($sorteo->id);

        // Assert
        $this->assertEquals(10, $resultado['ganadores_reseteados']);
        $this->assertEquals(0, Participante::whereNotNull('ganador_en')->count());
    }
}
```

### Test del Hook (Frontend)

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useResetWinners } from '@/hooks/useResetWinners';

test('should reset winners successfully', async () => {
    const { result } = renderHook(() => useResetWinners());
    
    await act(async () => {
        await result.current.resetWinners(5);
    });
    
    expect(result.current.isResetting).toBe(false);
    expect(result.current.error).toBe(null);
});
```

---

## Casos de Uso

### 1. Resetear Ganadores de un Sorteo Específico

**Escenario**: "Sorteo Navideño 2024" tuvo un error, necesitas resetear solo ese sorteo.

**Pasos**:
1. Ir a página de Participantes
2. Click en "🔄 Resetear Ganadores"
3. Seleccionar "Sorteo Navideño 2024"
4. Confirmar
5. Solo los ganadores de ese sorteo se resetean

### 2. Resetear Todos los Ganadores

**Escenario**: Nuevo año, nuevo ciclo de sorteos.

**Pasos**:
1. Click en "🔄 Resetear Ganadores"
2. Seleccionar "Todos los sorteos"
3. Confirmar
4. Todos los ganadores se resetean

---

## Seguridad

- ✅ **Autenticación Requerida**: Solo usuarios autenticados
- ✅ **CSRF Protection**: Token CSRF validado
- ✅ **Confirmación Usuario**: Doble confirmación antes de ejecutar
- ✅ **Validación de Entrada**: sorteo_id validado en backend
- ✅ **Logging Completo**: Todas las acciones registradas
- ✅ **Reversible**: No elimina datos, solo resetea campo

---

## Beneficios de la Implementación

1. **Modular**: Cada parte tiene responsabilidad única
2. **Reutilizable**: Hook y componente usables en otros contextos
3. **Testeable**: Cada capa testeable independientemente
4. **Mantenible**: Cambios aislados, sin efectos colaterales
5. **Escalable**: Fácil agregar nuevas funcionalidades
6. **Documentado**: Código autodocumentado con comentarios
7. **Seguro**: Múltiples capas de validación y confirmación

---

## Conclusión

Esta implementación demuestra la aplicación práctica de:
- ✅ Principios SOLID
- ✅ Patrón DRY
- ✅ Patrón ACTION
- ✅ Separación de responsabilidades
- ✅ Clean Code
- ✅ Best Practices de React y Laravel

El resultado es código mantenible, testeable y escalable.
