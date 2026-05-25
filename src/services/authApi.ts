import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from './api/client'

export type RotalaUser = {
  id: string
  email: string
  displayName?: string
}

type AuthResponse = {
  token: string
  user: RotalaUser
}

export async function getCurrentUser(): Promise<RotalaUser | null> {
  if (!getAuthToken()) return null

  try {
    const response = await apiFetch<{ user: RotalaUser }>('/auth/me')
    return response.user
  } catch {
    clearAuthToken()
    return null
  }
}

export async function signIn(email: string, password: string): Promise<RotalaUser> {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  setAuthToken(response.token)
  return response.user
}

export async function signUp(email: string, password: string): Promise<RotalaUser> {
  const response = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  setAuthToken(response.token)
  return response.user
}

export async function signOut() {
  clearAuthToken()
}
