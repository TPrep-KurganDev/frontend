# Этап сборки
FROM node:20-alpine AS builder

WORKDIR /app


COPY package*.json ./

RUN npm set strict-ssl false

RUN npm ci


COPY . .

# Собираем приложение используя npm exec
RUN npm run build --if-present

# Продакшн этап
FROM nginx:alpine

# Копируем собранное приложение из этапа сборки
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
