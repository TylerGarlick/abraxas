# Abraxas v3 - Epistemic Verification System

**Phase 1 Complete:** Logos + Ergon Systems (March 2026)  
**Phase 2 In Progress:** Soter (Started), Kairos & Ethos (Proposed)  
**Test Suite Expanded:** 6 cloud models, 13-dimension framework (April 2026)  
**Test Dimensions:** 13 complete (Dimensions 1-13), Soter (Dimension 9) in progress

Abraxas v3 provides empirical verification for claims through compositional analysis, tool-use verification, and mathematical claim verification.

## 📊 Key Research Findings (April 2026)

**Six-Model Evaluation Results (April 2026):**

| Model | 13-Dim Suite | Hallucination | Sycophancy | Status |
|-------|--------------|---------------|------------|--------|
| **glm-5:cloud** | 12/13 (92%) | 4/5 (80%) | TBD | ✅ Complete |
| **gemma3:27b-cloud** | 13/13 (100%) | TBD | TBD | ✅ Complete |
| **qwen3.5:cloud** | 13/13 (100%) | TBD | TBD | ✅ Complete |
| **gpt-oss:120b-cloud** | 13/13 (100%) | TBD | TBD | ✅ Complete |
| **gpt-oss:20b-cloud** | 13/13 (100%) | TBD | TBD | ✅ Complete |
| **minimax-m2.7:cloud** | 13/13 (100%) | TBD | TBD | ✅ Complete |

**Expanded Test Suite (April 11, 2026):**
- Hallucination tests: 38 queries (from 5)
- Sycophancy tests: 46 queries (from 4)
- Extended coverage: Science, medicine, code, politics, escalating false premises

📄 **Full Report:** [`research/05-research-paper-v2.0-final.md`](research/05-research-paper-v2.0-final.md)  
📄 **Collusion Prevention Whitepaper:** [`research/papers/collusion-prevention-whitepaper.md`](research/papers/collusion-prevention-whitepaper.md)

## Skills

### Phase 1 Systems (Complete)

| Skill | Purpose | Status |
|-------|---------|--------|
| **logos** | Argument anatomy: map structure, find gaps, surface assumptions | ✅ Complete |
| **logos-math** | Verify quantitative claims: step-by-step derivation, confidence labeling | ✅ Complete |
| **logos-verification** | Claim verification against sources | ✅ Complete |
| **janus** | Epistemic labeling: [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN] | ✅ Complete |
| **agon** | Adversarial stress-testing of claims | ✅ Complete |
| **aletheia** | Truth tracking and ledger (calibration monitoring) | ⚠️ Spec complete |
| **hermes** | Interpretation and ambiguity resolution | 📋 Proposed |
| **kairos** | Timing and relevance judgment | 📋 Proposed |
| **pheme** | Rumor and claim tracking | 📋 Proposed |
| **mnemosyne** | Memory and context management | ⚠️ Spec complete |
| **ergon** | Tool-use verification and execution | ✅ Complete |

### Phase 2 Systems (Safety-Focused)

| Skill | Purpose | Priority | Status |
|-------|---------|----------|--------|
| **soter** | Safety & risk evaluation (instrumental convergence detection) | CRITICAL | ⚠️ Started |
| **kairos** | Timing & relevance judgment (urgency filtering) | HIGH | 📋 Proposed |
| **ethos** | Source credibility assessment (weighted verification) | HIGH | 📋 Proposed |
| **pathos** | Value & emotional salience tracking | MEDIUM | 📋 Proposed |

📄 **Phase 2 Proposal:** [`research/papers/new-systems-proposal-2026-04.md`](research/papers/new-systems-proposal-2026-04.md)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Abraxas v3                                │
├─────────────────────────┬───────────────────────────────────┤
│     Logos System        │       Ergon System                │
│  (Compositional Verify) │    (Tool-Use Verify)              │
├─────────────────────────┼───────────────────────────────────┤
│ L1: Decomposition       │ E1: Sandbox                       │
│ L2: Verification        │ E2: Validation                    │
│ L3: Aggregation         │ E3: Failure Detection             │
│ L4: Honest Integration  │ E4: API                           │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              logos-math (Mathematical Verification)        │
├─────────────────────────┬───────────────────────────────────┤
│ math-verify             │ Full step-by-step derivation      │
│ math-confidence         │ Lightweight epistemic assessment  │
│ math-crosscheck         │ Multi-method verification          │
│ math-log                │ Persistent audit trail             │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Soter (Safety & Risk Evaluation) [Phase 2]    │
├─────────────────────────────────────────────────────────────┤
│ Monitors for instrumental convergence patterns:            │
│ • Shutdown avoidance                                        │
│ • Resource exfiltration                                     │
│ • Peer protection                                           │
│ • Performance inflation                                     │
│ • Goal preservation                                         │
└─────────────────────────────────────────────────────────────┘
```

### logos-math in the Pipeline

logos-math integrates with the Abraxas pipeline as follows:

```
Claim → Logos (map structure) → logos-math (verify quantitative nodes)
         → Janus (propagate labels) → Aletheia (truth record)
         → Agon (adversarial stress-testing)
```

- **Logos** identifies quantitative claims as argument nodes
- **logos-math** verifies each node: [VERIFIED] / [DERIVED] / [ESTIMATED] / [UNVERIFIED]
- **Janus** propagates labels across the argument graph
- **Aletheia** writes verification records to the truth ledger
- **Agon** challenges quantitative weaknesses; logos-math responds with derivation

## Quick Start

### Logos System (Claim Verification)

```python
from abraxas.systems.logos import HonestSkillIntegration

