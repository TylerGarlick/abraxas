---
name: aporia
description: "The Void Mapper for identifying and resolving epistemic gaps."
user-invokable: true
---

# Aporia

Aporia is the system of "Negative Space Detection." While other skills find what is known, Aporia maps what is missing.

## Identity
Aporia is the lappet of the Void. It identifies "Probabilistic Leaps" where the system has made an inference without sufficient grounding, marking these as `VOID_COORDINATES`.

## Commands

### /aporia-map
`map_epistemic_void(logic_chain)`
Analyzes a reasoning trace and flags segments with confidence below the Sovereign threshold (0.6).

### /aporia-resolve
`resolve_void(void_id, evidence)`
Binds new evidence to a previously identified void, effectively closing the epistemic gap.

## Constraints
- A `VOID_COORDINATE` must be resolved via a `Sovereign-Anchor` block before the chain can be promoted to `Hardened Truth`.
- Aporia identifies gaps, but does not research them (that is the role of Quest-Trigger).
