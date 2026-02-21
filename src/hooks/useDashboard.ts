import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

export interface AthletesByCategory {
  category: string
  count: number
}

export interface DashboardData {
  athletesByCategory: AthletesByCategory[]
  totalAthletes: number
  activeAthletes: number
  totalUsers: number
  referenceYear: number
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/v1/dashboard')
      if (response.ok) {
        const json = await response.json()
        setData(json)
      } else {
        setError('Erro ao carregar dados do dashboard')
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  }
}
