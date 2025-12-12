# Sistema de Sorteo - Gestión de Ganadores

## ¿Cómo Previene Ganadores Repetidos?

El sistema implementa un mecanismo para **evitar que un mismo participante gane múltiples veces**. Esto se logra mediante el campo `ganador_en` en la tabla de participantes.

### Funcionamiento

1. **Al iniciar**: Todos los participantes tienen `ganador_en = NULL` (están disponibles)
2. **Al ganar**: El participante seleccionado recibe `ganador_en = la posición en la que ganó`
3. **Próximo sorteo**: Solo se consideran participantes con `ganador_en = NULL`

### Cambios en la Base de Datos

**Campo agregado a la tabla `participantes`**:
```sql
ganador_en integer NULL
```

- **NULL**: El participante NO ha ganado (disponible para sorteos)
- **Entero**: Posición en la que ganó (no participa en futuros sorteos)

### Índice de Performance

Para optimizar consultas de participantes disponibles:
```sql
INDEX (sorteo_id, ganador_en)
```

Esto permite buscar rápidamente participantes disponibles incluso con 100,000+ registros.

---

## Información Mostrada en el Sorteo

Cada sorteo ahora devuelve información detallada:

```json
{
    "winner": {
        "id": 7480,
        "full_name": "Mauro miguel Morales",
        "dni": "32301655",
        "phone": "3624772799",
        "location": "Resistencia",
        "province": "Chaco",
        "carton_number": "25505",
        "ganador_en": 2
    },
    "total_participants": 20343,
    "available_participants": 20342,
    "previous_winners": 1,
    "timestamp": "2025-12-04T23:22:41+00:00"
}
```

### Campos Explicados

| Campo | Descripción |
|-------|-------------|
| `total_participants` | Total de participantes registrados en el sistema |
| `available_participants` | Participantes que AÚN NO han ganado (disponibles) |
| `previous_winners` | Cantidad de participantes que YA ganaron |
| `ganador_en` | Posición en la que este participante ganó |

---

## Resetear Ganadores

Si necesitas empezar un nuevo ciclo de sorteos (por ejemplo, nuevo año), puedes resetear todos los ganadores.

### ⚠️ ADVERTENCIA

**Esta acción es irreversible** y elimina el registro de todos los ganadores anteriores. Los participantes quedarán disponibles nuevamente para sorteos.

### Cómo Resetear (Solo Administradores Autenticados)

#### Desde Terminal

```bash
php artisan tinker
```

```php
App\Actions\Sorteo\ResetearGanadores::execute();
```

#### Desde API (Requiere Autenticación)

```bash
curl -X POST https://sorteador.test/sorteo/resetear-ganadores \
  -H "Accept: application/json" \
  -H "Cookie: your-session-cookie"
```

**Respuesta**:
```json
{
    "message": "Todos los ganadores han sido reseteados exitosamente.",
    "ganadores_reseteados": 150,
    "participantes_disponibles": 20343
}
```

---

## Consultas Útiles

### Ver todos los ganadores

```bash
php artisan tinker
```

```php
// Obtener todos los ganadores
$ganadores = App\Models\Participante::whereNotNull('ganador_en')
    ->orderBy('ganador_en', 'desc')
    ->get(['full_name', 'dni', 'ganador_en']);

foreach ($ganadores as $g) {
    echo "{$g->full_name} ({$g->dni}) - {$g->ganador_en}\n";
}
```

### Contar participantes disponibles

```php
$disponibles = App\Models\Participante::whereNull('ganador_en')->count();
echo "Participantes disponibles: {$disponibles}\n";
```

### Ver estadísticas

```php
$total = App\Models\Participante::count();
$ganadores = App\Models\Participante::whereNotNull('ganador_en')->count();
$disponibles = $total - $ganadores;

echo "Total: {$total}\n";
echo "Ganadores: {$ganadores}\n";
echo "Disponibles: {$disponibles}\n";
echo "Porcentaje completado: " . round(($ganadores / $total) * 100, 2) . "%\n";
```

---

## Flujo Completo del Sistema

### 1. Estado Inicial
```
Total participantes: 20,343
Disponibles: 20,343
Ganadores: 0
```

### 2. Primer Sorteo
```
🎲 Sorteo realizado
Ganador: Mauro miguel Morales
Total participantes: 20,343
Disponibles: 20,342 ⬇️
Ganadores: 1 ⬆️
```

### 3. Segundo Sorteo
```
🎲 Sorteo realizado
Ganador: Maria Carrasco (¡Diferente!)
Total participantes: 20,343
Disponibles: 20,341 ⬇️
Ganadores: 2 ⬆️
```

### 4. Sorteo 20,343
```
🎲 Sorteo realizado
Ganador: Último participante
Total participantes: 20,343
Disponibles: 0 ⬇️
Ganadores: 20,343 ⬆️
```

### 5. Siguiente Intento
```
❌ ERROR: "No hay participantes disponibles para el sorteo.
Todos ya han ganado o no hay participantes registrados."
```

### 6. Resetear (Opcional)
```
🔄 Resetear ejecutado
Ganadores reseteados: 20,343
Disponibles: 20,343 ⬆️
Ganadores: 0 ⬇️
```

---

## Garantías del Sistema

✅ **No hay repeticiones**: Un participante solo puede ganar UNA vez  
✅ **Equidad mantenida**: La probabilidad es siempre 1/N donde N = disponibles  
✅ **Aleatoriedad perfecta**: `random_int()` se mantiene en cada sorteo  
✅ **Performance constante**: Usa índices, funciona igual con 10 o 100,000 participantes  
✅ **Auditoría completa**: Cada sorteo registra estadísticas detalladas en logs  

---

## Logs Mejorados

Los logs ahora incluyen información adicional:

```
[2025-12-04 23:22:41] local.INFO: Sorteo realizado  
{
    "ganador_id": 7480,
    "ganador_nombre": "Mauro miguel Morales",
    "ganador_dni": "32301655",
    "total_participantes": 20343,
    "participantes_disponibles": 20343,
    "ganadores_anteriores": 0,
    "indice_seleccionado": 7479,
    "timestamp": "2025-12-04T23:22:41+00:00",
    "probabilidad": "1/20343",
    "algoritmo": "random_int (CSPRNG)"
}
```

**Nuevo**: `participantes_disponibles` y `ganadores_anteriores` para tracking completo.

---

## Casos de Uso

### Sorteo Único (No permitir repeticiones)
✅ **Configuración actual**: Los participantes solo pueden ganar una vez.

### Sorteo con Reset Periódico
1. Ejecutar sorteos durante todo el mes
2. A fin de mes: resetear ganadores
3. Comenzar nuevo ciclo el próximo mes

### Sorteo con Múltiples Premios
1. Primer sorteo → Premio menor 
2. Segundo sorteo → Premio secundario (excluye al primero)
3. Tercer sorteo → Premio terciario (excluye a los dos primeros)
4. Y así sucesivamente...

---

**Sistema actualizado y funcionando correctamente!** 🎉
