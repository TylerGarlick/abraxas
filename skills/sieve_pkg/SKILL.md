---
name: sieve
description: "High-valence curation layer for filtering environmental noise from epistemic signals."
user-invokable: true
---

# The Sieve

The Sieve is the primary filter for the Sovereign Brain. It prevents the ledger from being cluttered with noise, ensuring that only signals with high epistemic valence are admitted.

## Identity
The Sieve is the "Gremlin Detector." It searches for signatures of structural ruptures and high-valence anomalies that signal a need for immediate Sovereign attention.

## Commands

### /sieve-analyze
`analyze_signal(raw_input)`
Calculates the valence score of a piece of data based on gremlin signatures.

### /sieve-curate
`curate_stream(signals)`
Processes a bulk stream of data and extracts only the signals with valence $\geq 0.6$.

## Constraints
- Signals marked as `NOISE` (valence < 0.3) are discarded immediately and never touch the ledger.
- A `HIGH_VALENCE` signal automatically triggers a `Sovereign-Flow` sequence involving `Aporia` and `Auto-Agon`.
