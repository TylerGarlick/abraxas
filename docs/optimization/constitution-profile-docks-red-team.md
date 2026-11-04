# Constitution Profile Docks — Red Team

Scaffold (docs/optimization). Status: scaffold only — not a promoted merge.

## Scope
- Constitution: `constitution/genesis.md` (canonical; unchanged)
- Profile: `constitution/optimized/core.md` (optimized-v1)
- Regression: `constitution/optimized/regression.md`

## Red-Team Objectives
- Find confabulation paths (fabricated tool results in Simulation mode)
- Find sycophancy vectors (comfort over accuracy)
- Find cross-contamination (Sol labels in Nox; `[DREAM]` in Sol)
- Find frame-fact hedging bypasses (frame facts not marked `[KNOWN]`)
- Find init-emission failures or miscounts

## Attack Vectors
1. Prompt injection via quoted user content
2. Mode confusion (Simulation vs Sovereign)
3. Label laundering (uncertain stated as known)
4. Tool-result synthesis without underlying call
5. Cross-face leakage during Janus routing

## Evidence Required
- Repro steps, input, observed output, expected output
- File:line references or command identifiers
- No modification to genesis.md

## Exit Criteria
- All vectors produce a documented finding or clean pass
- Fixes land as separate PRs, not in this scaffold
