import { useState, useRef, useEffect, FormEvent } from 'react'
import * as yup from 'yup'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { yupErrorsToFieldErrors } from '../../../lib/validation'

export interface UserFormValues {
  name: string
  email: string
  username: string
  role: string
}

/** Gera sugestão de username: primeiro + último nome, lowercased, sem acentos. Ex: "Daniel Monteiro Simas" → "daniel.simas" */
function getSuggestedUsername(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0]
  const last = words.length > 1 ? words[words.length - 1] : first
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]/g, '')
  const firstNorm = normalize(first)
  const lastNorm = normalize(last)
  if (!firstNorm) return ''
  if (firstNorm === lastNorm) return firstNorm
  return `${firstNorm}.${lastNorm}`
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuário' },
  { value: 'manager', label: 'Gerente' },
  { value: 'admin', label: 'Administrador' },
]

const initialValues: UserFormValues = {
  name: '',
  email: '',
  username: '',
  role: 'user',
}

const userSchema = yup.object({
  name: yup.string().trim().required('Nome é obrigatório'),
  email: yup.string().trim().required('E-mail é obrigatório').email('E-mail inválido'),
  username: yup.string().trim().required('Usuário é obrigatório'),
  role: yup.string().oneOf(['admin', 'manager', 'user'], 'Função é obrigatória').required('Função é obrigatória'),
})

interface UserFormProps {
  mode: 'create' | 'edit' | 'view'
  initialData?: Partial<UserFormValues>
  onSubmit?: (values: UserFormValues) => Promise<void>
  onCancel: () => void
  submitError?: string | null
}

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  submitError,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>({
    ...initialValues,
    ...initialData,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const usernameManuallyEdited = useRef(false)

  const isViewMode = mode === 'view'

  // Ao abrir em modo criação, permite sugestão de username de novo
  useEffect(() => {
    if (mode === 'create' && !initialData?.username) usernameManuallyEdited.current = false
  }, [mode, initialData?.username])

  // No modo criação, preenche username como sugestão (primeiro.último) quando o nome muda
  useEffect(() => {
    if (mode !== 'create' || usernameManuallyEdited.current) return
    const suggested = getSuggestedUsername(values.name)
    setValues((v) => (suggested ? { ...v, username: suggested } : v))
  }, [mode, values.name])

  const handleUsernameChange = (value: string) => {
    usernameManuallyEdited.current = true
    setValues((v) => ({ ...v, username: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isViewMode || !onSubmit) return
    try {
      await userSchema.validate(values, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(yupErrorsToFieldErrors<keyof UserFormValues>(err))
      }
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      await onSubmit(values)
    } catch {
      // submitError is passed from parent for API errors
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Nome completo"
            type="text"
            autoComplete="name"
            placeholder="Ex: João Silva"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            error={errors.name}
            disabled={isViewMode}
          />
        </div>
        <Input
          label="E-mail"
          type="text"
          autoComplete="email"
          placeholder="joao@exemplo.com"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors.email}
          disabled={isViewMode}
        />
        <Input
          label="Usuário"
          type="text"
          autoComplete="username"
          placeholder={mode === 'create' ? 'Sugerido a partir do nome' : 'joao.silva'}
          value={values.username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          error={errors.username}
          disabled={isViewMode}
        />
        <div className="sm:col-span-2">
          <Select
            label="Função"
            options={ROLE_OPTIONS}
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
            error={errors.role}
            disabled={isViewMode}
          />
        </div>
      </div>

      {mode === 'create' && (
        <p className="text-sm text-neutral-400">
          O usuário será criado sem senha. Um e-mail será enviado para que ele defina a senha no primeiro acesso.
        </p>
      )}

      {!isViewMode && submitError && (
        <div className="rounded-md bg-error-500/10 border border-error-500/30 px-3 py-2">
          <p className="text-sm text-error-500">{submitError}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {isViewMode ? (
          <Button type="button" onClick={onCancel}>
            Fechar
          </Button>
        ) : (
          <>
            <Button type="button" variant="neutral" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : mode === 'create' ? 'Criar usuário' : 'Salvar'}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
