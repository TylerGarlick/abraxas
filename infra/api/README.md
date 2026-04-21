# Abraxas v2.1 REST API

FastAPI server for Abraxas epistemic AI model.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python3 main.py

# Or with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Endpoints

### GET /health
Health check - verifies Ollama is accessible.

### GET /model/info
Get model information and supported dimensions.

### POST /query
Process a query through Abraxas v2.1.

**Request:**
```json
{
  "prompt": "What is dark matter made of?",
  "system": null  // optional custom system prompt
}
```

**Response:**
```json
{
  "response": "Model response with [KNOWN], [UNCERTAIN] labels...",
  "labels": {
    "known": 2,
    "inferred": 0,
    "uncertain": 3,
    "unknown": 0,
    "dream": 0
  },
  "model": "minimax-m2.5:cloud"
}
```

## Example

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Is there life on Mars?"}'
```