import { useState, useEffect, FormEvent } from 'react'
import * as yup from 'yup'
import { Input } from '../../../components/ui/Input'
import { MaskedInput } from '../../../components/ui/MaskedInput'
import { DateInput } from '../../../components/ui/DateInput'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import { Button } from '../../../components/ui/Button'
import { yupErrorsToFieldErrors } from '../../../lib/validation'

export interface AthleteFormValues {
  fullName: string
  birthDate: string
  phone: string
  guardianName: string
  guardianPhone: string
  isActive: string
  email: string
  cpf: string
  heightCm: string
  weightKg: string
  dominantHand: string
  notes: string
}

const DOMINANT_HAND_OPTIONS = [
  { value: '', label: 'Não informado' },
  { value: 'RIGHT', label: 'Direita' },
  { value: 'LEFT', label: 'Esquerda' },
  { value: 'AMBIDEXTROUS', label: 'Ambidestro' },
]

const STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
]

const initialValues: AthleteFormValues = {
  fullName: '',
  birthDate: '',
  phone: '',
  guardianName: '',
  guardianPhone: '',
  isActive: 'true',
  email: '',
  cpf: '',
  heightCm: '',
  weightKg: '',
  dominantHand: '',
  notes: '',
}

function calculateAge(birthDate: string | undefined): number | null {
  if (!birthDate?.trim()) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function isUnder18(birthDate: string | undefined): boolean {
  const age = calculateAge(birthDate)
  return age !== null && age < 18
}

const athleteSchema = yup.object({
  fullName: yup.string().trim().required('Nome completo é obrigatório'),
  birthDate: yup.string().trim().required('Data de nascimento é obrigatória'),
  phone: yup
    .string()
    .trim()
    .required('Telefone é obrigatório')
    .test('min-digits', 'Telefone deve ter pelo menos 10 dígitos', (v: string | undefined) => (v || '').replace(/\D/g, '').length >= 10),
  guardianName: yup
    .string()
    .trim()
    .when('birthDate', {
      is: (birthDate: string | undefined) => isUnder18(birthDate),
      then: (schema) => schema.required('Nome do responsável é obrigatório para menores de 18 anos'),
      otherwise: (schema) => schema.optional(),
    }),
  guardianPhone: yup
    .string()
    .trim()
    .when('birthDate', {
      is: (birthDate: string | undefined) => isUnder18(birthDate),
      then: (schema) =>
        schema
          .required('Telefone do responsável é obrigatório para menores de 18 anos')
          .test('min-digits', 'Telefone do responsável deve ter pelo menos 10 dígitos', (v: string | undefined) => (v || '').replace(/\D/g, '').length >= 10),
      otherwise: (schema) => schema.optional(),
    }),
  isActive: yup.string().oneOf(['true', 'false'], 'Status inválido').required(),
  email: yup.string().trim().required('E-mail é obrigatório').email('E-mail inválido'),
  cpf: yup.string().trim().optional(),
  heightCm: yup
    .string()
    .trim()
    .optional()
    .test('range', 'Altura deve ser entre 50 e 250 cm', (v: string | undefined) => {
      if (!v) return true
      const n = parseFloat(v)
      return !Number.isNaN(n) && n >= 50 && n <= 250
    }),
  weightKg: yup
    .string()
    .trim()
    .optional()
    .test('range', 'Peso deve ser entre 20 e 300 kg', (v: string | undefined) => {
      if (!v) return true
      const n = parseFloat(v)
      return !Number.isNaN(n) && n >= 20 && n <= 300
    }),
  dominantHand: yup.string().optional(),
  notes: yup.string().optional(),
})

function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export type AthleteFormInitialData = Partial<Omit<AthleteFormValues, 'heightCm' | 'weightKg' | 'birthDate'>> & {
  birthDate?: string
  heightCm?: number | null
  weightKg?: number | null
}

interface AthleteFormProps {
  mode: 'create' | 'edit' | 'view'
  initialData?: AthleteFormInitialData
  onSubmit?: (values: AthleteFormValues) => Promise<void>
  onCancel: () => void
  submitError?: string | null
}

export function AthleteForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  submitError,
}: AthleteFormProps) {
  const [values, setValues] = useState<AthleteFormValues>(() => {
    const base = { ...initialValues }
    if (!initialData) return base
    return {
      ...base,
      fullName: initialData.fullName ?? base.fullName,
      birthDate: initialData.birthDate != null ? toDateInputValue(initialData.birthDate) : base.birthDate,
      phone: initialData.phone ?? base.phone,
      guardianName: initialData.guardianName ?? base.guardianName,
      guardianPhone: initialData.guardianPhone ?? base.guardianPhone,
      isActive: initialData.isActive ?? base.isActive,
      email: initialData.email ?? base.email,
      cpf: initialData.cpf ?? base.cpf,
      heightCm: initialData.heightCm != null ? String(initialData.heightCm) : base.heightCm,
      weightKg: initialData.weightKg != null ? String(initialData.weightKg) : base.weightKg,
      dominantHand: initialData.dominantHand ?? base.dominantHand,
      notes: initialData.notes ?? base.notes,
    }
  })
  const [errors, setErrors] = useState<Partial<Record<keyof AthleteFormValues, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const isViewMode = mode === 'view'

  useEffect(() => {
    if (!initialData) return
    setValues((prev) => ({
      ...prev,
      fullName: initialData.fullName ?? prev.fullName,
      birthDate: initialData.birthDate != null ? toDateInputValue(initialData.birthDate) : prev.birthDate,
      phone: initialData.phone ?? prev.phone,
      guardianName: initialData.guardianName ?? prev.guardianName,
      guardianPhone: initialData.guardianPhone ?? prev.guardianPhone,
      isActive: initialData.isActive ?? prev.isActive,
      email: initialData.email ?? prev.email,
      cpf: initialData.cpf ?? prev.cpf,
      heightCm: initialData.heightCm != null ? String(initialData.heightCm) : prev.heightCm,
      weightKg: initialData.weightKg != null ? String(initialData.weightKg) : prev.weightKg,
      dominantHand: initialData.dominantHand ?? prev.dominantHand,
      notes: initialData.notes ?? prev.notes,
    }))
  }, [initialData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isViewMode || !onSubmit) return
    try {
      await athleteSchema.validate(values, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(yupErrorsToFieldErrors<keyof AthleteFormValues>(err))
      }
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      await onSubmit(values)
    } catch {
      // submitError is passed from parent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <Input
            label="Nome completo"
            type="text"
            value={values.fullName}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
            error={errors.fullName}
            disabled={isViewMode}
          />
        </div>
        <DateInput
          label="Data de nascimento"
          placeholderText="dd/mm/aaaa"
          value={values.birthDate}
          onChange={(value: string) => setValues((v) => ({ ...v, birthDate: value }))}
          error={errors.birthDate}
          disabled={isViewMode}
        />
        <MaskedInput
          label="Telefone"
          mask="phone"
          placeholder="(11) 98765-4321"
          value={values.phone}
          onChange={(value) => setValues((v) => ({ ...v, phone: value }))}
          error={errors.phone}
          disabled={isViewMode}
        />
        <Input
          label="Nome do responsável"
          type="text"
          value={values.guardianName}
          onChange={(e) => setValues((v) => ({ ...v, guardianName: e.target.value }))}
          error={errors.guardianName}
          disabled={isViewMode}
        />
        <MaskedInput
          label="Telefone do responsável"
          mask="phone"
          placeholder="(11) 91234-5678"
          value={values.guardianPhone}
          onChange={(value) => setValues((v) => ({ ...v, guardianPhone: value }))}
          error={errors.guardianPhone}
          disabled={isViewMode}
        />
        {!isViewMode ? (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={values.isActive}
            onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.value }))}
            error={errors.isActive}
          />
        ) : (
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-neutral-100 mb-2">Status</span>
            <p className="text-neutral-300">{values.isActive === 'true' ? 'Ativo' : 'Inativo'}</p>
          </div>
        )}
        <Input
          label="E-mail"
          type="text"
          placeholder="exemplo@email.com"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors.email}
          disabled={isViewMode}
        />
        <MaskedInput
          label="CPF"
          mask="cpf"
          placeholder="000.000.000-00"
          value={values.cpf}
          onChange={(value) => setValues((v) => ({ ...v, cpf: value }))}
          error={errors.cpf}
          disabled={isViewMode}
        />
        <Input
          label="Altura (cm)"
          type="number"
          min={50}
          max={250}
          placeholder="opcional"
          value={values.heightCm}
          onChange={(e) => setValues((v) => ({ ...v, heightCm: e.target.value }))}
          error={errors.heightCm}
          disabled={isViewMode}
        />
        <Input
          label="Peso (kg)"
          type="number"
          min={20}
          max={300}
          placeholder="opcional"
          value={values.weightKg}
          onChange={(e) => setValues((v) => ({ ...v, weightKg: e.target.value }))}
          error={errors.weightKg}
          disabled={isViewMode}
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <Select
            label="Mão dominante"
            options={DOMINANT_HAND_OPTIONS}
            value={values.dominantHand}
            onChange={(e) => setValues((v) => ({ ...v, dominantHand: e.target.value }))}
            error={errors.dominantHand}
            disabled={isViewMode}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Textarea
            label="Observações"
            rows={3}
            placeholder="opcional"
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            error={errors.notes}
            disabled={isViewMode}
          />
        </div>
      </div>

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
              {submitting ? 'Salvando...' : mode === 'create' ? 'Criar atleta' : 'Salvar'}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
