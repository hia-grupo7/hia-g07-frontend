# =============================================================
# Etapa 1: builder — compilar la aplicación Angular
# =============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias e instalar con npm ci
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar en modo producción
RUN npm run build -- --configuration production

# =============================================================
# Etapa 2: serve — imagen final mínima con Nginx Alpine
# =============================================================
FROM nginx:alpine AS serve

# Metadatos de la imagen
LABEL maintainer="Grupo 7 HIA — Rayuela Librería Online"
LABEL version="1.0.0"
LABEL description="Frontend Angular para Rayuela — servido con Nginx Alpine"

# Aplicar parches de Alpine (Trivy) y eliminar la configuración por defecto de Nginx y los estáticos base
RUN apk upgrade --no-cache && rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copiar configuración personalizada de Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados de Angular desde la etapa builder
COPY --from=builder /app/dist/proyfrontendgrupo08/browser /usr/share/nginx/html

# Exponer el puerto HTTP
EXPOSE 80

# Healthcheck: Nginx responde en raíz (usando 127.0.0.1 para evitar problemas IPv6 en Alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

# Nginx arranca en foreground
CMD ["nginx", "-g", "daemon off;"]
