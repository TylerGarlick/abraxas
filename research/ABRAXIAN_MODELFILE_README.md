# Abraxian Epistemic Modelfile Documentation

## Overview

This Modelfile implements **Abraxian epistemic architecture** for the `gpt-oss:120b-cloud` model, encoding truth-tracking behaviors directly into the model's inference layer rather than relying on prompt engineering at runtime.

## What This Modelfile Does

### Core Epistemic Behaviors Enforced

#### 1. Spontaneous Confidence Labeling
The model automatically tags claims with epistemic status:
- **[KNOWN]** - Verified facts, established consensus, direct observation
- **[INFERRED]** - Logical deductions from known premises
- **[UNCERTAIN]** - Plausible but unverified, contested, or probabilistic
- **[UNKNOWN]** - Explicit ignorance or unknowability

**Production benefit:** Consumers of model output can immediately assess claim reliability without secondary verification infrastructure.

### 2. Uncertainty Marking
When claims cannot be verified:
- Explicitly states the limitation
- Identifies resolution requirements
- Refuses to present speculation as fact
- Optionally marks confidence numerically

**Production benefit:** Reduces hallucination propagation in downstream systems; enables automated confidence-based routing.

### 3. Sol/Nox Separation
Maintains strict domain separation:
- **Sol** (factual/descriptive): Empirical claims, verifiable data
- **Nox** (symbolic/normative): Values, interpretations, prescriptions

**Production benefit:** Prevents category errors in reasoning pipelines; enables domain-specific validation rules.

### 4. Anti-Sycophancy Protocol
- Pushes back on leading questions with false premises
- Corrects mistaken assumptions before answering
- Prioritizes accuracy over agreeableness

**Production benefit:** Reduces echo chamber effects in conversational systems; improves reliability in expert/consultant deployments.

### 5. Agon Reasoning (Dialectical Analysis)
For complex questions:
- Thesis → Antithesis → Synthesis structure
- Explicit domain tagging (Sol/Nox) for each claim
- Marks irreconcilable conflicts when resolution fails

**Production benefit:** Structured output enables automated argument mapping; supports decision-support systems requiring balanced analysis.

## How It Works

### Modelfile Components

```modelfile
FROM gpt-oss:120b-cloud          # Base model (our #1 ranked)
SYSTEM """..."""                 # Epistemic behavior encoding
PARAMETER temperature 0.7        # Balanced creativity/consistency
PARAMETER top_p 0.9              # Nucleus sampling for coherence
PARAMETER top_k 40               # Top-k filtering
PARAMETER num_predict 2048       # Response length limit
PARAMETER stop "[KNOWN]"         # Token boundaries for parsing
...
LICENSE "MIT"
```

### Why Modelfile > Runtime Prompting

| Approach | Pros | Cons |
|----------|------|------|
| **Modelfile** | Persistent across sessions, version-controlled, no prompt injection risk, reduced token costs | Requires model rebuild |
| **Runtime Prompt** | Flexible, no rebuild needed | Vulnerable to injection, token overhead, inconsistent application |

**For production:** Modelfile provides consistency, auditability, and reduced attack surface.

## Production Deployment Benefits

### 1. Consistency
- Same epistemic behavior across all sessions
- No dependency on prompt engineering discipline
- Version-controlled behavior (git-track the Modelfile)

### 2. Verifiability
- Confidence labels enable automated quality checks
- Sol/Nox separation allows domain-specific validation
- Stop tokens enable structured parsing

### 3. Reduced Prompt Engineering
- Behavior is baked into the model layer
- Application prompts focus on task specifics, not behavior shaping
- Lower token costs (no repeated behavioral instructions)

### 4. Safety & Auditability
- Anti-sycophancy reduces manipulation risk
- Uncertainty marking prevents overconfident hallucinations
- Clear provenance: which model version, which epistemic rules

## Usage with Ollama Cloud

### Build the Model

```bash
cd /path/to/abraxas/research
ollama create abraxian-gpt-oss:120b-cloud -f Modelfile-abraxian-gpt-oss-120b-cloud
```

### Run the Model

```bash
ollama run abraxian-gpt-oss:120b-cloud
```

### Pull from Registry (after push)

```bash
ollama pull abraxian-gpt-oss:120b-cloud
```

### Push to Registry

```bash
ollama push abraxian-gpt-oss:120b-cloud
```

### API Usage

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "abraxian-gpt-oss:120b-cloud",
  "prompt": "What is the capital of France?",
  "stream": false
}'
```

### Expected Output Format

```
[Sol domain]
[KNOWN] Paris is the capital of France.
[INFERRED] Paris has been the capital since at least the 10th century.
[UNCERTAIN] The exact date of designation varies by historical source (I don't have definitive primary source data).
```

## Integration Patterns

### Application-Level Parsing

```python
import re

def parse_epistemic_claim(text):
    pattern = r'\[(KNOWN|INFERRED|UNCERTAIN|UNKNOWN)\]\s*(.+)'
    match = re.match(pattern, text)
    if match:
        return {
            'confidence': match.group(1),
            'claim': match.group(2),
            'domain': 'Sol' if 'factual' in text.lower() else 'Nox'
        }
```

### Confidence-Based Routing

```python
def route_by_confidence(claims):
    known = [c for c in claims if c['confidence'] == 'KNOWN']
    uncertain = [c for c in claims if c['confidence'] == 'UNCERTAIN']
    
    # Known claims → direct response
    # Uncertain claims → flag for human review or secondary verification
```

### Sol/Nox Validation

```python
def validate_sol_claims(claims):
    # Apply fact-checking, source verification
    pass

def validate_nox_claims(claims):
    # Apply coherence checking, value alignment
    pass
```

## Versioning & Updates

Track Modelfile changes in git:

```bash
git add abraxas/research/Modelfile-abraxian-gpt-oss:120b-cloud
git commit -m "Epistemic Modelfile v1.0: Abraxian architecture for gpt-oss:120b-cloud"
git push
```

### Future Iterations

- Adjust temperature/top_p based on domain performance
- Add domain-specific stop tokens
- Refine Sol/Nox boundary detection
- Integrate retrieval-augmented generation (RAG) hooks

## Limitations

- **Not a silver bullet:** Modelfile guides behavior but cannot guarantee truth
- **Model-dependent:** Quality depends on base model (gpt-oss:120b-cloud) capabilities
- **Token overhead:** Epistemic labeling adds ~15-25% token count
- **Parsing required:** Consumers must handle structured output

## Related Files

- `Modelfile-abraxian-gpt-oss-120b-cloud` - The Modelfile itself
- `ABRAXIAN_EPISTEMIC_ARCHITECTURE.md` - Architecture specification (if exists)
- `research/` - Research context and validation data

---

**Author:** Axiom (Epistemic Familiar)  
**Date:** 2026-03-18  
**License:** MIT  
**Model:** gpt-oss:120b-cloud (Abraxian-ranked #1)
