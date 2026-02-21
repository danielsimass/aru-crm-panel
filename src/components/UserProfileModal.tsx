import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../hooks/useApi'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { PasswordRequirements } from './ui/PasswordRequirements'
import { useToast } from '../hooks/useToast'
import * as yup from 'yup'
import { yupErrorsToFieldErrors, passwordRules } from '../lib/validation'

interface UserProfileModalProps {
  open: boolean
  onClose: () => void
}

const profileSchema = yup.object({
  name: yup.string().trim().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
})

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Senha atual é obrigatória'),
  newPassword: passwordRules,
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
})

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const { user, checkAuth } = useAuth()
  const api = useApi()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [loading, setLoading] = useState(false)

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({})

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  // Reset forms when modal opens/closes
  useEffect(() => {
    if (open && user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setProfileErrors({})
      setPasswordErrors({})
      setActiveTab('profile')
    }
  }, [open, user])

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileErrors({})

    try {
      await profileSchema.validate({ name, email }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setProfileErrors(yupErrorsToFieldErrors(err))
      }
      return
    }

    if (!user) return

    setLoading(true)
    try {
      const response = await api.patch('/v1/auth/profile', { name: name.trim(), email: email.trim() })
      if (response.ok) {
        showToast('Perfil atualizado com sucesso!', 'success')
        await checkAuth() // Atualizar dados do usuário
        onClose()
      } else {
        const error = await response.json()
        showToast(error.message || 'Erro ao atualizar perfil', 'error')
      }
    } catch (err) {
      showToast('Erro ao atualizar perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordErrors({})

    try {
      await passwordSchema.validate({ currentPassword, newPassword, confirmPassword }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setPasswordErrors(yupErrorsToFieldErrors(err))
      }
      return
    }

    setLoading(true)
    try {
      const response = await api.patch('/v1/auth/password', {
        currentPassword,
        newPassword,
      })
      if (response.ok) {
        showToast('Senha alterada com sucesso!', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        onClose()
      } else {
        const error = await response.json()
        showToast(error.message || 'Erro ao alterar senha', 'error')
      }
    } catch (err) {
      showToast('Erro ao alterar senha', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Meu Perfil"
      footer={null}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Perfil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Senha
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4" noValidate>
            <div>
              <p className="text-sm text-neutral-400 mb-4">
                Atualize suas informações de perfil
              </p>
            </div>

            <Input
              label="Nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={profileErrors.name}
              placeholder="Seu nome completo"
            />

            <Input
              label="E-mail"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={profileErrors.email}
              placeholder="seu@email.com"
            />

            {user?.role && (
              <Input
                label="Função"
                type="text"
                value={user.role}
                disabled
                className="bg-neutral-800"
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="neutral" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <div>
              <p className="text-sm text-neutral-400 mb-4">
                Altere sua senha de acesso
              </p>
            </div>

            <Input
              label="Senha Atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.currentPassword}
              placeholder="••••••••"
            />

            <Input
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.newPassword}
              placeholder="••••••••"
            />
            <PasswordRequirements password={newPassword} className="mt-1" />

            <Input
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passwordErrors.confirmPassword}
              placeholder="••••••••"
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
              <Button type="button" variant="neutral" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
