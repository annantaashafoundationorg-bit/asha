# Observability

## Logging

- Backend: structured JSON logs via Python `logging` module.
- Log levels: `DEBUG` (dev), `INFO` (staging/prod).
- Key log events: book transform, asset search, assessment run, coin award, verification record.

## Metrics (production)

- FastAPI request duration per endpoint (CloudWatch or Prometheus)
- Asset reuse rate (logged per transform run)
- Assessment pass rate (logged per assess/run)
- Coin award events

## Health check

`GET /health` returns:
```json
{ "status": "ok", "service": "aasha-ai-teas-api", "version": "1.0.0", "centre_mode": "ground_execution" }
```

Used by ECS health checks and monitoring.

## Alerts

- API error rate > 5% → PagerDuty / Slack alert to NGO ops
- Nightly transform failure → GitHub Actions notification
- Gemini API error → fallback to truncation; alert logged
