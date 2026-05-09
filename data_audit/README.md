# Sourcify Reliability Audit API

## Run locally

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```

## Endpoints

- GET /health
- POST /audit
- GET /audit/{wallet}

## Example requests

### Health
```bash
curl http://127.0.0.1:8000/health
```

### POST audit
```bash
curl -X POST http://127.0.0.1:8000/audit \
  -H "Content-Type: application/json" \
  -d '{"wallet":"0x41653c7d61609D856f29355E404F310Ec4142Cfb"}'
```

### GET audit
```bash
curl http://127.0.0.1:8000/audit/0x41653c7d61609D856f29355E404F310Ec4142Cfb
```

## Notes

- Request body field for POST /audit is `wallet`
- Response includes score, verdict, breakdown, summary, cache flag, and processing time