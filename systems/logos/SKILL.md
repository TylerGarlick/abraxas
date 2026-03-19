# Logos System - Compositional Verification

## Overview

The Logos system provides compositional verification for claims by breaking complex assertions into atomic propositions, verifying them against multiple sources, and aggregating confidence scores.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Logos System                              │
├─────────────────────────────────────────────────────────────┤
│  L1: Decomposition  →  L2: Verification  →  L3: Aggregation │
│                          ↓                                   │
│                    L4: Honest Integration                    │
└─────────────────────────────────────────────────────────────┘
```

## Components

### L1: Claim Decomposition Engine (`decomposition.py`)

**Purpose:** Break complex claims into atomic propositions

**Features:**
- Linguistic pattern matching for claim boundaries
- Proposition type classification (factual, opinion, prediction, normative, quantifiable)
- Confidence extraction from linguistic markers
- Dependency tracking between propositions

**Usage:**
```python
from logos.decomposition import ClaimDecompositionEngine

engine = ClaimDecompositionEngine()
result = engine.decompose("Your complex claim here")
print(result.propositions)  # List of AtomicProposition
```

### L2: Cross-Source Verification (`verification.py`)

**Purpose:** Verify each atomic proposition against multiple sources

**Features:**
- Multi-source triangulation
- Source credibility scoring
- Bias detection
- Evidence snippet collection
- Async verification pipeline

**Usage:**
```python
from logos.verification import CrossSourceVerificationEngine

engine = CrossSourceVerificationEngine()
result = await engine.verify_proposition("Atomic claim")
print(result.status)  # VERIFIED, CONTRADICTED, PARTIAL, UNKNOWN
```

### L3: Confidence Aggregation (`aggregation.py`)

**Purpose:** Combine verification results into final confidence scores

**Aggregation Methods:**
- Bayesian updating
- Weighted average
- Dempster-Shafer theory
- Consensus-based

**Output:**
- Final confidence score (0.0-1.0)
- Uncertainty bounds
- Contributing factors
- Actionable recommendations

**Usage:**
```python
from logos.aggregation import ConfidenceAggregationEngine

engine = ConfidenceAggregationEngine()
results = engine.aggregate(verification_inputs)
print(results[0].final_confidence)
```

### L4: Honest Skill Integration (`honest_integration.py`)

**Purpose:** Auto-label decomposed claims with TRUE/FALSE/MIXED/UNVERIFIED

**Features:**
- End-to-end pipeline automation
- Label generation with reasoning
- Source attribution
- Processing history tracking

**Usage:**
```python
from logos.honest_integration import HonestSkillIntegration

integration = HonestSkillIntegration()
result = await integration.process_claim("Your claim")
print(result.final_label.label)  # TRUE, MOSTLY_TRUE, MIXED, etc.
```

## Label Thresholds

| Label | Confidence Range |
|-------|-----------------|
| TRUE | ≥ 0.85 |
| MOSTLY_TRUE | ≥ 0.70 |
| MIXED | ≥ 0.50 |
| MOSTLY_FALSE | ≥ 0.30 |
| FALSE | ≥ 0.15 |
| UNVERIFIED | < 0.15 |

## Source Credibility Database

Built-in credibility scores for major sources:
- Academic: Nature (0.95), Science (0.94)
- News: Reuters (0.90), AP (0.88), BBC (0.85)
- Fact-checkers: Snopes (0.88), PolitiFact (0.87)

## Installation

```bash
# Ensure dependencies
pip install jsonschema asyncio
```

## Testing

```bash
cd /abraxas/systems/logos
python -m pytest tests/ -v
```

## Example Pipeline

```python
from logos.honest_integration import HonestSkillIntegration

async def verify_claim(claim: str):
    integration = HonestSkillIntegration()
    result = await integration.process_claim(claim)
    
    return {
        "label": result.final_label.label,
        "confidence": result.final_label.confidence,
        "reasoning": result.final_label.reasoning,
        "sources": result.final_label.sources
    }
```

## Version

3.0.0 - Abraxas v3 Phase 1
