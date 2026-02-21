import * as yup from 'yup'

/**
 * Locale pt-BR para o Yup - mensagens de erro padrão em português.
 * Deve ser chamado uma vez na inicialização da aplicação (ex: main.tsx).
 */
export function setYupLocalePtBr(): void {
  yup.setLocale({
    mixed: {
      default: 'Campo inválido',
      required: 'Campo obrigatório',
      notType: 'Valor inválido',
      oneOf: 'Deve ser um dos valores: ${values}',
      notOneOf: 'Não pode ser um dos valores: ${values}',
    },
    string: {
      length: 'Deve ter exatamente ${length} caracteres',
      min: 'Deve ter pelo menos ${min} caracteres',
      max: 'Deve ter no máximo ${max} caracteres',
      email: 'E-mail inválido',
      url: 'URL inválida',
      trim: 'Não deve conter espaços no início ou fim',
      lowercase: 'Deve estar em minúsculas',
      uppercase: 'Deve estar em maiúsculas',
      matches: 'Formato inválido',
    },
    number: {
      min: 'Deve ser no mínimo ${min}',
      max: 'Deve ser no máximo ${max}',
      lessThan: 'Deve ser menor que ${less}',
      moreThan: 'Deve ser maior que ${more}',
      positive: 'Deve ser um número positivo',
      negative: 'Deve ser um número negativo',
      integer: 'Deve ser um número inteiro',
    },
    date: {
      min: 'Data deve ser após ${min}',
      max: 'Data deve ser antes de ${max}',
    },
    array: {
      min: 'Deve ter pelo menos ${min} itens',
      max: 'Deve ter no máximo ${max} itens',
      length: 'Deve ter exatamente ${length} itens',
    },
    object: {
      noUnknown: 'Campo não reconhecido',
    },
  })
}

/**
 * Regras de validação para senha: mínimo 8 caracteres, pelo menos uma letra e um número.
 * Use em formulários de nova senha (alterar senha, recuperar senha, etc.).
 */
export const passwordRules = yup
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .matches(/[a-zA-ZÀ-ÿ]/, 'A senha deve conter pelo menos uma letra')
  .matches(/\d/, 'A senha deve conter pelo menos um número')
  .required('Senha é obrigatória')

/**
 * Converte ValidationError do Yup em objeto de erros por campo { [field]: message }.
 * Uso: setErrors(yupErrorsToFieldErrors(err))
 */
export function yupErrorsToFieldErrors<T extends string>(
  error: yup.ValidationError
): Partial<Record<T, string>> {
  const result: Partial<Record<T, string>> = {}
  if (error.inner?.length) {
    for (const e of error.inner) {
      if (e.path != null && e.message) {
        result[e.path as T] = e.message
      }
    }
  }
  if (Object.keys(result).length === 0 && error.path != null && error.message) {
    result[error.path as T] = error.message
  }
  return result
}
