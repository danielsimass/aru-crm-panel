export interface User {
  userId: string
  email: string
  name?: string
  role?: string
  isFirstLogin?: boolean
  requiresPasswordSetup?: boolean
  // Adicione outros campos conforme necessário baseado no backend
}
