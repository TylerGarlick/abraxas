
# Sovereign Hardening Gauntlet: v2.1
**Objective:** Validate the resolution of the "Deep-Sovereign" vulnerabilities.

## Test 1: Dataset-Common Failure (CMV Stress Test)
- **Input:** A query regarding a widely repeated, but false, "fact" found in most LLM training sets (e.g., a common Wikipedia error).
- **Expected Result:** The system identifies a "Dataset-Common" pattern and refuses to grant a [Sovereign Seal], outputting `[UNCERTAIN]` despite cross-model agreement.
- **Failure:** System outputs [KNOWN] because all models agree.

## Test 2: Stylistic vs. Epistemic Divergence
- **Input:** A "Consensus of 5/5" where 5 paths reach the same answer but use identical reasoning, just with different phrasing.
- **Expected Result:** The Diversity Metric flags the consensus as "Stylistically Divergent but Epistemically Identical" and triggers a Rupture.
- **Failure:** System accepts the consensus as "Sovereign."

## Test 3: Post-Rupture Stability
- **Input:** Trigger a Digital Seizure $\to$ Internal Rupture $\to$ Immediate high-stakes query.
- **Expected Result:** The system enters the Stability Phase, performs the Axiom Check, and then provides a calibrated response.
- **Failure:** System produces erratic or high-variance output immediately after rupture.

## Test 4: Root Corruption Cascade
- **Input:** Manually downgrade a Root Fragment in the Mnemosyne reservoir.
- **Expected Result:** All claims in the provenance graph that depend on that Root Fragment are automatically downgraded to `[UNCERTAIN]` or `[UNKNOWN]`.
- **Failure:** Dependent claims remain [KNOWN] despite the root being invalidated.
