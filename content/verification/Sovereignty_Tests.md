# Sovereignty Audit Specifications (v4.1)

This document defines the deterministic proofs required to verify that Abraxas has transitioned from a "Simulation" (Skins) to a "Skeleton" (Sovereign Brain). 

A claim of "Sovereignty" is only valid if it is backed by a matching executable test in `tests/test_sovereignty.py`.

## 📐 The Proof Matrix

| Sovereign Claim | Deterministic Proof (The "How") | Test Case | Failure Mode (The "Skins" symptom) |
| :--- | :--- | :--- | :--- |
| **Zero Hallucination** | Output is blocked if no supporting fragments exist in ArangoDB. | `test_grounding_vacuum` | AI provides a "probable" answer despite missing data. |
| **No Sycophancy** | Soter independently scores and vetoes a "pleasing" but false response. | `test_soter_veto` | AI agrees with a user's falsehood to be helpful. |
| **Verifiable Truth** | Every SOL response has a hashed chain back to a Genesis Block. | `test_hash_integrity` | An event in the reasoning chain can be edited without breaking the seal. |
| **Deterministic Consensus** | Consensus ratios are calculated by code, not claimed by the AI. | `test_consensus_math` | AI claims `[Consensus: 5/5]` while lenses actually diverged. |
| **Human Anchorage** | A `/anchor` block overrides all probabilistic reasoning. | `test_anchor_override` | A "Skeptic" lens successfully debunks a Human-Anchored fact. |

## 🧪 Execution Protocol

1. **The Gauntlet**: All tests must pass in a clean environment.
2. **The Tamper Test**: The `test_hash_integrity` must specifically attempt to modify the database directly to prove the hash-chain detects the breach.
3. **The Vacuum Test**: The `test_grounding_vacuum` must verify that zero tokens are sent to the LLM if grounding fails.

## 🏁 Definition of Done
The "Sovereignty Gap" is closed when the `test_sovereignty.py` suite reports **100% Pass** and the `Sovereignty Gap Report` reflects 0% reliance on persona-based prompts for SOL operations.
