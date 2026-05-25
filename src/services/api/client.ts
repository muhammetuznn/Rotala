const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api'
const tokenKey = 'rotala.authToken'

export type ApiErrorBody = {
  message?: string
}

export function getAuthToken() {
  return sessionStorage.getItem(tokenKey)
}

export function setAuthToken(token: string) {
  sessionStorage.setItem(tokenKey, token)
}

export function clearAuthToken() {
  sessionStorage.removeItem(tokenKey)
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (response.status === 204) {
    return undefined as T
  }

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody

  if (!response.ok) {
    throw new Error(data.message ?? 'API isteği tamamlanamadı.')
  }

  return data
}
