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
import { UserForm, UserFormValues } from './components/UserForm'
import { useUsers, UserListItem, UserFilters } from '../../hooks/useUsers'
import { useToast } from '../../hooks/useToast'

export default function UsersPage() {
  // Estados para os valores dos inputs (não aplicados automaticamente)
  const [searchValue, setSearchValue] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  // Estado para os filtros aplicados (usados na busca)
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const { users, pagination, loading, error, activateUser, deactivateUser, deleteUser, createUser, updateUser } = useUsers(
    appliedFilters,
    currentPage,
    itemsPerPage
  )

  const { showToast, ToastContainer } = useToast()
  const location = useLocation()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleToggleActive = async (user: UserListItem) => {
    if (user.isActive) {
      const result = await deactivateUser(user.id)
      if (result) {
        showToast('Usuário desativado com sucesso!', 'success')
      } else {
        showToast('Erro ao desativar usuário', 'error')
      }
    } else {
      const result = await activateUser(user.id)
      if (result) {
        showToast('Usuário ativado com sucesso!', 'success')
      } else {
        showToast('Erro ao ativar usuário', 'error')
      }
    }
  }

  const handleDelete = async (user: UserListItem) => {
    if (window.confirm(`Tem certeza que deseja remover o usuário ${user.name}?`)) {
      const result = await deleteUser(user.id)
      if (result) {
        showToast('Usuário removido com sucesso!', 'success')
      } else {
        showToast('Erro ao remover usuário', 'error')
      }
    }
  }

  const handleView = (user: UserListItem) => {
    setEditingUser(user)
    setModalMode('view')
    setFormError(null)
    setModalOpen(true)
  }

  const handleEdit = (user: UserListItem) => {
    setEditingUser(user)
    setModalMode('edit')
    setFormError(null)
    setModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
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
    setEditingUser(null)
    setFormError(null)
  }

  const handleFormSubmit = async (values: UserFormValues) => {
    setFormError(null)
    if (modalMode === 'create') {
      const result = await createUser(values)
      if (result.ok) {
        showToast('Usuário criado com sucesso!', 'success')
        handleCloseModal()
      } else {
        setFormError(result.message)
      }
    } else if (editingUser) {
      const result = await updateUser(editingUser.id, values)
      if (result.ok) {
        showToast('Usuário atualizado com sucesso!', 'success')
        handleCloseModal()
      } else {
        setFormError(result.message)
      }
    }
  }

  const handleSearch = () => {
    // Aplicar os filtros apenas quando o botão for clicado
    const newFilters: UserFilters = {}
    
    if (searchValue.trim()) {
      newFilters.search = searchValue.trim()
    }
    if (roleFilter) {
      newFilters.role = roleFilter
    }
    if (statusFilter !== '') {
      newFilters.isActive = statusFilter === 'true'
    }
    
    setAppliedFilters(newFilters)
    setCurrentPage(1) // Resetar para primeira página ao filtrar
  }

  const handleClearFilters = () => {
    // Limpar tanto os inputs quanto os filtros aplicados
    setSearchValue('')
    setRoleFilter('')
    setStatusFilter('')
    setAppliedFilters({})
    setCurrentPage(1)
  }

  const columns: Column<UserListItem>[] = [
    {
      key: 'name',
      label: 'Nome',
    },
    {
      key: 'username',
      label: 'Usuário',
    },
    {
      key: 'email',
      label: 'E-mail',
    },
    {
      key: 'role',
      label: 'Função',
      render: (value) => {
        const roleLabels: Record<string, string> = {
          admin: 'Administrador',
          manager: 'Gerente',
          user: 'Usuário',
        }
        return <span className="text-neutral-300">{roleLabels[value as string] || value}</span>
      },
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
      key: 'isFirstLogin',
      label: 'Primeiro Acesso',
      render: (value) => (
        <Badge variant={value ? 'accent' : 'neutral'}>
          {value ? 'Sim' : 'Não'}
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
                label: row.isActive ? 'Desativar' : 'Ativar',
                onClick: () => handleToggleActive(row),
                variant: 'default',
              },
              {
                label: 'Excluir',
                onClick: () => handleDelete(row),
                variant: 'danger',
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const roleOptions = [
    { value: '', label: 'Todas as funções' },
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'user', label: 'Usuário' },
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
            <h1 className="text-3xl font-bold text-neutral-100">Gerenciar Usuários</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Visualize e gerencie os usuários do sistema.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={handleOpenCreate} size="sm">
              Adicionar usuário
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <TableFilters>
          <Input
            label="Buscar"
            placeholder="Nome, e-mail ou usuário"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <Select
            label="Função"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roleOptions}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
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
        {loading && users.length === 0 ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden border border-neutral-800 sm:rounded-lg">
              <div className="flex items-center justify-center py-16 bg-neutral-900/50">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
                  <p className="mt-4 text-sm text-neutral-400">Carregando usuários...</p>
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
            data={users}
            columns={columns}
            pagination={{
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              totalItems: pagination.total,
              itemsPerPage: pagination.limit,
              onPageChange: setCurrentPage,
            }}
            onRowClick={(user) => {
              console.log('Clicou no usuário:', user)
            }}
            emptyMessage="Nenhum usuário encontrado com os filtros aplicados."
          />
        )}

        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          title={
            modalMode === 'create'
              ? 'Novo usuário'
              : modalMode === 'view'
                ? 'Visualizar usuário'
                : 'Editar usuário'
          }
          footer={null}
        >
          <UserForm
            mode={modalMode}
            initialData={
              editingUser
                ? {
                    name: editingUser.name,
                    email: editingUser.email,
                    username: editingUser.username,
                    role: editingUser.role,
                  }
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
