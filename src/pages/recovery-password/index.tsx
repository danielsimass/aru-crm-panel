import { useState, FormEvent, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordRequirements } from '../../components/ui/PasswordRequirements'
import { yupErrorsToFieldErrors, passwordRules } from '../../lib/validation'
import { useToast } from '../../hooks/useToast'
import { useApi } from '../../hooks/useApi'
import logoWithoutBackground from '../../assets/logo-without-background.png'

const emailSchema = yup.object({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
})

const resetSchema = yup.object({
  secureCode: yup
    .string()
    .length(6, 'O código deve ter 6 dígitos')
    .matches(/^\d{6}$/, 'O código deve conter apenas números')
    .required('Código é obrigatório'),
  newPassword: passwordRules,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'As senhas não coincidem')
    .required('Confirme a senha'),
})

type Step = 'email' | 'code_sent' | 'new_password'

export default function RecoveryPassword() {
  const [searchParams] = useSearchParams()
  const userIdFromUrl = searchParams.get('userId')
  const secureCodeFromUrl = searchParams.get('secureCode')

  const [step, setStep] = useState<Step>(() => {
    if (userIdFromUrl && secureCodeFromUrl) return 'new_password'
    return 'email'
  })

  const [email, setEmail] = useState('')
  const [secureCode, setSecureCode] = useState(secureCodeFromUrl || '')
  const [validatedUserId, setValidatedUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const api = useApi()
  const { showToast, ToastContainer } = useToast()

  const userId = userIdFromUrl || validatedUserId || ''

  // Countdown para reenviar código (60s)
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  // Se abrir a página com params depois de ter pedido código em outra aba, atualizar step
  useEffect(() => {
    if (userIdFromUrl && secureCodeFromUrl && step === 'email') {
      setStep('new_password')
      setSecureCode(secureCodeFromUrl)
    }
  }, [userIdFromUrl, secureCodeFromUrl, step])

  const handleRequestCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    try {
      await emailSchema.validate({ email }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, ...yupErrorsToFieldErrors(err) } as Record<string, string>))
      }
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/v1/auth/forgot-password', { email })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setStep('code_sent')
        setCountdown(60)
        showToast(
          data.message || 'Se o e-mail estiver cadastrado, você receberá um código. Verifique sua caixa de entrada.',
          'success'
        )
      } else {
        showToast(data.message || 'Não foi possível enviar o código. Tente novamente.', 'error')
      }
    } catch {
      showToast('Erro ao enviar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    const code = secureCodeFromUrl || secureCode
    try {
      await resetSchema.validate(
        { secureCode: code, newPassword, confirmPassword },
        { abortEarly: false }
      )
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, ...yupErrorsToFieldErrors(err) } as Record<string, string>))
      }
      return
    }
    if (!userId) {
      showToast('Link inválido. Solicite um novo código.', 'error')
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/v1/auth/reset-password', {
        userId,
        secureCode: code,
        newPassword,
      })
      if (response.ok) {
        showToast('Senha alterada com sucesso. Faça login.', 'success')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        const data = await response.json().catch(() => ({}))
        showToast(data.message || 'Código inválido ou expirado. Solicite um novo.', 'error')
      }
    } catch {
      showToast('Erro ao alterar senha. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return
    setLoading(true)
    try {
      const response = await api.post('/v1/auth/forgot-password', { email })
      if (response.ok) {
        setCountdown(60)
        showToast('Um novo link foi enviado para seu e-mail.', 'success')
      } else {
        const data = await response.json().catch(() => ({}))
        showToast(data.message || 'Não foi possível reenviar. Tente novamente.', 'error')
      }
    } catch {
      showToast('Erro ao reenviar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const codeSchema = yup.object({
    secureCode: yup
      .string()
      .length(6, 'O código deve ter 6 dígitos')
      .matches(/^\d{6}$/, 'O código deve conter apenas números')
      .required('Código é obrigatório'),
  })

  const handleValidateCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    try {
      await codeSchema.validate({ secureCode }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, ...yupErrorsToFieldErrors(err) } as Record<string, string>))
      }
      return
    }
    if (!email.trim()) {
      showToast('Informe o e-mail e solicite o código primeiro.', 'error')
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/v1/auth/validate-code', { email: email.trim(), secureCode })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.valid && data.flow === 'recovery' && data.userId) {
        setValidatedUserId(data.userId)
        setStep('new_password')
        showToast('Código validado. Defina sua nova senha.', 'success')
      } else {
        showToast('Código inválido ou expirado. Verifique e tente novamente.', 'error')
      }
    } catch {
      showToast('Erro ao validar código. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fluxo: veio pelo link com userId e secureCode
  if (step === 'new_password' && userId && (secureCodeFromUrl || secureCode)) {
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
            Redefinir senha
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Defina sua nova senha de acesso.
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleResetPassword} className="space-y-6" noValidate>
            {secureCodeFromUrl ? (
              <p className="text-sm text-neutral-400">
                Código recebido por e-mail (utilize o link enviado).
              </p>
            ) : (
              <Input
                label="Código de recuperação"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={secureCode}
                onChange={(e) => setSecureCode(e.target.value.replace(/\D/g, ''))}
                error={errors.secureCode}
                placeholder="000000"
              />
            )}

            <Input
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <PasswordRequirements password={newPassword} className="mt-1" />

            <Input
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Alterando...' : 'Alterar senha'}
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

  // Fluxo: pediu código (aguardando link no e-mail) ou ainda não pediu
  if (step === 'code_sent') {
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
            Verifique seu e-mail
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Enviamos um link para <strong className="text-neutral-200">{email}</strong>. Clique no link para redefinir sua senha. O link contém seu código de recuperação.
          </p>
          <p className="mt-4 text-center text-sm text-neutral-500">
            Não recebeu? Verifique a pasta de spam ou aguarde e solicite um novo código.
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-4">
          <form onSubmit={handleValidateCode} className="space-y-4" noValidate>
            <Input
              label="Código de recuperação"
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
          </form>
          <Button
            type="button"
            variant="neutral"
            className="w-full"
            disabled={countdown > 0 || loading}
            onClick={handleResendCode}
          >
            {countdown > 0
              ? `Reenviar código em ${countdown}s`
              : loading
                ? 'Enviando...'
                : 'Solicitar novo código'}
          </Button>
          <p className="text-center text-sm text-neutral-400">
            <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Step: email (obter código)
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
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Informe seu e-mail para receber um link com o código de recuperação.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleRequestCode} className="space-y-6" noValidate>
          <Input
            label="E-mail"
            id="email"
            name="email"
            type="text"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            error={errors.email}
          />

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Enviando...' : 'Obter código de recuperação'}
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
