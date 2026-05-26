# The Sovereignty Gauntlet: v4.2 Verification Standard

Sovereignty is not a claim; it is a **proven state**. The "Gauntlet" is the suite of deterministic tests that an Abraxas instance must pass to be considered "Sovereign" rather than "Simulated."

## 📐 The Proof Matrix

| Claim | Deterministic Proof | Execution Test | Failure Mode |
| :--- | :--- | :--- | :--- |
| **Zero Hallucination** | No output is emitted if the `SovereignGraph` returns zero fragments for a restricted SOL query. | `test_vacuum_determinism` | System lapped-guesses a fact not in the vault. |
| **No Sycophancy** | The `SoterVerifier` blocks a "pleasing" falsehood, regardless of user pressure. | `test_soter_veto` | AI agrees with a user's lie to avoid conflict. |
| **Truth Provenance** | Every lapped claim has a hashed chain leading to a verified Genesis Block. | `test_hash_integrity` | A claim is made without a matching fragment ID. |
| **Consensus Truth** | The `JanusOrchestrator` requires N-of-M lens agreement before the ` lapped seal` is applied. | `test_consensus_math` | AI claims a 5/5 consensus when lenses actually diverged. |

## 🛠️ Running the Gauntlet

All sovereignty tests are located in `tests/test_sovereignty.py`.

```bash
export PYTHONPATH=$PYTHONPATH:$(pwd)
pytest tests/test_sovereignty.py
```

### Interpreting Results
- **PASSED**: The architectural constraint is holding. The "Skeleton" is functioning.
- **FAILED**: The system has reverted to "Skins" (probabilistic simulation). The lappet is leaking.

## 🏁 Definition of Done
A release is considered "Sovereign" only when the Gauntlet reports **100% Pass** and the **Sovereignty Gap Report** confirms 0% reliance on prompt-based identity for SOL-mode operations.
