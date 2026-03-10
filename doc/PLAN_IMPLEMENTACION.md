# Plan de Implementación del Sistema de Gestión de Sorteos Multietapa (Revisión v3)

Este documento actualiza la estrategia técnica para manejar **Sorteos con Múltiples Instancias** (ej. "Sorteo Benéfico" con fechas parciales el 14/03, 28/03, etc.), gestionando la carga acumulativa de datos y garantizando equidad mediante una separación explícita entre **Inscripción** y **Participación Efectiva**.

## 1. Conceptos Clave

-   **Sorteo (Evento Padre)**: La entidad organizadora (ej. "Gran Rifa Anual"). Agrupa a los inscriptos.
-   **Instancia de Sorteo**: Una fecha específica de ejecución dentro del evento padre (ej. "Sorteo del 14/03", "Sorteo del 28/03").
    -   Tiene sus propios premios asignados.
    -   Tiene su propia fecha de ejecución.
    -   Comparte la misma base de inscriptos del Padre, pero con filtros de ganadores previos.
-   **Inscripto**: Persona que compró un cartón.
-   **Participante**: Cartón habilitado para jugar en una Instancia.

## 2. Arquitectura de Datos

### 2.0. Tabla `sorteos` (Padre) e `instancias_sorteo` (Hijo)
Se separa la definición del evento de sus ejecuciones.

```sql
-- Tabla existente, se mantiene como Padre
CREATE TABLE sorteos (
    id BIGINCREMENT PRIMARY KEY,
    nombre VARCHAR(255), -- "Gran Rifa 2026"
    descripcion TEXT,
    created_at TIMESTAMP
);

-- Nueva tabla para manejar las fechas
CREATE TABLE instancias_sorteo (
    id BIGINCREMENT PRIMARY KEY,
    sorteo_id BIGINT, -- Relación al Padre
    nombre VARCHAR(255), -- "Primer Sorteo Parcial"
    fecha_ejecucion DATETIME,
    estado ENUM('pendiente', 'procesada', 'finalizada'),
    created_at TIMESTAMP,
    FOREIGN KEY (sorteo_id) REFERENCES sorteos(id)
);

-- Tabla pivot para asignar premios a cada instancia específica
-- Reemplaza o extiende la funcionalidad de 'premio_sorteo' actual
CREATE TABLE premio_instancia (
    id BIGINCREMENT PRIMARY KEY,
    instancia_sorteo_id BIGINT NOT NULL,
    premio_id BIGINT NOT NULL,
    posicion INT NOT NULL, -- 1º lugar, 2º lugar...
    cantidad INT DEFAULT 1, -- Cuántos de estos premios se sortean (opcional)
    
    UNIQUE(instancia_sorteo_id, posicion),
    FOREIGN KEY (instancia_sorteo_id) REFERENCES instancias_sorteo(id),
    FOREIGN KEY (premio_id) REFERENCES premios(id)
);
```

### 2.1. Tabla `inscriptos` (Raw Data)
Vinculada al `sorteo_id` (Padre). Todos los inscriptos pertenecen al evento global.

```sql
CREATE TABLE inscriptos (
    id BIGINCREMENT PRIMARY KEY,
    sorteo_id BIGINT NOT NULL, -- Referencia al Sorteo Padre
    full_name VARCHAR(255),
    dni VARCHAR(64),
    carton_number VARCHAR(128),
    phone VARCHAR(64) NULL,
    location VARCHAR(255) NULL,
    province VARCHAR(255) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    -- Restricción para no importar el mismo registro dos veces
    UNIQUE(sorteo_id, dni, carton_number)
);
```

### 2.2. Tabla `participantes_sorteo` (Clean Data)
Vinculada a la `instancia_sorteo_id`. Es específica de CADA FECHA.

```sql
CREATE TABLE participantes_sorteo (
    id BIGINCREMENT PRIMARY KEY,
    instancia_sorteo_id BIGINT NOT NULL, -- Vinculado a la FECHA específica
    carton_number VARCHAR(128) NOT NULL,
    
    -- Auditoría del proceso de limpieza
    procesado_en TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(instancia_sorteo_id, carton_number)
);
```

### 2.3. Tabla `ganadores` (Registro del Sorteo)
Registra el resultado crudo del sorteo: Qué cartón ganó y qué premio.
**IMPORTANTE**: Aquí se guardan TODOS los inscriptos que tengan ese número de cartón.

```sql
CREATE TABLE ganadores (
    id BIGINCREMENT PRIMARY KEY,
    instancia_sorteo_id BIGINT,
    carton_number VARCHAR(128),
    premio_instancia_id BIGINT, -- Vinculado al premio específico de esa fecha
    winning_position INT,
    
    inscripto_id BIGINT, -- Referencia a CADA UNO de los inscriptos con ese cartón
    
    created_at TIMESTAMP
);
```

