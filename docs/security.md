# Security

## API

- All endpoints validate input via Pydantic schemas before processing.
- CORS is restricted to configured origins (`CORS_ORIGINS` env var).
- No student PII is stored in logs — only `student_id` tokens.
- API keys (Gemini, AWS) are stored as environment secrets, never in code.

## Data

- Student wallet and memory data are isolated by `student_id`.
- No cross-student data access is possible via any API endpoint.
- Verification records are append-only.

## Secrets management

- All secrets in `.env` (local) or GitHub Secrets (CI/CD) or AWS Secrets Manager (production).
- `.env` is gitignored. Only `.env.example` is committed.

## Infrastructure

- Backend runs in AWS ECS with VPC isolation.
- PostgreSQL and Redis are not publicly accessible — VPC-internal only.
- S3 asset bucket has public-read for reusable assets only; write is IAM-gated.

## Gemini API

- API key is server-side only; never exposed to the frontend.
- All Gemini calls use `temperature: 0.2` or lower for deterministic educational outputs.
