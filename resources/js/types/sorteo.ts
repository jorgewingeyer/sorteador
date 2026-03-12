export type SorteoEstadoCode = 'pendiente' | 'hoy' | 'completado'

export type SorteoEstadoVariant = 'secondary' | 'default' | 'outline'

export interface SorteoEstado {
  code: SorteoEstadoCode
  label: string
  variant: SorteoEstadoVariant
}

export interface InstanciaSorteoItem {
  id: number
  nombre: string
  fecha_ejecucion: string | null
  estado: string
  sorteo_id: number
  created_at: string
}

export interface SorteoItem {
  id: number
  nombre: string
  descripcion: string | null
  is_active: boolean
  created_at: string | null
  instancias?: InstanciaSorteoItem[]
}

export interface SorteoQueryParams {
  page?: number
  per_page?: number
  sort?: 'nombre' | 'created_at'
  direction?: 'asc' | 'desc'
  nombre?: string
}

export type SortDirection = 'asc' | 'desc'
export type SorteoSortKey = 'nombre' | 'created_at'
export interface SorteoMeta {
  sort: SorteoSortKey
  direction: SortDirection
  per_page: number
}

export interface PaginationLinks {
  first?: string | null
  last?: string | null
  prev?: string | null
  next?: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface SorteoListResponse {
  data: SorteoItem[]
  links?: PaginationLinks
  meta?: PaginationMeta
  status?: 'ok' | 'error'
  error?: { message: string }
}

export interface SorteoListProps {
  listSorteos?: SorteoListResponse | null
}
