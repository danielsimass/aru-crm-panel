import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Table, Column } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { DropdownMenu } from '../../components/ui/DropdownMenu'
import { TableFilters } from '../../components/ui/TableFilters'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { AthleteForm, AthleteFormValues, AthleteFormInitialData } from './components/AthleteForm'
import { useAthletes, AthleteListItem, AthleteFilters } from '../../hooks/useAthletes'
import { useToast } from '../../hooks/useToast'

export default function AthletesPage() {
  // Estados para os valores dos inputs (não aplicados automaticamente)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [nameFilter, setNameFilter] = useState<string>('')
  const [notesFilter, setNotesFilter] = useState<string>('')
  const [minHeight, setMinHeight] = useState<string>('')
  const [maxHeight, setMaxHeight] = useState<string>('')
  
  // Estado para os filtros aplicados (usados na busca)
  const [appliedFilters, setAppliedFilters] = useState<AthleteFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const { athletes, pagination, loading, error, deactivateAthlete, createAthlete, updateAthlete } = useAthletes(
    appliedFilters,
    currentPage,
    itemsPerPage
  )

  const { showToast, ToastContainer } = useToast()
  const location = useLocation()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteListItem | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Abrir modal de criação se vier da home page
  useEffect(() => {
    if (location.state?.openCreateModal) {
      handleOpenCreate()
      // Limpar o state para não abrir novamente ao navegar
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleDelete = async (athlete: AthleteListItem) => {
    if (window.confirm(`Tem certeza que deseja desativar o atleta ${athlete.fullName}?`)) {
      const result = await deactivateAthlete(athlete.id)
      if (result) {
        showToast('Atleta desativado com sucesso!', 'success')
      } else {
        showToast('Erro ao desativar atleta', 'error')
      }
    }
  }

  const handleView = (athlete: AthleteListItem) => {
    setSelectedAthlete(athlete)
    setModalMode('view')
    setFormError(null)
    setModalOpen(true)
  }

  const handleEdit = (athlete: AthleteListItem) => {
    setSelectedAthlete(athlete)
    setModalMode('edit')
    setFormError(null)
    setModalOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedAthlete(null)
    setModalMode('create')
    setFormError(null)
    setModalOpen(true)
  }

  // Abrir modal de criação se vier da home page
  useEffect(() => {
    if (location.state?.openCreateModal) {
      handleOpenCreate()
      // Limpar o state para não abrir novamente ao navegar
      window.history.replaceState({}, document.title)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedAthlete(null)
    setFormError(null)
  }

  const toPayload = (v: AthleteFormValues) => {
    const heightNum = v.heightCm.trim() ? parseFloat(v.heightCm) : NaN
    const weightNum = v.weightKg.trim() ? parseFloat(v.weightKg) : NaN
    return {
      fullName: v.fullName.trim(),
      birthDate: v.birthDate.trim(),
      phone: v.phone.trim(),
      guardianName: v.guardianName.trim(),
      guardianPhone: v.guardianPhone.trim(),
      isActive: v.isActive === 'true',
      email: v.email.trim() || undefined,
      cpf: v.cpf.trim() || undefined,
      heightCm: !isNaN(heightNum) ? heightNum : undefined,
      weightKg: !isNaN(weightNum) ? weightNum : undefined,
      dominantHand: v.dominantHand.trim() || undefined,
      notes: v.notes.trim() || undefined,
    }
  }

  const handleFormSubmit = async (values: AthleteFormValues) => {
    setFormError(null)
    const payload = toPayload(values)
    if (modalMode === 'create') {
      const result = await createAthlete(payload)
      if (result.ok) {
        showToast('Atleta criado com sucesso!', 'success')
        handleCloseModal()
      } else {
        setFormError(result.message)
      }
    } else if (selectedAthlete) {
      const result = await updateAthlete(selectedAthlete.id, payload)
      if (result.ok) {
        showToast('Atleta atualizado com sucesso!', 'success')
        handleCloseModal()
      } else {
        setFormError(result.message)
      }
    }
  }

  const handleSearch = () => {
    // Aplicar os filtros apenas quando o botão for clicado
    const newFilters: AthleteFilters = {}
    
    if (statusFilter !== '') {
      newFilters.isActive = statusFilter === 'true'
    }
    if (nameFilter.trim()) {
      newFilters.name = nameFilter.trim()
    }
    if (notesFilter.trim()) {
      newFilters.notes = notesFilter.trim()
    }
    if (minHeight.trim()) {
      const minHeightNum = parseFloat(minHeight)
      if (!isNaN(minHeightNum)) {
        newFilters.minHeight = minHeightNum
      }
    }
    if (maxHeight.trim()) {
      const maxHeightNum = parseFloat(maxHeight)
      if (!isNaN(maxHeightNum)) {
        newFilters.maxHeight = maxHeightNum
      }
    }
    
    setAppliedFilters(newFilters)
    setCurrentPage(1) // Resetar para primeira página ao filtrar
  }

  const handleClearFilters = () => {
    // Limpar tanto os inputs quanto os filtros aplicados
    setStatusFilter('')
    setNameFilter('')
    setNotesFilter('')
    setMinHeight('')
    setMaxHeight('')
    setAppliedFilters({})
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Verifica se é celular (11 dígitos) ou fixo (10 dígitos)
    if (cleaned.length === 11) {
      // Formato celular: (XX) XXXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
      // Formato fixo: (XX) XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    // Se não tiver 10 ou 11 dígitos, retorna o valor original
    return phone
  }

  const columns: Column<AthleteListItem>[] = [
    {
      key: 'fullName',
      label: 'Nome Completo',
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (value) => (
        <Badge variant="accent">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'birthDate',
      label: 'Data de Nascimento',
      render: (value) => (
        <span className="text-neutral-300">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (value) => (
        <span className="text-neutral-300">{formatPhone(value as string)}</span>
      ),
    },
    {
      key: 'guardianName',
      label: 'Responsável',
    },
    {
      key: 'notes',
      label: 'Observações',
      className: 'max-w-[160px]',
      render: (value) => {
        const notes = (value as string) || ''
        const maxLen = 40
        const truncated = notes.length > maxLen ? `${notes.slice(0, maxLen)}…` : notes
        return (
          <span className="text-neutral-300 block truncate" title={notes || undefined}>
            {truncated || '-'}
          </span>
        )
      },
    },
    {
      key: 'heightCm',
      label: 'Altura (cm)',
      render: (value) => (
        <span className="text-neutral-300">
          {value ? `${value} cm` : '-'}
        </span>
      ),
    },
    {
      key: 'weightKg',
      label: 'Peso (kg)',
      render: (value) => (
        <span className="text-neutral-300">
          {value ? `${value} kg` : '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value, row) => (
        <Badge variant={row.isActive ? 'primary' : 'neutral'}>
          {row.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right w-12',
      render: (_, row) => (
        <div className="flex items-center justify-end">
          <DropdownMenu
            items={[
              {
                label: 'Visualizar',
                onClick: () => handleView(row),
                variant: 'default',
              },
              {
                label: 'Editar',
                onClick: () => handleEdit(row),
                variant: 'default',
              },
              {
                label: 'Desativar',
                onClick: () => handleDelete(row),
                variant: 'danger',
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'true', label: 'Ativo' },
    { value: 'false', label: 'Inativo' },
  ]

  // Toast ao falhar a requisição da tabela
  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <Layout>
      <div>
        {/* Cabeçalho com título, descrição e botão */}
        <div className="sm:flex sm:items-center mb-6 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-neutral-100">Gerenciar Atletas</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Visualize e gerencie os atletas do sistema.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={handleOpenCreate} size="sm">
              Adicionar atleta
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <TableFilters>
          <Input
            label="Nome"
            type="text"
            placeholder="Buscar por nome"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />
          <Input
            label="Observações"
            type="text"
            placeholder="Buscar nas observações"
            value={notesFilter}
            onChange={(e) => setNotesFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Input
            label="Altura mínima (cm)"
            type="number"
            placeholder="Ex: 160"
            value={minHeight}
            onChange={(e) => setMinHeight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <Input
            label="Altura máxima (cm)"
            type="number"
            placeholder="Ex: 190"
            value={maxHeight}
            onChange={(e) => setMaxHeight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <div className="flex gap-2">
            <Button onClick={handleSearch} size="sm">
              Filtrar
            </Button>
            <Button
              variant="neutral"
              onClick={handleClearFilters}
              size="sm"
            >
              Limpar
            </Button>
          </div>
        </TableFilters>

        {/* Tabela */}
        {loading && athletes.length === 0 ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden border border-neutral-800 sm:rounded-lg">
              <div className="flex items-center justify-center py-16 bg-neutral-900/50">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
                  <p className="mt-4 text-sm text-neutral-400">Carregando atletas...</p>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden border border-neutral-800 sm:rounded-lg">
              <div className="flex items-center justify-center py-16 bg-neutral-900/50">
                <p className="text-sm text-neutral-400">Não foi possível carregar os dados. Tente novamente.</p>
              </div>
            </div>
          </div>
        ) : (
          <Table
            data={athletes as unknown as Record<string, unknown>[]}
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            pagination={{
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              totalItems: pagination.total,
              itemsPerPage: pagination.limit,
              onPageChange: setCurrentPage,
            }}
            onRowClick={(athlete) => {
              console.log('Clicou no atleta:', athlete)
            }}
            emptyMessage="Nenhum atleta encontrado com os filtros aplicados."
          />
        )}

        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          size="lg"
          title={
            modalMode === 'create'
              ? 'Novo atleta'
              : modalMode === 'view'
                ? 'Visualizar atleta'
                : 'Editar atleta'
          }
          footer={null}
        >
          <AthleteForm
            mode={modalMode}
            initialData={
              selectedAthlete
                ? ({
                    fullName: selectedAthlete.fullName,
                    birthDate: selectedAthlete.birthDate,
                    phone: selectedAthlete.phone,
                    guardianName: selectedAthlete.guardianName,
                    guardianPhone: selectedAthlete.guardianPhone,
                    isActive: selectedAthlete.isActive ? 'true' : 'false',
                    email: selectedAthlete.email ?? '',
                    cpf: selectedAthlete.cpf ?? '',
                    heightCm: selectedAthlete.heightCm,
                    weightKg: selectedAthlete.weightKg,
                    dominantHand: selectedAthlete.dominantHand ?? '',
                    notes: selectedAthlete.notes ?? '',
                  } satisfies AthleteFormInitialData)
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            submitError={formError}
          />
        </Modal>
        <ToastContainer />
      </div>
    </Layout>
  )
}
