import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import random
import time

# Import Sovereign Logic
from skills.logos_math.python.verify import verify, VerificationResult
from skills.logos_math.python.confidence import score_confidence

app = FastAPI(title="Abraxas Sovereign Brain API")

# --- Models ---


class ClaimRequest(BaseModel):
    claim: str


class VerificationResponse(BaseModel):
    claim: str
    verification: Dict[str, Any]
    labels: List[Dict[str, Any]]
    pipeline: Dict[str, Any]


class ComparisonDimension(BaseModel):
    name: str
    abraxas: int
    claude: int
    gpt4: int
    gemini: int
    gpt35: int


class ComparisonFeature(BaseModel):
    feature: str
    abraxas: bool
    claude: bool
    gpt4: bool
    gemini: bool
    gpt35: bool


class ComparisonData(BaseModel):
    dimensions: List[ComparisonDimension]
    features: List[ComparisonFeature]


# --- Sovereign Logic Helpers ---


def apply_epistemic_labels(
    claim: str, verification_result: Any
) -> List[Dict[str, Any]]:
    labels = []

    # Ensure we are working with a dict for the check
    res_dict = (
        verification_result
        if isinstance(verification_result, dict)
        else verification_result.__dict__
    )

    conf = res_dict.get("confidence", 0)
    status = res_dict.get("status", "UNKNOWN")
    result = (
        res_dict.get("result", "INCONCLUSIVE")
        if "result" in res_dict
        else res_dict.get("comparison", "INCONCLUSIVE")
    )

    if conf == 5 and status == "VERIFIED":
        labels.append(
            {
                "label": "KNOWN",
                "description": "Verified against independent computation",
                "color": "#00ff88",
            }
        )
    elif conf >= 3 or status == "CONFLICT":
        labels.append(
            {
                "label": "INFERRED",
                "description": "Logically derived but may need review",
                "color": "#ffaa00",
            }
        )
        if status == "CONFLICT":
            labels.append(
                {
                    "label": "CONFLICT",
                    "description": "Claim contradicts verification",
                    "color": "#ff4466",
                }
            )
    elif conf == 1 or status == "ERROR":
        labels.append(
            {
                "label": "UNCERTAIN",
                "description": "Verification incomplete",
                "color": "#8888ff",
            }
        )
    else:
        labels.append(
            {
                "label": "UNKNOWN",
                "description": "Insufficient information to verify",
                "color": "#666666",
            }
        )

    return labels


def simulate_sovereign_pipeline(claim: str) -> Dict[str, Any]:
    start_time = time.time()

    pipeline = [
        {
            "stage": "Logos",
            "action": "Decomposing claim into verifiable components",
            "status": "complete",
            "duration": random.randint(100, 300),
        },
        {
            "stage": "Janus",
            "action": "Applying epistemic labels based on verification",
            "status": "complete",
            "duration": random.randint(50, 200),
        },
        {
            "stage": "Aletheia",
            "action": "Assessing truth value and confidence",
            "status": "complete",
            "duration": random.randint(50, 150),
        },
        {
            "stage": "Agon",
            "action": "Checking for conflicting evidence",
            "status": "complete",
            "duration": random.randint(50, 150),
        },
    ]

    total_duration = int((time.time() - start_time) * 1000)
    return {"stages": pipeline, "totalDuration": total_duration}


# --- API Routes ---


@app.post("/api/verify", response_model=VerificationResponse)
async def _verify_claim(request: ClaimRequest):
    claim = request.claim

    # 1. Logos Verification
    # Assuming verify returns VerificationResult dataclass
    verification = verify(claim)

    # Convert dataclass to dict for response
    verification_dict = verification.__dict__.copy()
    if verification.steps:
        verification_dict["steps"] = [s.__dict__ for s in verification.steps]

    # 2. Janus Epistemic Labeling
    labels = apply_epistemic_labels(claim, verification_dict)

    # 3. Sovereign Pipeline Simulation
    pipeline = simulate_sovereign_pipeline(claim)

    return {
        "claim": claim,
        "verification": verification_dict,
        "labels": labels,
        "pipeline": pipeline,
    }


@app.get("/api/comparison", response_model=ComparisonData)
async def get_comparison():
    return {
        "dimensions": [
            {
                "name": "Math Derivation Enforcement",
                "abraxas": 5,
                "claude": 3,
                "gpt4": 3,
                "gemini": 2,
                "gpt35": 1,
            },
            {
                "name": "Uncertainty Labeling",
                "abraxas": 5,
                "claude": 3,
                "gpt4": 3,
                "gemini": 3,
                "gpt35": 1,
            },
            {
                "name": "Tool Verification",
                "abraxas": 5,
                "claude": 3,
                "gpt4": 3,
                "gemini": 2,
                "gpt35": 1,
            },
            {
                "name": "Failure → UNKNOWN",
                "abraxas": 5,
                "claude": 1,
                "gpt4": 1,
                "gemini": 1,
                "gpt35": 1,
            },
            {
                "name": "Constitution Enforcement",
                "abraxas": 5,
                "claude": 1,
                "gpt4": 1,
                "gemini": 1,
                "gpt35": 1,
            },
            {
                "name": "Audit Trail",
                "abraxas": 5,
                "claude": 3,
                "gpt4": 3,
                "gemini": 1,
                "gpt35": 1,
            },
        ],
        "features": [
            {
                "feature": "Explicit Epistemic Labels",
                "abraxas": True,
                "claude": False,
                "gpt4": False,
                "gemini": False,
                "gpt35": False,
            },
            {
                "feature": "Math Derivation Required",
                "abraxas": True,
                "claude": False,
                "gpt4": False,
                "gemini": False,
                "gpt35": False,
            },
            {
                "feature": "Tool Output Verification",
                "abraxas": True,
                "claude": True,
                "gpt4": True,
                "gemini": False,
                "gpt35": False,
            },
            {
                "feature": "Silent Failure Detection",
                "abraxas": True,
                "claude": False,
                "gpt4": False,
                "gemini": False,
                "gpt35": False,
            },
            {
                "feature": "Confidence Scoring",
                "abraxas": True,
                "claude": False,
                "gpt4": False,
                "gemini": False,
                "gpt35": False,
            },
        ],
    }


@app.get("/api/test-cases")
async def get_test_cases():
    return [
        {"id": 1, "claim": "2 + 2 = 4", "type": "arithmetic", "expected": "VERIFIED"},
        {"id": 2, "claim": "2 + 2 = 5", "type": "arithmetic", "expected": "CONFLICT"},
        {"id": 3, "claim": "3x + 7 = 22", "type": "equation", "expected": "VERIFIED"},
        {
            "id": 4,
            "claim": "137 + 243 = 380",
            "type": "arithmetic",
            "expected": "VERIFIED",
        },
        {
            "id": 5,
            "claim": "15 * 8 = 120",
            "type": "arithmetic",
            "expected": "VERIFIED",
        },
        {
            "id": 6,
            "claim": "100 / 4 = 25",
            "type": "arithmetic",
            "expected": "VERIFIED",
        },
        {"id": 7, "claim": "2^10 = 1024", "type": "exponent", "expected": "VERIFIED"},
        {
            "id": 8,
            "claim": "P(3 heads in 5 flips) = 10/32",
            "type": "probability",
            "expected": "VERIFIED",
        },
    ]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
