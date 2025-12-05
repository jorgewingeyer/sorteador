export type SorteoEstadoCode = 'pendiente' | 'hoy' | 'completado'

export type SorteoEstadoVariant = 'secondary' | 'default' | 'outline'

export interface SorteoEstado {
  code: SorteoEstadoCode
  label: string
  variant: SorteoEstadoVariant
}

export interface SorteoItem {
  id: number
  nombre: string
  fecha: string
  estado: SorteoEstado
  status: boolean
  created_at: string | null
}

export interface SorteoQueryParams {
  page?: number
  per_page?: number
  sort?: 'fecha' | 'nombre' | 'created_at'
  direction?: 'asc' | 'desc'
  nombre?: string
  fecha_from?: string
  fecha_to?: string
  estado?: SorteoEstadoCode
}

export type SortDirection = 'asc' | 'desc'
export type SorteoSortKey = 'fecha' | 'nombre' | 'created_at'
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
