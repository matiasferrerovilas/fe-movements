# Build stage
FROM node:24-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Copiar el resto del código
COPY . .

# Build de la aplicación (ejecuta tsc y vite build)
ENV NODE_ENV=production
RUN pnpm run build

# Production stage con nginx
FROM nginx:alpine

# Copiar build de Vite a nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]