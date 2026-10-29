# Multimodal (Cross-Model) Verification

Abraxas does not accept a claim on one model's self-report. A claim is promoted to a sovereign truth only when at least `threshold` independent *paths* agree **and** the paths are architecturally diverse.

## Tool

`verify_claim_multimodal` (MCP tool, module `cvp`):

```json
{
  "claim": "the claim under test",
  "paths": [
    { "result": "...", "architecture": "transformer-gpt", "provider": "openai", "confidence": 0.8 },
    { "result": "...", "architecture": "transformer-claude", "provider": "anthropic", "confidence": 0.75 }
  ],
  "threshold": 2
}
```

Returns the standard `resolve_consensus` result plus an echoed `claim`:

- `result`: `CONSENSUS` or `UNKNOWN`
- `seal`: `{ type: "CMV_SEAL", architecture_diversity, family_diversity, bias_detected }` on success, otherwise `null`
- `diversity`: `{ diverse, architectureCount, familyCount, isBiased, architectures, families }`

## Diversity rule (common-mode defense)

`VerifierPool.verifyDiversity` rejects the "agreement by bias" case: two architectures that live in the same family (e.g. Llama and Mistral) count as one family. Promotion requires `architectureCount >= requiredArchitectures` (default 2). This is what prevents a single lineage failure from looking like consensus.

## On failure

A failed verification must not mutate the claim record. Log a `log_sovereign_gap` entry with the divergence description and severity instead.
