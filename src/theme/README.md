# Guia de Tema - ARU CRM

Este documento descreve o sistema de cores e tema da aplicação ARU CRM.

## Paleta de Cores

### Cores Primárias
A cor primária é **azul** (`primary`), usada para elementos principais, botões primários e destaques.

**Classes Tailwind:**
- `bg-primary-500` - Cor primária padrão
- `bg-primary-600` - Cor primária para hover/estados ativos
- `text-primary-600` - Texto com cor primária
- `border-primary-400` - Borda com cor primária

### Cores Secundárias
A cor secundária é **ciano/azul claro** (`secondary`), usada para elementos complementares.

**Classes Tailwind:**
- `bg-secondary-500` - Cor secundária padrão
- `bg-secondary-600` - Cor secundária para hover
- `text-secondary-600` - Texto com cor secundária

### Cores de Estado

#### Sucesso (`success`)
Usado para indicar ações bem-sucedidas, confirmações e estados positivos.

**Classes:** `bg-success-500`, `text-success-600`, `border-success-400`

#### Aviso (`warning`)
Usado para alertas e avisos que requerem atenção.

**Classes:** `bg-warning-500`, `text-warning-600`, `border-warning-400`

#### Erro (`error`)
Usado para erros, validações negativas e ações destrutivas.

**Classes:** `bg-error-500`, `text-error-600`, `border-error-400`

#### Informação (`info`)
Usado para informações e mensagens informativas.

**Classes:** `bg-info-500`, `text-info-600`, `border-info-400`

### Cores Neutras
Cores neutras (`neutral`) para textos, fundos e bordas.

**Classes:** `bg-neutral-50` até `bg-neutral-950`

## Exemplos de Uso

### Botões

```tsx
// Botão primário
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
  Salvar
</button>

// Botão secundário
<button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg">
  Cancelar
</button>

// Botão de sucesso
<button className="bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-lg">
  Confirmar
</button>

// Botão de erro
<button className="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded-lg">
  Excluir
</button>
```

### Cards e Containers

```tsx
<div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft-lg p-6 border border-neutral-200 dark:border-neutral-700">
  {/* Conteúdo */}
</div>
```

### Textos com Gradiente

```tsx
<h1 className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
  Título com Gradiente
</h1>
```

## Sombras Customizadas

- `shadow-soft` - Sombra suave para elementos elevados
- `shadow-soft-lg` - Sombra suave grande para cards e modais

## Bordas Arredondadas

- `rounded-xl` - 1rem
- `rounded-2xl` - 1.5rem

## Modo Escuro

O tema suporta modo escuro usando as classes `dark:` do Tailwind. Todas as cores têm variantes para modo escuro.

## Personalização

Para ajustar as cores do tema, edite o arquivo `tailwind.config.js` na seção `theme.extend.colors`.
