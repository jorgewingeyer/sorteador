# Núcleo Sorteador — Sistema RNG

Documentación técnica del mecanismo de aleatoriedad y ejecución del sorteo.

---

## 1. Visión general

El sistema de sorteo selecciona un **cartón ganador** de forma aleatoria dentro de un pool de participantes habilitados. Toda la lógica de ejecución vive en una única acción (`ExecuteSorteoAction`) que recibe su fuente de aleatoriedad desde afuera mediante inyección de dependencia, siguiendo el principio de Inversión de Dependencias (SOLID-D).

La única línea que genera aleatoriedad en todo el sistema es:

```php
// app/Actions/Sorteo/ExecuteSorteoAction.php — línea 82
$randomIndex = $this->randomizer->randomInt(0, $totalParticipantes - 1);
```

Ninguna otra clase, método o parte del código genera números aleatorios.

---

## 2. Arquitectura del RNG

### 2.1 Contrato (Interfaz)

**Archivo:** `app/Contracts/RandomizerContract.php`

```php
interface RandomizerContract
{
    public function randomInt(int $min, int $max): int;
}
```

Define el contrato que toda fuente de aleatoriedad debe cumplir. `ExecuteSorteoAction` depende únicamente de esta interfaz, nunca de una implementación concreta.

---

### 2.2 Implementación de producción

**Archivo:** `app/Services/Randomizer/CryptographicRandomizer.php`

```php
class CryptographicRandomizer implements RandomizerContract
{
    public function randomInt(int $min, int $max): int
    {
        return random_int($min, $max);
    }
}
```

Delega directamente a `random_int()` de PHP, que es **criptográficamente seguro (CSPRNG)**. Internamente usa la fuente de entropía del sistema operativo (`/dev/urandom` en Linux/macOS, `CryptGenRandom` en Windows). No es predecible ni reproducible.

---

### 2.3 Registro en el contenedor de servicios

**Archivo:** `app/Providers/AppServiceProvider.php`

```php
public function register(): void
{
    $this->app->bind(RandomizerContract::class, CryptographicRandomizer::class);
}
```

Cuando Laravel resuelve `ExecuteSorteoAction` (vía `app(ExecuteSorteoAction::class)`), inyecta automáticamente `CryptographicRandomizer` como implementación de `RandomizerContract`.

---

### 2.4 Uso en producción (controladores)

Ambos controladores que disparan el sorteo usan `app()` para resolver la acción con DI automática:

```php
// app/Http/Controllers/SorteoController.php — método realizar()
$resultado = app(ExecuteSorteoAction::class)->execute((int) $instanciaId);

// app/Http/Controllers/InstanciaSorteoController.php — método execute()
$result = app(ExecuteSorteoAction::class)->execute($instancia->id);
```

---

## 3. Flujo completo de ejecución del sorteo

### Paso previo — Limpieza del pool (`CleanParticipantesAction`)

Antes de ejecutar un sorteo, es **obligatorio** ejecutar la limpieza. Esta acción:

1. Elimina todos los registros de `participantes_sorteo` para la instancia.
2. Consulta los cartones que ya ganaron en **cualquier instancia** del mismo sorteo padre (tabla `ganadores` → join `instancias_sorteo`).
3. Toma todos los cartones únicos (`DISTINCT carton_number`) de `inscriptos` para ese sorteo.
4. Excluye los cartones ganadores previos.
5. Inserta el resultado en `participantes_sorteo` en batches de 1000 filas.

El resultado es una tabla `participantes_sorteo` con cartones elegibles, sin repetidos y sin ganadores previos.

---

### Ejecución del sorteo (`ExecuteSorteoAction::execute`)

**Archivo:** `app/Actions/Sorteo/ExecuteSorteoAction.php`

#### Paso 1 — Validaciones previas

```php
$instancia = InstanciaSorteo::findOrFail($instanciaSorteoId);

if ($instancia->estado === InstanciaStatus::Finalizada) {
    throw new Exception('Esta instancia de sorteo ya ha finalizado.');
}

$totalParticipantes = ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)->count();

if ($totalParticipantes === 0) {
    throw new Exception('No hay participantes habilitados para este sorteo. Ejecute la limpieza primero.');
}
```

- La instancia no debe estar en estado `Finalizada`.
- Debe haber al menos un participante en `participantes_sorteo`.

---

#### Paso 2 — Determinar el próximo premio a sortear

