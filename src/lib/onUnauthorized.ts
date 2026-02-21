/**
 * Handler global chamado quando uma requisição retorna 401 (não autorizado).
 * O AuthProvider registra aqui a função que faz logout e redireciona para o login.
 */

let handler: (() => void) | null = null

export function setOnUnauthorized(fn: (() => void) | null): void {
  handler = fn
}

export function getOnUnauthorized(): (() => void) | null {
  return handler
}
