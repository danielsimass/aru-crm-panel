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

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]