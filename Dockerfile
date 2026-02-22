# Stage 1 - Build
FROM node:24-alpine AS builder

WORKDIR /app

# Instala pnpm global
RUN npm install -g pnpm

# Copia apenas arquivos de dependência primeiro (melhor cache)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copia resto do projeto
COPY . .

RUN pnpm build


# Stage 2 - Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]