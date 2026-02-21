import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useApi } from '../hooks/useApi'
import { User } from '../types/user'
import { setOnUnauthorized } from '../lib/onUnauthorized'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const api = useApi()

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/v1/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [api])

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (login: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.post('/v1/auth/login', { login, password })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer login')
      }

      const userData = await response.json()
      // O backend retorna userId, mas mantemos compatibilidade
      setUser(userData)
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await api.post('/v1/auth/logout', {})
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setLoading(false)
    }
  }, [api])

  // Registrar handler para 401: logout e redirecionar para login (após logout estar definido)
  useEffect(() => {
    setOnUnauthorized(() => {
      logout().then(() => {
        window.location.href = '/login'
      })
    })
    return () => setOnUnauthorized(null)
  }, [logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook do contexto, padrão do React
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
