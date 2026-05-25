# Frontend Dockerfile (multi-stage)
# Stage 1: build the Vite React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose default nginx port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
