# ---------- 1) BUILD STAGE ----------
    FROM node:20-slim AS build
    WORKDIR /app
    
    # 1. Bağımlılıkları hızlı cachelemek için önce paket dosyaları
    COPY package*.json ./
    # Eğer pnpm/yarn kullanıyorsan yukarıyı buna göre değiştir
    
    # 2. Reprodüksiyon için ci
    RUN npm ci
    
    # 3. Kaynak kod
    COPY . .
    
    # 4. Production build → dist/
    RUN npm run build
    # ------------------------------------------------------------
    
    
    # ---------- 2) RUNTIME (STATIC SERVER) ----------
    FROM nginx:alpine AS runtime
    
    # (Opsiyonel ama önerilir) timezone/locale minik iyileştirmeler
    # RUN apk add --no-cache tzdata && cp /usr/share/zoneinfo/Europe/Istanbul /etc/localtime
    
    # 1. Nginx conf'u kopyala (SPA + cache + gzip ayarlı)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # 2. Build çıktısını web root'a koy
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # 3. Varsayılan Nginx healthcheck endpoint'i
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/health || exit 1
    
    # 4. Nginx 80 dinler
    EXPOSE 80
    
    # 5. Nginx başlat
    CMD ["nginx", "-g", "daemon off;"]
    