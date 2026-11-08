import { auth } from './firebase'

const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  tenantId?: string
}

/** Chamada à API em C#: envia o token do Firebase e a loja (X-Tenant-Id). Corpo FormData vai como upload de arquivo. */
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken()
  const isForm = opts.body instanceof FormData
  // Com FormData, o navegador define o Content-Type (multipart) com o separador certo.
  const headers: Record<string, string> = isForm ? {} : { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.tenantId) headers['X-Tenant-Id'] = opts.tenantId

  const res = await fetch(BASE + path, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
  })

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || `Erro ${res.status}`)
  return data as T
}
