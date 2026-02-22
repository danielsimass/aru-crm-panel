import { useState, FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordRequirements } from '../../components/ui/PasswordRequirements'
import { yupErrorsToFieldErrors, passwordRules } from '../../lib/validation'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../contexts/AuthContext'
import { useApi } from '../../hooks/useApi'
import logoWithoutBackground from '../../assets/logo-without-background.png'

const validateCodeSchema = yup.object({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  secureCode: yup
    .string()
    .length(6, 'O código deve ter 6 dígitos')
    .matches(/^\d{6}$/, 'O código deve conter apenas números')
    .required('Código é obrigatório'),
})

const firstLoginSchema = yup.object({
  password: passwordRules,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Confirme a senha'),
})

export default function FirstLogin() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const userIdFromUrl = searchParams.get('userId') ?? ''
  const secureCodeFromUrl = searchParams.get('secureCode') ?? ''

  const [step, setStep] = useState<'validate' | 'password'>(() =>
    userIdFromUrl && secureCodeFromUrl ? 'password' : 'validate'
  )
  const [email, setEmail] = useState('')
  const [secureCode, setSecureCode] = useState(secureCodeFromUrl)
  const [validatedUserId, setValidatedUserId] = useState<string | null>(userIdFromUrl || null)
  const [validatedSecureCode, setValidatedSecureCode] = useState<string>(secureCodeFromUrl)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const api = useApi()
  const { checkAuth } = useAuth()
  const { showToast, ToastContainer } = useToast()

  const userId = (userIdFromUrl || validatedUserId) ?? ''
  const codeToUse = secureCodeFromUrl || validatedSecureCode

  const handleValidateCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    try {
      await validateCodeSchema.validate({ email, secureCode }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, ...yupErrorsToFieldErrors(err) } as Record<string, string>))
      }
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/v1/auth/validate-code', {
        email: email.trim(),
        secureCode,
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.valid && data.flow === 'first-login' && data.userId) {
        setValidatedUserId(data.userId)
        setValidatedSecureCode(secureCode)
        setStep('password')
        showToast('Código validado. Defina sua senha de acesso.', 'success')
      } else {
        showToast('Código inválido ou expirado. Verifique e tente novamente.', 'error')
      }
    } catch {
      showToast('Erro ao validar código. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    try {
      await firstLoginSchema.validate({ password, confirmPassword }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, ...yupErrorsToFieldErrors(err) } as Record<string, string>))
      }
      return
    }

    if (!userId || !codeToUse) {
      showToast('Link inválido. Use o link enviado ao seu e-mail ou valide o código.', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/v1/auth/set-first-password', {
        userId,
        password,
        secureCode: codeToUse,
      })

      if (response.ok) {
        showToast('Senha definida com sucesso! Redirecionando...', 'success')
        await checkAuth()
        navigate('/', { replace: true })
      } else {
        const data = await response.json().catch(() => ({}))
        showToast(data.message || 'Código inválido ou expirado. Solicite um novo convite.', 'error')
      }
    } catch {
      showToast('Erro ao definir senha. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'validate') {
    return (
      <div className="flex min-h-full flex-col justify-center bg-neutral-950 px-6 py-12 lg:px-8">
        <ToastContainer />
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center">
            <img
              alt="ARU CRM"
              src={logoWithoutBackground}
              className="mx-auto h-48 w-auto"
            />
          </div>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-neutral-100">
            Primeiro acesso
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Informe o e-mail e o código que você recebeu para definir sua senha. Ou acesse pelo link do e-mail.
          </p>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleValidateCode} className="space-y-6" noValidate>
            <Input
              label="E-mail"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="seu@email.com"
            />
            <Input
              label="Código de verificação"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={secureCode}
              onChange={(e) => setSecureCode(e.target.value.replace(/\D/g, ''))}
              error={errors.secureCode}
              placeholder="000000"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Validando...' : 'Validar código'}
            </Button>
            <p className="text-center text-sm text-neutral-400">
              <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400">
                Voltar ao login
              </Link>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col justify-center bg-neutral-950 px-6 py-12 lg:px-8">
      <ToastContainer />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <img
            alt="ARU CRM"
            src={logoWithoutBackground}
            className="mx-auto h-48 w-auto"
          />
        </div>
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-neutral-100">
          Primeiro acesso
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Defina sua senha de acesso.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <p className="text-sm text-neutral-400">
            Código validado. Agora defina sua senha.
          </p>

          <Input
            label="Nova senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <PasswordRequirements password={password} className="mt-1" />

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Definir senha e entrar'}
            </Button>
          </div>

          <p className="text-center text-sm text-neutral-400">
            <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400">
              Voltar ao login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
