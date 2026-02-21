import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

export interface UserListItem {
  id: string
  email: string
  name: string
  username: string
  role: string
  isActive: boolean
  isFirstLogin: boolean
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
}

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UsersResponse {
  data: UserListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useUsers(filters?: UserFilters, page: number = 1, limit: number = 10) {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, unknown> = {
          page,
          limit,
        }

        if (filters?.search) {
          params.search = filters.search
        }
        if (filters?.role) {
          params.role = filters.role
        }
        if (filters?.isActive !== undefined) {
          params.isActive = filters.isActive
        }

        const response = await api.get('/v1/users', params)
        if (response.ok) {
          const result: UsersResponse = await response.json()
          setUsers(result.data)
          setPagination({
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          })
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Erro ao carregar usuários')
        }
      } catch (err) {
        setError('Erro ao carregar usuários')
        console.error('Erro ao buscar usuários:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [api, page, limit, filters?.search, filters?.role, filters?.isActive])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, unknown> = {
        page,
        limit,
      }

      if (filters?.search) {
        params.search = filters.search
      }
      if (filters?.role) {
        params.role = filters.role
      }
      if (filters?.isActive !== undefined) {
        params.isActive = filters.isActive
      }

      const response = await api.get('/v1/users', params)
      if (response.ok) {
        const result: UsersResponse = await response.json()
        setUsers(result.data)
        setPagination({
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao carregar usuários')
      }
    } catch (err) {
      setError('Erro ao carregar usuários')
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setLoading(false)
    }
  }, [api, page, limit, filters?.search, filters?.role, filters?.isActive])

  const activateUser = async (id: string) => {
    try {
      const response = await api.patch(`/v1/users/${id}/activate`, {})
      if (response.ok) {
        await refetch()
        return true
      }
      return false
    } catch (err) {
      console.error('Erro ao ativar usuário:', err)
      return false
    }
  }

  const deactivateUser = async (id: string) => {
    try {
      const response = await api.patch(`/v1/users/${id}/deactivate`, {})
      if (response.ok) {
        await refetch()
        return true
      }
      return false
    } catch (err) {
      console.error('Erro ao desativar usuário:', err)
      return false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const response = await api.delete(`/v1/users/${id}`)
      if (response.ok) {
        await refetch()
        return true
      }
      return false
    } catch (err) {
      console.error('Erro ao deletar usuário:', err)
      return false
    }
  }

  const createUser = async (payload: {
    name: string
    email: string
    username: string
    role: string
  }) => {
    const response = await api.post('/v1/users', payload)
    if (response.ok) {
      await refetch()
      return { ok: true as const }
    }
    const data = await response.json().catch(() => ({}))
    return { ok: false as const, message: data.message || 'Erro ao criar usuário' }
  }

  const updateUser = async (
    id: string,
    payload: { name?: string; email?: string; username?: string; role?: string }
  ) => {
    const response = await api.patch(`/v1/users/${id}`, payload)
    if (response.ok) {
      await refetch()
      return { ok: true as const }
    }
    const data = await response.json().catch(() => ({}))
    return { ok: false as const, message: data.message || 'Erro ao atualizar usuário' }
  }

  return {
    users,
    pagination,
    loading,
    error,
    refetch,
    activateUser,
    deactivateUser,
    deleteUser,
    createUser,
    updateUser,
  }
}
