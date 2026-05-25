import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser, signIn, signOut, signUp, type RotalaUser } from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState<RotalaUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await signIn(email, password)
    setUser(nextUser)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const nextUser = await signUp(email, password)
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}
