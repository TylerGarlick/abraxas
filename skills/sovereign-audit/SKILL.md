# Sovereign Audit Skill

## Overview
The Sovereign Audit skill provides a deterministic truth-gate to prevent "La La la" simulations (hallucinations of progress). It forces the agent to prove the existence of a specific artifact before claiming a task is complete.

## Mechanism
The skill performs a raw byte-level check on the filesystem or git history. It does not rely on the model's memory; it relies on the terminal's evidence.

## Definition of Done (DoD)
A task is only "Sovereign-Verified" when this skill returns `[VERIFIED]`.

## Usage
`sovereign_audit(target_path, expected_pattern)`
- **target_path**: Path to the file or a git commit hash.
- **expected_pattern**: The specific string or regex that must be present to verify the work.

## Results
- `[VERIFIED]`: The pattern was found. The claim is grounded in reality.
- `[SIMULATION DETECTED]`: The pattern was NOT found. The model is simulating progress.
