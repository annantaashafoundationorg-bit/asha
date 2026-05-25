# Deployment Plan

## Frontend — Vercel

- Framework: Next.js 14
- Deploy on push to `main` via `.github/workflows/deploy-frontend.yml`
- Environment variables set in Vercel dashboard
- Custom domain: `dashboard.aasha.ai` (when ready)

## Backend — AWS ECS (Docker)

- FastAPI containerised via `backend/Dockerfile`
- Deploy on push to `main` via `.github/workflows/deploy-backend.yml`
- Region: `ap-south-1` (Mumbai — lowest latency for India)
- ECR image registry
- ECS Fargate task

## Database

- PostgreSQL 16 on Amazon RDS (production)
- Local Docker Compose for development

## Cache

- Redis 7 on Amazon ElastiCache (production)
- Local Docker for development

## File storage

- Local `./assets` in development
- AWS S3 (`ap-south-1`) in production
- S3 prefix: `aasha/assets/`

## Centre deployment

- Each Aasha centre runs the frontend on a local tablet/laptop
- Backend API is cloud-hosted and accessible over the internet
- Offline mode: TLN nodes cached in Redis; asset registry cached locally

## Environment promotion

```
local dev  →  pull request  →  staging (auto)  →  production (manual approve)
```
