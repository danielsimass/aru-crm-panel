import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LoginError {
  message: string
}

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (loginValue: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      await login(loginValue, password)
      navigate('/') // Redireciona para a página inicial após login
    } catch (err) {
      const error = err as LoginError
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return {
    login: handleLogin,
    loading,
    error,
  }
}
