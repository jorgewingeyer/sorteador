# Propuesta de Solución: Algoritmo de Sorteo con Deduplicación Lógica

## 1. Contexto y Problema Detectado

Actualmente, el algoritmo de sorteo selecciona un ganador basándose en el total de registros (filas) en la tabla `participantes`. Esto genera una inequidad cuando existen registros duplicados:

- **Escenario Actual**: Si el "Participante 1" tiene el número de cartón `1` registrado 10 veces, y el "Participante 2" tiene el número de cartón `2` registrado 1 vez.
- **Probabilidad Actual**: El Participante 1 tiene 10/11 chances de ganar (~91%), mientras que el Participante 2 tiene solo 1/11 (~9%).
- **Objetivo**: Lograr que ambos cartones tengan la misma probabilidad (50/50), ignorando la cantidad de veces que el cartón aparece repetido en la base de datos.

## 2. Solución Propuesta

Implementar una **deduplicación lógica** en el proceso de selección. En lugar de sortear entre "filas de participantes", sortearemos entre "números de cartón únicos".

El proceso no eliminará registros de la base de datos, sino que filtrará los datos en memoria (o mediante consulta SQL optimizada) antes de aplicar la aleatoriedad.

### Enfoque: Selección en Dos Fases

1.  **Fase de Selección de Cartón**: Determinar el universo de números de cartón únicos y elegir uno al azar.
2.  **Fase de Resolución de Ganador**: Identificar al participante asociado a ese cartón ganador.

## 3. Algoritmo Detallado

El flujo de ejecución del `Action` será el siguiente:

1.  **Validación Inicial**: Verificar sorteo activo.
2.  **Obtención de Candidatos Únicos**:
    *   Consultar la base de datos para obtener únicamente la columna `carton_number`.
    *   Aplicar filtros: `sorteo_id` activo y `ganador_en` es NULL.
    *   Aplicar `distinct()` para eliminar duplicados.
    *   Resultado: Una lista (array) de números de cartón únicos participantes.
3.  **Verificación de Disponibilidad**: Si la lista está vacía, lanzar excepción.
4.  **Selección Aleatoria Segura**:
    *   Calcular el índice máximo: `count($cartonesUnicos) - 1`.
    *   Generar índice ganador: `random_int(0, max)`. (Mantiene estándar CSPRNG).
    *   Obtener el valor: `$cartonGanador = $cartonesUnicos[$indice]`.
5.  **Asignación del Ganador**:
    *   Buscar en la base de datos un registro que coincida con `$cartonGanador` y el id del sorteo activo, (pueden exisitr varios sorteos activos en simultaneo).
    *   *Estrategia de Resolución*: `Participante::where('carton_number', $cartonGanador)->where('sorteo_id', $sorteoActivo)->get()`.
    *   Al seleccionar el cartón, ya se ha garantizado la equidad. Si el participante tiene 10 registros con el mismo cartón, cualquiera de ellos es válido para marcarlo como ganador.
6.  **Procesamiento Final**: Marcar al ganador en la base de datos, asignar premio y registrar logs (igual que la implementación actual).

## 4. Análisis de Impacto y Beneficios

| Característica | Implementación Actual | Implementación Propuesta |
| :--- | :--- | :--- |
| **Unidad de Sorteo** | Registro (Fila) | Número de Cartón |
| **Equidad** | Sesgada por duplicados | **Totalmente Equitativa (1 Cartón = 1 Chance)** |
| **Base de Datos** | Sin cambios | **Sin cambios (Solo lectura)** |
| **Performance** | O(1) con offset (rápido) | O(N) para distinct (rápido gracias a índices) |
| **Seguridad** | random_int | random_int |

### Consideraciones de Performance
Dado que la columna `carton_number` está indexada (según migración `2025_12_04_230001`), la operación `distinct()` es eficiente. Para volúmenes de 20,000+ participantes, traer solo los IDs de cartones es una operación ligera en memoria comparada con traer modelos completos.

## 5. Ejemplo Práctico

**Datos:**
- P1: Cartón "100" (Repetido 5 veces)
- P2: Cartón "200" (1 vez)
- P3: Cartón "300" (1 vez)

**Proceso:**
1.  **Lista Única**: `["100", "200", "300"]`.
2.  **Sorteo**: `random_int(0, 2)`. Probabilidad de cada uno: 33.3%.
3.  **Resultado**: Si sale "100", gana P1. La repetición de sus registros no influyó en la suerte.

---
**Nota**: Esta propuesta cumple con el requerimiento de "limpiar" duplicados sin afectar la persistencia de datos y asegura igualdad de condiciones.
