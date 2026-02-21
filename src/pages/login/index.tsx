import { useState, FormEvent, useEffect } from 'react'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { useLogin } from '../../hooks/useLogin'
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { yupErrorsToFieldErrors } from '../../lib/validation'
import { useToast } from '../../hooks/useToast'
import logoWithoutBackground from '../../assets/logo-without-background.png'

const loginSchema = yup.object({
  login: yup.string().trim().required('Login é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
})

export default function Login() {
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({})
  const { login, loading, error } = useLogin()
  const { isAuthenticated } = useAuth()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    try {
      await loginSchema.validate({ login: loginValue, password }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(yupErrorsToFieldErrors(err))
      }
      return
    }
    await login(loginValue, password)
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
          Entre na sua conta
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div className="rounded-md bg-error-500/10 border border-error-500/30 p-3">
              <p className="text-sm text-error-500">{error}</p>
            </div>
          )}

          <Input
            label="Login"
            id="login"
            name="login"
            type="text"
            autoComplete="username"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            placeholder="usuário ou e-mail"
            error={errors.login}
          />

          <Input
            label="Senha"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
          />

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          <p className="text-center text-sm text-neutral-400">
            <Link
              to="/recovery-password"
              className="font-medium text-primary-500 hover:text-primary-400"
            >
              Esqueci minha senha
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
