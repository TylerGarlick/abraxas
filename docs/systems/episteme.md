# Episteme: Knowledge Origin Mapping

**Version:** 1.0
**Status:** Operational
**Role:** Epistemic Provenance Engine

Episteme is the "Glass Box" of the Sovereign Brain. While Janus provides labels for *confidence*, Episteme provides labels for *origin*. It allows the user to audit whether a claim is a retrieved fact, a logical inference, or a ghost of the model's training data.

## 🛠️ Core Tooling

### `/episteme trace {claim}`
Traces the specific provenance of a claim.
- **[RET] (Retrieval)**: The claim was explicitly pulled from the Sovereign Vault.
- **[INF] (Inferred)**: The claim was derived through a verified reasoning chain.
- **[DIR] (Direct)**: The claim exists in the model's core training (parametric memory).
- **[ART] (Artifact)**: The claim matches a known training pattern (e.g., "As an AI language model...").
- **[CONF] (Confabulated)**: The claim is an ungrounded fabrication.

### `/episteme audit`
Analyzes the entire session to detect **Epistemic Drift** (where a retrieved fact is mutated into a guess) and **Artifact Saturation** (where the model begins mimicking training patterns).

## 🌐 Integration
Episteme integrates with the **Mnemosyne** retrieval logs and **Logos** reasoning chains to build a complete evidence map for every claim.
