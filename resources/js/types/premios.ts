export interface PremioItem {
  id: number
  nombre: string
  descripcion: string | null
  posicion?: number | null
  created_at: string | null
  updated_at: string | null
  sorteos?: Array<{ id: number; nombre: string; fecha: string | null; posicion: number | null }>
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

export interface PremioListResponse {
  data: PremioItem[]
  links?: PaginationLinks
  meta?: PaginationMeta
  status?: 'ok' | 'error'
  error?: { message: string }
}
