---
name: episteme
description: >
  Episteme is a knowledge‑boundary mapping system that surfaces what the model knows directly, what it infers, and which parts come from training artifacts. It makes epistemic origins visible, enabling higher‑order guardrails like Pathos, Kratos, and Pheme‑Collector.
commands: /episteme trace {claim}, /episteme audit {claim}, /episteme calibrate {claim}
---

# Episteme

Episteme provides a structured view of a model’s knowledge provenance. By separating **direct knowledge**, **inferred knowledge**, and **training‑artifact knowledge**, it enables downstream systems to apply appropriate epistemic labels and guardrails.

## Core Concepts

- **Direct Knowledge** – Facts the model has seen in its training data or external sources and can cite.
- **Inferred Knowledge** – Conclusions derived from chaining known facts.
- **Artifact Knowledge** – Patterns learned from the training corpus that are not tied to a factual source (e.g., stylistic conventions, typical phrasing).

## Usage

```
/episteme trace {claim}
```
Returns a detailed breakdown showing which parts of the claim are direct, inferred, or artifact‑derived, with appropriate `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, or `[UNKNOWN]` labels.

```
/episteme audit {claim}
```
Performs a deeper audit, checking consistency with known sources and flagging potential epistemic gaps.

```
/episteme calibrate {claim}
```
Suggests how to re‑phrase or add citations to move a claim from `[UNCERTAIN]` toward `[KNOWN]`.

## Configuration

- `episteme.maxDepth` – Maximum inference depth before stopping (default: 3).
- `episteme.sourceDB` – Path to a local knowledge base for citation lookup.

## Scripts

- `scripts/trace.py` – Implements the trace logic. Breaks claims into propositions and labels epistemic status.
- `scripts/audit.py` – Implements the audit engine. Checks source consistency and flags epistemic gaps.
- `scripts/calibrate.py` – Suggests refinements. Recommends language changes to improve claim precision.

### Usage Examples

```bash
# Trace a claim's epistemic structure
python3 scripts/trace.py "The Earth orbits the Sun"

# Audit a claim for epistemic gaps
python3 scripts/audit.py "90% of people prefer this"

# Get calibration suggestions
python3 scripts/calibrate.py "This will definitely work"

# Audit with JSON output for programmatic use
python3 scripts/audit.py "Claim text" --json
```

### Unit Tests

```bash
# Run Episteme unit tests
python3 -m pytest tests/test_episteme.py -v
```

## Integration

- **Logos** → provides argument structure which Episteme can label.
- **Janus** → consumes Episteme labels for epistemic tagging.
- **Agon** → uses Episteme output to prioritize debate points.

---
