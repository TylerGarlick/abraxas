# Ethos: Source Credibility Weighting

**Version:** 1.0
**Status:** Operational
**Role:** Epistemic Credibility Engine

Ethos is the "Judge" of the Sovereign Brain. While Episteme tells us *where* information came from, Ethos tells us *how much to trust it*. It prevents the system from being misled by high-fluency but low-credibility sources.

## 🛠️ Core Tooling

### `/ethos score {source}`
Assigns a credibility tier (T1-T5) to a source based on the established Sovereign Registry.
- **T1 (Sovereign/Gold)**: Highest trust (1.0). Used for foundational truth.
- **T5 (Unverified)**: Lowest trust (0.2). Requires multiple corroborating sources to be accepted.

### `/ethos resolve {sourceA, sourceB}`
Deterministic conflict resolution. If two sources provide contradictory information, the source with the higher Ethos weight wins. If weights are equal, the system triggers an `Agon` debate to find the launderer.

## 🌐 Integration
Ethos integrates with **Mnemosyne** (to weight retrieved fragments) and **Logos** (to prioritize which evidence chains are most robust).
