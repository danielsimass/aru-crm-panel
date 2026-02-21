import { useMemo } from 'react'
import { getOnUnauthorized } from '../lib/onUnauthorized'

/**
 * Hook para fazer requisições HTTP com suporte a cookies de autenticação.
 * Em resposta 401 (não autorizado), chama o handler registrado (logout + redirect para login).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface RequestOptions extends RequestInit {
  body?: unknown
  params?: Record<string, unknown>
}

export function useApi() {
  return useMemo(() => {
    const request = async (
      endpoint: string,
      options: RequestOptions = {}
    ): Promise<Response> => {
      const { body, headers = {}, params, ...restOptions } = options

      const config: RequestInit = {
        ...restOptions,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include', // Importante: inclui cookies nas requisições
      }

      // Se body for um objeto, converte para JSON
      if (body && typeof body === 'object') {
        config.body = JSON.stringify(body)
      } else if (body) {
        config.body = body as BodyInit
      }

      // Construir URL com query params
      let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
      
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }

      try {
        const response = await fetch(url, config)

        // 401 em /v1/auth/me = usuário não logado; 401 em /v1/auth/login = credenciais erradas.
        // Nesses casos não fazer logout/redirect.
        const isAuthCheckOrLogin = endpoint.includes('/v1/auth/me') || endpoint.includes('/v1/auth/login')
        if (response.status === 401 && !isAuthCheckOrLogin) {
          getOnUnauthorized()?.()
          return response
        }

        return response
      } catch (error) {
        console.error('Erro na requisição:', error)
        throw error
      }
    }

    return {
      get: (endpoint: string, params?: Record<string, unknown>, options?: RequestOptions) =>
        request(endpoint, { ...options, method: 'GET', params }),
      
      post: (endpoint: string, body?: unknown, options?: RequestOptions) =>
        request(endpoint, { ...options, method: 'POST', body }),
      
      put: (endpoint: string, body?: unknown, options?: RequestOptions) =>
        request(endpoint, { ...options, method: 'PUT', body }),
      
      patch: (endpoint: string, body?: unknown, options?: RequestOptions) =>
        request(endpoint, { ...options, method: 'PATCH', body }),
      
      delete: (endpoint: string, options?: RequestOptions) =>
        request(endpoint, { ...options, method: 'DELETE' }),
    }
  }, [])
}
