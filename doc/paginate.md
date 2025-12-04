# Componente Paginate

## Descripción

`Paginate` es un componente reutilizable de React que centraliza la lógica de ordenamiento y paginación. Es independiente de la UI y del origen de datos: puede trabajar con arreglos en memoria (modo local) o en modo controlado (remoto), donde los cambios de página y orden se delegan al contenedor (por ejemplo, navegación con Inertia o una llamada a API).

## Instalación

- Importa desde `@/components/Paginate`.

## Props

`Paginate<T, K extends keyof T>` soporta dos modos.

### Comunes

- `data: T[]` — elementos a mostrar.
- `children(ctx)` — render prop que recibe:
  - `items: T[]` — elementos de la página actual.
  - `sort: K | null` — clave de orden actual.
  - `direction: 'asc' | 'desc'` — dirección de orden.
  - `meta` — `{ page, per_page, total, last_page, sort, direction }`.
  - `onToggleSort(key: K)` — alterna el orden por columna.
  - `onPrevPage()` — va a la página anterior.
  - `onNextPage()` — va a la página siguiente.

### Modo local (en memoria)

Props opcionales:

- `perPage?: number` — ítems por página (por defecto: 10).
- `sortableKeys?: K[]` — llaves permitidas para ordenar.
- `defaultSort?: K` — clave de orden inicial.
- `defaultDirection?: 'asc' | 'desc'` — dirección inicial (por defecto: `asc`).
- `compareFn?: (a: T, b: T, key: K) => number` — comparador personalizado.

En este modo, el orden y la paginación se calculan completamente en el cliente.

### Modo remoto (controlado)

Props requeridas:

- `meta: { page, per_page, total, last_page, sort: K, direction }` — estado de paginación provisto por el servidor.
- `onRequest(params)` — callback invocado al cambiar página/orden con `{ page, sort, direction }`.

El componente no realiza solicitudes de red ni asume una API; únicamente notifica cambios mediante `onRequest`.

## Uso

### Modo local

```tsx
import Paginate from '@/components/Paginate';

type Item = { id: number; name: string; created_at: string };

<Paginate<Item, 'name' | 'created_at'>
  data={items}
  perPage={20}
  sortableKeys={['name', 'created_at']}
  defaultSort={'created_at'}
  defaultDirection={'desc'}
>
  {({ items, sort, direction, meta, onToggleSort, onPrevPage, onNextPage }) => (
    <div>
      {/* Renderiza tu tabla y usa onToggleSort/onPrevPage/onNextPage */}
    </div>
  )}
</Paginate>
```

### Modo remoto

```tsx
import Paginate from '@/components/Paginate';

type Item = { id: number; name: string; created_at: string };

<Paginate<Item, 'name' | 'created_at'>
  data={serverData}
  meta={serverMeta}
  onRequest={({ page, sort, direction }) => {
    // Dispara la navegación o la petición con los nuevos parámetros
  }}
>
  {({ items, sort, direction, meta, onToggleSort, onPrevPage, onNextPage }) => (
    <div>
      {/* Renderiza tu tabla */}
    </div>
  )}
</Paginate>
```

## Consideraciones de diseño

- Independiente de la UI: usa un render prop para evitar acoplar estilos o layout.
- Independiente del origen de datos: no realiza fetch; en modo remoto delega en `onRequest`.
- Tipado genérico: especifica el shape del ítem y las llaves de orden permitidas.
- Comportamiento predecible: en local, ordena y pagina en memoria; en remoto, defiere al estado del contenedor.

## Ejemplo de integración

Consulta `resources/js/pages/sorteo/components/sorteoList.tsx` para una integración completa usando el modo remoto con navegación mediante Inertia.