```php
$premiosConfigurados = PremioInstancia::where('instancia_sorteo_id', $instanciaSorteoId)
    ->with('premio')
    ->orderBy('posicion', 'desc') // orden descendente: 5, 4, 3, 2, 1
    ->get();

$ganadoresPorPremio = Ganador::where('instancia_sorteo_id', $instanciaSorteoId)
    ->select('premio_instancia_id', DB::raw('count(*) as total'))
    ->groupBy('premio_instancia_id')
    ->pluck('total', 'premio_instancia_id')
    ->toArray();

foreach ($premiosConfigurados as $premio) {
    $cantidadAsignada = $ganadoresPorPremio[$premio->id] ?? 0;
    $cantidadTotal = $premio->cantidad ?? 1;

    if ($cantidadAsignada < $cantidadTotal) {
        $premioInstancia = $premio;
        break;
    }
}
```

Recorre los premios de mayor a menor posición. El primer premio que tenga cupos disponibles (ganadores asignados < cantidad configurada) es el que se sortea en esta ejecución. Si todos los premios tienen sus cupos completos, lanza excepción.

---

#### Paso 3 — Selección aleatoria del ganador (el núcleo RNG)

```php
DB::beginTransaction();

$randomIndex = $this->randomizer->randomInt(0, $totalParticipantes - 1);

$ganadorSorteo = ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)
    ->orderBy('id') // orden estable y consistente
    ->skip($randomIndex)
    ->take(1)
    ->first();

$cartonGanador = $ganadorSorteo->carton_number;
```

- Se genera un índice entero aleatorio en el rango `[0, totalParticipantes - 1]`.
- Los participantes se ordenan por `id` (orden estable).
- Se usa `skip($randomIndex)` para saltar directamente al registro ganador sin cargar todos en memoria — complejidad O(1) en memoria, O(log N) en base de datos gracias al índice.
- El resultado es el `carton_number` del ganador.

**El acceso al RNG ocurre exactamente una vez por ejecución del sorteo.**

---

#### Paso 4 — Registro de ganadores

```php
$inscriptosGanadores = Inscripto::where('sorteo_id', $instancia->sorteo_id)
    ->where('carton_number', $cartonGanador)
    ->get();

foreach ($inscriptosGanadores as $inscripto) {
    Ganador::create([
        'instancia_sorteo_id' => $instanciaSorteoId,
        'carton_number' => $cartonGanador,
        'premio_instancia_id' => $premioInstancia->id,
        'winning_position' => $siguientePosicion,
        'inscripto_id' => $inscripto->id,
        'user_id' => Auth::id(),
    ]);
}
```

Un cartón puede estar asociado a más de una persona en `inscriptos` (múltiples inscriptos con el mismo `carton_number`). Por cada inscripto con ese cartón se crea un registro en `ganadores`. Si el cartón `1001` pertenece a dos personas, ambas ganan.

---

#### Paso 5 — Eliminación del cartón ganador del pool

```php
ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)
    ->where('carton_number', $cartonGanador)
    ->delete();
```

El cartón ganador se elimina de `participantes_sorteo` para que **no pueda volver a ganar en los sorteos subsiguientes de la misma instancia** (cuando hay múltiples premios en una misma instancia).

---

#### Paso 6 — Finalización automática de la instancia

```php
$ganadoresPorPremio[$premioInstancia->id] = ($ganadoresPorPremio[$premioInstancia->id] ?? 0) + count($ganadoresRegistrados);

$todosPremiosCompletados = true;
foreach ($premiosConfigurados as $premio) {
    if (($ganadoresPorPremio[$premio->id] ?? 0) < ($premio->cantidad ?? 1)) {
        $todosPremiosCompletados = false;
        break;
    }
}

if ($todosPremiosCompletados) {
    $instancia->estado = InstanciaStatus::Finalizada;
    $instancia->save();
}
```

Después de registrar al ganador, se verifica si todos los premios de la instancia tienen sus cupos completos. Si es así, la instancia pasa a estado `Finalizada` automáticamente y no puede ejecutarse nuevamente.

---

#### Paso 7 — Registro de auditoría

```php
SorteoAudit::create([
    'instancia_sorteo_id' => $instanciaSorteoId,
    'winning_carton_number' => $cartonGanador,
    'participants_pool_size' => $totalParticipantes,
    'execution_time_ms' => $executionTimeMs,
    'user_id' => Auth::id(),
    'snapshot_data' => [
        'premio' => $premioInstancia->premio->nombre,
        'posicion_sorteo' => $siguientePosicion,
        'total_ganadores_registrados' => count($ganadoresRegistrados),
        'random_index_selected' => $randomIndex,
        'ganadores_ids' => collect($ganadoresRegistrados)->pluck('id')->toArray(),
    ],
]);
```