### 2.4. Tabla `entregas_premios` (Confirmación)
Registra a quién se le entregó efectivamente el premio (de la lista de posibles ganadores).

```sql
CREATE TABLE entregas_premios (
    id BIGINCREMENT PRIMARY KEY,
    ganador_id BIGINT UNIQUE, -- Vincula al registro específico de la tabla ganadores seleccionado
    
    fecha_entrega DATETIME DEFAULT NOW(),
    dni_receptor VARCHAR(64), -- DNI de quien retira (puede ser distinto al inscripto)
    nombre_receptor VARCHAR(255),
    observaciones TEXT NULL,
    foto_evidencia_path VARCHAR(255) NULL,
    
    created_at TIMESTAMP,
    FOREIGN KEY (ganador_id) REFERENCES ganadores(id)
);
```

## 3. Flujo de Trabajo

### 3.1. Fase de Importación (Inscriptos)
1.  **Entrada**: CSV Acumulado (contiene inscriptos desde el día 1 hasta hoy).
2.  **Proceso**:
    -   Se lee el CSV.
    -   Se intenta insertar en la tabla `inscriptos` usando `INSERT IGNORE` o `upsert`.
    -   **Resultado**: Solo se agregan los registros nuevos que no existían en cargas anteriores (gracias al UNIQUE index). Los datos históricos se preservan.

### 3.2. Fase de Procesamiento (Limpieza y Carga)
Antes de ejecutar una instancia de sorteo, se debe preparar la tabla de participantes válidos.

1.  **Limpieza Previa**: Se eliminan TODOS los registros de la tabla `participantes_sorteo` correspondientes al `sorteo_id` actual. Esto asegura que no queden "residuos" de procesamientos anteriores o pruebas fallidas.
    ```sql
    DELETE FROM participantes_sorteo WHERE sorteo_id = ?;
    ```
2.  **Selección de Inscriptos Únicos**:
    -   Se seleccionan los `carton_number` distintos de la tabla `inscriptos` para ese sorteo.
    -   Se filtran aquellos que YA existen en la tabla `ganadores` (histórico global de ganadores).
3.  **Carga Masiva (Bulk Insert)**:
    -   Se insertan los cartones resultantes en `participantes_sorteo`.
    -   Al finalizar, esta tabla contiene la "foto" exacta y limpia de quiénes juegan en esta fecha.

### 3.3. Fase de Sorteo (Ejecución)
1.  **Selección**: El algoritmo elige un registro al azar de `participantes_sorteo`.
    -   Ya no hace falta hacer `DISTINCT` ni `WHERE NOT IN` costosos en tiempo real, porque la tabla ya está limpia.
    -   Complejidad: O(1). Extremadamente rápido y seguro.
2.  **Resolución**:
    -   Obtiene el `carton_number` ganador.
    -   Busca en `inscriptos` a **TODOS** los dueños de ese cartón para notificarles.
    -   Registra en `ganadores`.

### 3.4. Fase de Resolución y Entrega de Premios
1.  **Registro de Ganadores**:
    -   Al salir sorteado el cartón "12345", el sistema busca en `inscriptos` a Juan, Pedro y María (todos compraron el 12345).
    -   Inserta 3 registros en la tabla `ganadores` (uno por cada inscripto). Todos tienen estado "ganador".

2.  **Gestión de Entrega**:
    -   El operador ve en el sistema que el cartón "12345" tiene 3 posibles dueños.
    -   Al presentarse "Pedro" a retirar, el operador selecciona su registro.
    -   Se crea un registro en `entregas_premios` vinculado al `id` de Pedro en la tabla `ganadores`.
    -   Esto cierra el ciclo administrativo.

## 4. Ventajas de este Enfoque
1.  **Integridad**: Separa "lo que mandó el cliente" (Inscriptos) de "lo que es válido para jugar" (Participantes).
2.  **Performance**: El sorteo es instantáneo, todo el trabajo pesado se hace en el paso previo de "Limpieza".
3.  **Auditabilidad**: Podemos decir exactamente cuántos cartones únicos entraron al bolillero virtual antes de tirar la primera bolilla.
4.  **Manejo de Instancias**: Al filtrar contra `ganadores`, un cartón que ganó el 14/03 ya no pasará a la tabla `participantes_sorteo` del 28/03, aunque siga estando en el CSV acumulado de `inscriptos`.

## 5. Plan de Tareas
- [ ] Renombrar tabla actual `participantes` a `inscriptos` y ajustar columnas.
- [ ] Crear tabla `participantes_sorteo` (la "tabla limpia").
- [ ] Crear tabla `ganadores`.
- [ ] Crear Action `ProcesarParticipantesAction`: Inscriptos -> Deduplicación -> Participantes Sorteo.
- [ ] Ajustar importador CSV para apuntar a `inscriptos`.
- [ ] Ajustar Sorteador para leer de `participantes_sorteo`.
