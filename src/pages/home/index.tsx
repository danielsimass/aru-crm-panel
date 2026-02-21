import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useDashboard } from '../../hooks/useDashboard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export default function Home() {
  const navigate = useNavigate()
  const { data, loading, error } = useDashboard()

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-neutral-400">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded-md bg-error-500/10 border border-error-500/30 p-4">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      </Layout>
    )
  }

  if (!data) {
    return null
  }

  // Calcular porcentagem de atletas ativos
  const activePercentage = data.totalAthletes > 0 
    ? Math.round((data.activeAthletes / data.totalAthletes) * 100) 
    : 0

  // Encontrar a categoria com mais atletas
  const topCategory = data.athletesByCategory.reduce((prev, current) => 
    (prev.count > current.count) ? prev : current
  , data.athletesByCategory[0] || { category: '-', count: 0 })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100">
              Dashboard
            </h1>
            <p className="mt-2 mr-2 text-sm text-neutral-400">
              Visão geral do sistema - Ano de referência: {data.referenceYear}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/users')} variant="neutral" size="sm">
              Ver Usuários
            </Button>
            <Button onClick={() => navigate('/athletes')} variant="neutral" size="sm">
              Ver Atletas
            </Button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Total de Atletas */}
          <Card className="p-6 hover:border-primary-600/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Total de Atletas</p>
                <p className="text-3xl font-bold text-neutral-100">{data.totalAthletes}</p>
              </div>
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card: Atletas Ativos */}
          <Card className="p-6 hover:border-green-500/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Atletas Ativos</p>
                <p className="text-3xl font-bold text-neutral-100">{data.activeAthletes}</p>
                <p className="text-xs text-neutral-500 mt-1">{activePercentage}% do total</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card: Total de Usuários */}
          <Card className="p-6 hover:border-primary-600/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Total de Usuários</p>
                <p className="text-3xl font-bold text-neutral-100">{data.totalUsers}</p>
              </div>
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card: Categoria com Mais Atletas */}
          <Card className="p-6 hover:border-accent-500/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Categoria Principal</p>
                <p className="text-xl font-bold text-neutral-100">{topCategory.category}</p>
                <p className="text-xs text-neutral-500 mt-1">{topCategory.count} atletas</p>
              </div>
              <div className="p-3 bg-accent-500/20 rounded-lg">
                <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card: Distribuição por Categoria (Grande) */}
          <Card className="md:col-span-2 lg:col-span-2 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-neutral-100 mb-1">
                Distribuição por Categoria
              </h3>
              <p className="text-sm text-neutral-400">
                Atletas distribuídos por faixa etária
              </p>
            </div>
            <div className="space-y-3">
              {data.athletesByCategory.map((item) => {
                const percentage = data.totalAthletes > 0 
                  ? (item.count / data.totalAthletes) * 100 
                  : 0
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-300">{item.category}</span>
                      <span className="text-sm text-neutral-400">{item.count}</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Card: Ações Rápidas */}
          <Card className="md:col-span-2 lg:col-span-2 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-neutral-100 mb-1">
                Ações Rápidas
              </h3>
              <p className="text-sm text-neutral-400">
                Atalhos para operações frequentes
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/users', { state: { openCreateModal: true } })}
                className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-primary-600/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-600/20 rounded-lg group-hover:bg-primary-600/30 transition-colors">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-100">Adicionar Usuário</p>
                    <p className="text-xs text-neutral-400">Criar novo usuário do sistema</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/athletes', { state: { openCreateModal: true } })}
                className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-primary-600/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-600/20 rounded-lg group-hover:bg-primary-600/30 transition-colors">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-100">Adicionar Atleta</p>
                    <p className="text-xs text-neutral-400">Cadastrar novo atleta</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