Cada ejecución queda registrada en `sorteo_audits` con:

| Campo | Descripción |
|---|---|
| `winning_carton_number` | El cartón que resultó ganador |
| `participants_pool_size` | Tamaño del pool en el momento del sorteo |
| `execution_time_ms` | Tiempo total de ejecución en milisegundos |
| `random_index_selected` | El índice exacto generado por el RNG |
| `ganadores_ids` | IDs de los registros en `ganadores` creados |
| `user_id` | Usuario que ejecutó el sorteo |

El índice aleatorio queda registrado, lo que permite **verificar a posteriori** que el ganador corresponde al registro en posición `random_index_selected` del pool ordenado por `id`.

---

#### Paso 8 — Transacción y retorno

Todo el bloque desde el `DB::beginTransaction()` hasta `DB::commit()` es atómico. Si cualquier paso falla (selección, registro de ganadores, eliminación, auditoría), se ejecuta `DB::rollBack()` y la excepción se propaga. El estado de la base de datos queda intacto.

El método retorna:

```php
[
    'status'          => 'success',
    'carton_number'   => $cartonGanador,
    'premio'          => $premioInstancia->premio->nombre,
    'posicion_sorteo' => $siguientePosicion,
    'total_ganadores' => count($ganadoresRegistrados),
    'timestamp'       => now()->toIso8601String(),
    'ganadores'       => $ganadoresRegistrados,
]
```

---

## 4. Diagrama de tablas involucradas

```
inscriptos
  ├── sorteo_id
  ├── carton_number   ← unidad sorteada
  ├── dni
  └── full_name

participantes_sorteo (pool limpio para la instancia)
  ├── instancia_sorteo_id
  └── carton_number   ← un registro por cartón único elegible

ganadores
  ├── instancia_sorteo_id
  ├── carton_number
  ├── premio_instancia_id
  ├── winning_position
  ├── inscripto_id    ← vínculo con la persona
  └── user_id

sorteo_audits
  ├── instancia_sorteo_id
  ├── winning_carton_number
  ├── participants_pool_size
  ├── execution_time_ms
  ├── random_index_selected  ← dentro de snapshot_data (JSON)
  └── user_id
```

---

## 5. Propiedades de seguridad del RNG

| Propiedad | Estado |
|---|---|
| Criptográficamente seguro | Sí — `random_int()` usa CSPRNG del SO |
| Predecible por un atacante | No |
| Seed controlable desde afuera | No — el SO controla la entropía |
| Reproducible | No — cada llamada produce un resultado independiente |
| Único punto de generación de aleatoriedad | Sí — una sola llamada por sorteo |

---

## 6. Testabilidad

La interfaz `RandomizerContract` permite reemplazar el RNG en tests sin tocar ninguna lógica de negocio:

```php
// tests/Unit/Actions/Sorteo/ExecuteSorteoActionTest.php

$mockRng = $this->createMock(RandomizerContract::class);
$mockRng->method('randomInt')->willReturn(0); // fuerza índice 0

$action = new ExecuteSorteoAction($mockRng);
$result = $action->execute($instancia->id);

// Con índice 0 y orderBy('id'), siempre gana el primer cartón insertado
$this->assertEquals('1001', $result['carton_number']);
```

El test es completamente **determinista**: dado el mismo índice mockeado y el mismo orden de inserción, el resultado es siempre el mismo. No hay riesgo de fallos intermitentes.

---

## 7. Extensibilidad

Para cambiar la fuente de aleatoriedad (por ejemplo, usar un servicio externo de entropía o un RNG con semilla para pruebas de distribución) basta con crear una nueva clase que implemente `RandomizerContract` y registrar el nuevo binding en `AppServiceProvider`:

```php
// Nueva implementación — no toca ninguna clase existente
class SeededRandomizer implements RandomizerContract
{
    public function __construct(private int $seed) {}

    public function randomInt(int $min, int $max): int
    {
        mt_srand($this->seed);
        return mt_rand($min, $max);
    }
}

// En AppServiceProvider::register():
$this->app->bind(RandomizerContract::class, fn() => new SeededRandomizer(42));
```

`ExecuteSorteoAction`, los controladores, los tests y el resto del sistema no requieren ningún cambio.
