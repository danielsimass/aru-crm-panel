import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

export interface AthleteListItem {
  id: string
  fullName: string
  birthDate: string
  phone: string
  guardianName: string
  guardianPhone: string
  isActive: boolean
  registrationDate: string
  email: string | null
  cpf: string | null
  heightCm: number | null
  weightKg: number | null
  dominantHand: string | null
  notes: string | null
  photo: string | null
  createdAt: string
  updatedAt: string
  category: string
}

export interface AthleteFilters {
  isActive?: boolean
  minHeight?: number
  maxHeight?: number
  name?: string
  notes?: string
}

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AthletesResponse {
  data: AthleteListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useAthletes(filters: AthleteFilters = {}, page: number = 1, limit: number = 10) {
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()

  const fetchAthletes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, unknown> = {
        page,
        limit,
      }

      if (filters.isActive !== undefined) {
        params.isActive = filters.isActive
      }
      if (filters.minHeight !== undefined) {
        params.minHeight = filters.minHeight
      }
      if (filters.maxHeight !== undefined) {
        params.maxHeight = filters.maxHeight
      }
      if (filters.name !== undefined && filters.name.trim() !== '') {
        params.name = filters.name.trim()
      }
      if (filters.notes !== undefined && filters.notes.trim() !== '') {
        params.notes = filters.notes.trim()
      }

      const response = await api.get('/v1/athletes', params)
      if (response.ok) {
        const result: AthletesResponse = await response.json()
        setAthletes(result.data)
        setPagination({
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao carregar atletas')
      }
    } catch (err) {
      setError('Erro ao carregar atletas')
      console.error('Erro ao buscar atletas:', err)
    } finally {
      setLoading(false)
    }
  }, [api, page, limit, filters.isActive, filters.minHeight, filters.maxHeight, filters.name, filters.notes])

  useEffect(() => {
    fetchAthletes()
  }, [fetchAthletes])

  const deactivateAthlete = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/v1/athletes/${id}`)
      if (response.ok) {
        await fetchAthletes()
        return true
      }
      return false
    } catch (err) {
      console.error('Erro ao desativar atleta:', err)
      return false
    }
  }, [api, fetchAthletes])

  type CreatePayload = {
    fullName: string
    birthDate: string
    phone: string
    guardianName: string
    guardianPhone: string
    isActive?: boolean
    email?: string
    cpf?: string
    heightCm?: number
    weightKg?: number
    dominantHand?: string
    notes?: string
  }

  type UpdatePayload = Partial<CreatePayload>

  function buildAthleteFormData(payload: CreatePayload | UpdatePayload, photoFile?: File | null): FormData {
    const form = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      form.append(key, String(value))
    })
    if (photoFile) {
      form.append('photo', photoFile)
    }
    return form
  }

  const createAthlete = async (payload: CreatePayload, photoFile?: File | null) => {
    const formData = buildAthleteFormData(payload, photoFile)
    const response = await api.post('/v1/athletes', formData)
    if (response.ok) {
      await fetchAthletes()
      return { ok: true as const }
    }
    const data = await response.json().catch(() => ({}))
    return { ok: false as const, message: data.message || 'Erro ao criar atleta' }
  }

  const updateAthlete = async (id: string, payload: UpdatePayload, photoFile?: File | null) => {
    const formData = buildAthleteFormData(payload, photoFile)
    const response = await api.patch(`/v1/athletes/${id}`, formData)
    if (response.ok) {
      await fetchAthletes()
      return { ok: true as const }
    }
    const data = await response.json().catch(() => ({}))
    return { ok: false as const, message: data.message || 'Erro ao atualizar atleta' }
  }

  return {
    athletes,
    pagination,
    loading,
    error,
    refetch: fetchAthletes,
    deactivateAthlete,
    createAthlete,
    updateAthlete,
  }
}
