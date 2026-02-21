# Sistema de Autenticação

Este documento descreve o sistema de autenticação implementado no ARU CRM.

## Estrutura

### Contexto de Autenticação (`AuthContext`)

O `AuthContext` fornece um estado global de autenticação para toda a aplicação.

**Localização:** `src/contexts/AuthContext.tsx`

**Funcionalidades:**
- Gerenciamento do estado do usuário
- Verificação automática de autenticação ao carregar
- Funções de login e logout
- Estado de loading

**Uso:**
```tsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // ...
}
```

### Hook useApi

Hook para fazer requisições HTTP com suporte automático a cookies de autenticação.

**Localização:** `src/hooks/useApi.ts`

**Características:**
- Inclui cookies automaticamente (`credentials: 'include'`)
- Suporta todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE)
- Configuração automática de headers JSON
- Tratamento de erros

**Uso:**
```tsx
import { useApi } from '../hooks/useApi'

function MyComponent() {
  const api = useApi()
  
  const fetchData = async () => {
    const response = await api.get('/users')
    if (response.ok) {
      const data = await response.json()
      // ...
    }
  }
  
  const createUser = async (userData) => {
    const response = await api.post('/users', userData)
    // ...
  }
}
```

### Hook useLogin

Hook específico para gerenciar o processo de login.

**Localização:** `src/hooks/useLogin.ts`

**Funcionalidades:**
- Estado de loading durante o login
- Tratamento de erros
- Redirecionamento automático após login bem-sucedido

**Uso:**
```tsx
import { useLogin } from '../hooks/useLogin'

function LoginPage() {
  const { login, loading, error } = useLogin()
  
  const handleSubmit = async (username, password) => {
    await login(username, password)
  }
}
```

## Rotas Protegidas

### Componente ProtectedRoute

Componente que protege rotas, redirecionando usuários não autenticados para a página de login.

**Localização:** `src/components/ProtectedRoute.tsx`

**Uso:**
```tsx
import { ProtectedRoute } from '../components/ProtectedRoute'

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Endpoints da API

O sistema espera os seguintes endpoints no backend:

- `POST /api/v1/auth/login` - Fazer login
  - Body: `{ username: string, password: string }`
  - O campo `username` pode ser username ou email
  - Retorna: Dados do usuário autenticado
  - Define cookie de autenticação (`access_token`)

- `POST /api/v1/auth/logout` - Fazer logout
  - Remove cookie de autenticação

- `GET /api/v1/auth/me` - Verificar autenticação atual
  - Retorna: Dados do usuário autenticado ou 401 se não autenticado

## Fluxo de Autenticação

1. **Login:**
   - Usuário preenche formulário na página `/login` com username (ou email) e senha
   - `useLogin` chama `AuthContext.login()`
   - Requisição POST para `/api/v1/auth/login` com `{ username, password }`
   - Backend valida credenciais (busca por username ou email) e define cookie de sessão
   - Estado do usuário é atualizado
   - Redirecionamento para página inicial

2. **Verificação Automática:**
   - Ao carregar a aplicação, `AuthContext` verifica autenticação
   - Requisição GET para `/api/v1/auth/me`
   - Se autenticado, estado do usuário é preenchido
   - Se não autenticado, usuário permanece null

3. **Proteção de Rotas:**
   - `ProtectedRoute` verifica `isAuthenticated`
   - Se não autenticado, redireciona para `/login`
   - Se autenticado, renderiza o componente filho

4. **Logout:**
   - Usuário clica em "Sair"
   - `AuthContext.logout()` é chamado
   - Requisição POST para `/api/v1/auth/logout`
   - Estado do usuário é limpo
   - Redirecionamento para `/login`

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=/api
```

Se não definido, o padrão é `/api`, que será redirecionado pelo proxy do Vite para `http://localhost:3000`.

### Proxy do Vite

O proxy está configurado em `vite.config.ts`:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
  },
}
```

Isso permite que requisições para `/api/*` sejam redirecionadas para o backend.