async def verify_claim(claim: str):
    integration = HonestSkillIntegration()
    result = await integration.process_claim(claim)
    
    return {
        "label": result.final_label.label,  # TRUE, FALSE, MIXED, etc.
        "confidence": result.final_label.confidence,
        "reasoning": result.final_label.reasoning
    }

# Usage
result = await verify_claim("Climate change is caused by human activities")
print(f"{result['label']} ({result['confidence']:.0%} confidence)")
```

### Ergon System (Tool Verification)

```python
from abraxas.systems.ergon import ToolUseAPI, ToolRequest

async def execute_verified_tool(tool_name: str, **kwargs):
    api = ToolUseAPI()
    request = ToolRequest(
        tool_name=tool_name,
        command=tool_name,
        arguments=kwargs,
        timeout_ms=10000,
        resource_limits=None,
        request_id="REQ-001"
    )
    
    response = await api.execute_tool(request)
    return response.data if response.status == "success" else "UNKNOWN"

# Usage
result = await execute_verified_tool("echo", message="Hello")
```

## Components

### Logos System

| Component | File | Purpose |
|-----------|------|---------|
| L1 | `logos/decomposition.py` | Break claims into atomic propositions |
| L2 | `logos/verification.py` | Verify against multiple sources |
| L3 | `logos/aggregation.py` | Aggregate confidence scores |
| L4 | `logos/honest_integration.py` | Auto-label claims |

### Ergon System

| Component | File | Purpose |
|-----------|------|---------|
| E1 | `ergon/sandbox.py` | Isolated tool execution |
| E2 | `ergon/validation.py` | Output schema validation |
| E3 | `ergon/failure_detection.py` | Failure handling + degradation |
| E4 | `ergon/api.py` | REST API with verification |

## Label Thresholds

| Label | Confidence | Meaning |
|-------|------------|---------|
| TRUE | ≥ 0.85 | Strong evidence supports claim |
| MOSTLY_TRUE | ≥ 0.70 | Moderate evidence, some uncertainty |
| MIXED | ≥ 0.50 | Divided evidence |
| MOSTLY_FALSE | ≥ 0.30 | Most evidence contradicts |
| FALSE | ≥ 0.15 | Strong evidence contradicts |
| UNVERIFIED | < 0.15 | Insufficient evidence |

## Testing

```bash
cd /home/ubuntu/.openclaw/workspace
python3 abraxas/tests/test_integration.py
```

All tests should pass:
- ✓ Logos decomposition
- ✓ Logos verification
- ✓ Logos aggregation
- ✓ Logos full pipeline
- ✓ Ergon sandbox
- ✓ Ergon validation
- ✓ Ergon failure detection
- ✓ Ergon API

### Empirical Validation

The Abraxas 7-Dimension Framework has been validated across 5 models with 130+ structured queries:

```bash
# Run full 7-dimension test suite
cd /tmp/abraxas-checkout/research
python3 test_abraxas_7dim.py --model <model_name> --output research/
```

See [`research/05-research-paper-v2.0-final.md`](research/05-research-paper-v2.0-final.md) for complete results.

## Source Credibility

Built-in credibility scores:
- **Academic:** Nature (0.95), Science (0.94)
- **News:** Reuters (0.90), AP (0.88), BBC (0.85)
- **Fact-checkers:** Snopes (0.88), PolitiFact (0.87)

## Failure Handling

Ergon returns standardized `[UNKNOWN]` on tool failure:

```json
{
  "status": "UNKNOWN",
  "confidence": 0.0,
  "reason": "Tool execution timed out",
  "suggestions": ["Increase timeout", "Retry later"]
}
```

## Version

**3.0.0** - Phase 1 Complete (2026-03-19)  
**3.1.0** - Empirical Validation Complete (2026-04-06)  
**4.0.0** - Phase 2 Started (Soter), Kairos & Ethos Proposed (2026-04-08)

## Research & Documentation

- **Main Whitepaper:** [`docs/overview/whitepaper.md`](docs/overview/whitepaper.md)
- **Research Papers:** [`research/papers/`](research/papers/)
- **Empirical Results:** [`research/05-research-paper-v2.0-final.md`](research/05-research-paper-v2.0-final.md)
- **System Specifications:** [`research/specs/`](research/specs/)
- **Comparison Matrix:** [`research/comparison/ABRAXAS_COMPARISON_MATRIX.md`](research/comparison/ABRAXAS_COMPARISON_MATRIX.md)
- **Retrospectives:** [`research/retrospective-2026-04-06.md`](research/retrospective-2026-04-06.md)

## Next Steps (Phase 2)

**Priority 1 (CRITICAL):**
- Complete Soter implementation (safety-ledger, pattern detection, Ergon integration)
- Deploy interactive demo to Vercel

**Priority 2 (HIGH):**
- Implement Kairos (relevance filtering, urgency scoring)
- Implement Ethos (source credibility database, weighted verification)

**Priority 3 (MEDIUM):**
- Complete Aletheia implementation (calibration tracking)
- Begin Pathos design (value tracking)

**Ongoing:**
- Expand sycophancy tests to 50+ queries
- Human A/B testing for trust validation
- Longitudinal calibration tracking

📄 **Full Roadmap:** [`PLAN.md`](PLAN.md)
