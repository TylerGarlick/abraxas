# Sovereign-Audit Logic: Technical Summary (Sovereign Audit)

## Overview
The `sovereign-audit` tool serves as a "Truth-Gate" within the Abraxas ecosystem. Its primary purpose is to eliminate "simulation" or "hallucination" by grounding claims in the actual state of the filesystem. 

## Core Logic
The logic is based on empirical verification rather than probabilistic inference. It operates on a simple binary premise: **If the evidence exists in the specified target path, the claim is verified; otherwise, it is flagged as a simulation.**

### Mechanism
The tool utilizes the `sovereign_audit` function, which performs the following operations:
1. **Target Identification**: Accepts a `target_path` (file or directory) and an `expected_pattern` (the string evidence).
2. **State Check**:
   - **Files**: Performs a non-interactive `grep` search for the pattern within the specific file.
   - **Directories**: Performs a recursive `grep` search throughout the directory tree.
3. **Verdict Generation**:
   - **Success (`returncode == 0`)**: Returns `[VERIFIED]`, signaling that the artifact is detected and the claim is grounded in reality.
   - **Failure (`returncode != 0`)**: Returns `[SIMULATION DETECTED]`, signaling an epistemic failure where the claim does not match the physical state.

## Technical Implementation
- **Language**: Python 3
- **Dependencies**: `subprocess`, `os`, `re`
- **Execution**: Invoked via CLI with two positional arguments: `<target_path>` and `<expected_pattern>`.

## Integration with Abraxas
This tool is the enforcement mechanism for the "No Assuming State" mandate. By requiring a `[VERIFIED]` output from the `sovereign-audit` tool before a task is considered complete, Abraxas ensures that all technical artifacts are physically present and accurate.
