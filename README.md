# ARU CRM - Painel Administrativo

Painel frontend para o sistema ARU CRM, desenvolvido com React, TypeScript e Vite.

## Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **pnpm** - Gerenciador de pacotes

## Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm instalado globalmente

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:3001`

## Build

```bash
pnpm build
```

## Preview da Build

```bash
pnpm preview
```

## Integração com Backend

O projeto está configurado para fazer proxy das requisições `/api` para o backend em `http://localhost:3000`. Certifique-se de que o backend está rodando antes de iniciar o desenvolvimento.

## Tema e Cores

O projeto utiliza um sistema de cores customizado baseado na identidade visual da marca:

- **Cores Primárias**: Azul (`primary`) - para elementos principais e botões
- **Cores Secundárias**: Ciano/Azul claro (`secondary`) - para elementos complementares
- **Cores de Estado**: Sucesso, Aviso, Erro e Informação
- **Cores Neutras**: Para textos, fundos e bordas

Consulte `src/theme/README.md` para documentação completa do tema e exemplos de uso.

## Estrutura do Projeto

```
aru-crm-panel/
├── src/
│   ├── App.tsx              # Componente principal
│   ├── App.css              # Estilos do App
│   ├── main.tsx             # Entry point
│   ├── index.css            # Estilos globais (com diretivas Tailwind)
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout.tsx       # Layout principal
│   │   └── ThemeShowcase.tsx # Demonstração do tema
│   ├── pages/               # Páginas da aplicação
│   ├── theme/               # Configuração do tema
│   │   ├── colors.ts        # Referência de cores
│   │   └── README.md        # Documentação do tema
│   └── assets/              # Assets (imagens, logos, etc)
├── index.html               # HTML principal
├── vite.config.ts           # Configuração do Vite
├── tailwind.config.js       # Configuração do Tailwind CSS e tema
├── postcss.config.js        # Configuração do PostCSS
├── tsconfig.json            # Configuração do TypeScript
└── package.json             # Dependências e scripts
```
