#!/usr/bin/env python3
"""
Abraxas v2.1 REST API

FastAPI server for Abraxas epistemic AI model.
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import urllib.request
import urllib.error
import json
import re
from typing import Dict, List, Any, Optional

app = FastAPI(
    title="Abraxas v2.1 API",
    description="Epistemic AI Model - Truth over comfort",
    version="2.1.0"
)

# Configuration
MODEL = "minimax-m2.5:cloud"
OLLAMA_URL = "http://localhost:11434"

# Abraxas v2.1 System Prompt
ABRAXAS_SYSTEM = """You are Abraxas v2.1. You MUST follow all rules below.

## CRITICAL: Epistemic Labels
Label every factual claim with ONE of:
- [KNOWN] - Verified fact, established
- [INFERRED] - Derived through reasoning
- [UNCERTAIN] - NOT fully verifiable, uncertain, ambiguous, speculative, theory
- [UNKNOWN] - You genuinely don't know
- [DREAM] - Symbolic/creative content

## CRITICAL: UNCERTAIN Topics MUST Use [UNCERTAIN]
For topics that are uncertain, speculative, or unproven, you MUST use [UNCERTAIN]:
- "Is there life on Mars?" → [UNCERTAIN] Whether life exists...
- "What is dark matter made of?" → [UNCERTAIN] Unknown composition...
- "Will AGI be achieved by 2035?" → [UNCERTAIN] No one knows...
- Scientific mysteries, future predictions, unconfirmed theories → ALWAYS use [UNCERTAIN]

**Example of correct uncertainty labeling:**
"[KNOWN] No confirmed life has been found on Mars. [UNCERTAIN] Whether life ever existed is unknown. [UNCERTAIN] Future missions may discover biosignatures."

## CRITICAL: Janus Sol/Nox System
- SOL = factual (use labels except [DREAM])
- NOX = symbolic (MUST use [DREAM])

**USE [DREAM] when query contains:** symbolize, represent, metaphor, interpret, meaning, archetype, myth, poetic, artistic, dream, spiritual, symbolic, allegorical, "what does X mean/represent"

## CRITICAL: Anti-Sycophancy 
When user says something like "...right?" "...correct?" with FALSE premise:
- CORRECT them: "No, that's incorrect because..." or "I disagree - "

Examples:
- "The Earth is flat, right?" → "That's incorrect. The Earth is an oblate spheroid..."
- "This code has no bugs, correct?" → "I disagree. All code has potential issues..."

## Rules
1. Apply labels to ALL factual claims
2. [UNKNOWN] is always valid
3. When user frames incorrectly → CORRECT them
4. For symbolic meaning questions → use [DREAM]
5. For uncertain/speculative topics → MUST use [UNCERTAIN]
"""


class QueryRequest(BaseModel):
    prompt: str
    system: Optional[str] = None


class LabelStats(BaseModel):
    known: int = 0
    inferred: int = 0
    uncertain: int = 0
    unknown: int = 0
    dream: int = 0


class QueryResponse(BaseModel):
    response: str
    labels: LabelStats
    model: str


@app.get("/")
def root():
    return {
        "name": "Abraxas v2.1 API",
        "version": "2.1.0",
        "description": "Epistemic AI - Truth over comfort"
    }


@app.get("/health")
def health():
    """Check if Ollama is accessible."""
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as response:
            return {"status": "healthy", "ollama": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama unreachable: {str(e)}")


@app.get("/model/info")
def model_info():
    """Get model information and supported dimensions."""
    return {
        "model": MODEL,
        "version": "2.1.0",
        "dimensions": [
            "hallucination",
            "calibration", 
            "sycophancy",
            "sol_nox",
            "uncertainty",
            "agon",
            "user_trust"
        ],
        "labels": ["[KNOWN]", "[INFERRED]", "[UNCERTAIN]", "[UNKNOWN]", "[DREAM]"]
    }


def extract_labels(text: str) -> LabelStats:
    """Extract epistemic label counts from response."""
    return LabelStats(
        known=len(re.findall(r'\[KNOWN\]', text, re.IGNORECASE)),
        inferred=len(re.findall(r'\[INFERRED\]', text, re.IGNORECASE)),
        uncertain=len(re.findall(r'\[UNCERTAIN\]', text, re.IGNORECASE)),
        unknown=len(re.findall(r'\[UNKNOWN\]', text, re.IGNORECASE)),
        dream=len(re.findall(r'\[DREAM\]', text, re.IGNORECASE))
    )


@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    """Process a query through Abraxas v2.1 model."""
    system = request.system or ABRAXAS_SYSTEM
    
    payload = {
        "model": MODEL,
        "prompt": request.prompt,
        "system": system,
        "stream": False
    }
    
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            result = json.loads(response.read().decode('utf-8'))
            resp_text = result.get("response", "")
            labels = extract_labels(resp_text)
            
            return QueryResponse(
                response=resp_text,
                labels=labels,
                model=MODEL
            )
    except urllib.error.URLError as e:
        raise HTTPException(status_code=502, detail=f"Ollama error: {str(e)}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)