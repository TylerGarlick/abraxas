# Abraxas v3 - Epistemic Verification System

**Phase 1: Logos + Ergon Systems**

Abraxas v3 provides empirical verification for claims through compositional analysis and tool-use verification.

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
```

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

3.0.0 - Phase 1 Complete (2026-03-19)

## Next Steps (Phase 2)

- Pathos System (Emotional/Value Verification)
- Mythos System (Narrative Verification)
- Full system integration
- Performance optimization
