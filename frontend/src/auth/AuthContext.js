import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('medarchive_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('medarchive_token'))
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      return
    }

    api
      .get('/me')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('medarchive_user', JSON.stringify(data))
      })
      .catch(() => {
        localStorage.removeItem('medarchive_token')
        localStorage.removeItem('medarchive_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/login', credentials)
    localStorage.setItem('medarchive_token', data.token)
    localStorage.setItem('medarchive_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.post('/logout')
      }
    } finally {
      localStorage.removeItem('medarchive_token')
      localStorage.removeItem('medarchive_user')
      setToken(null)
      setUser(null)
    }
  }, [token])

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(token), login, logout }),
    [user, token, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
