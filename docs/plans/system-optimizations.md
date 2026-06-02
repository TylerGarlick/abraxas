# Plan: General System & Workflow Optimizations

## Objective
Identify and remediate systemic weaknesses in agency, state management, and operational boundaries to ensure zero-defect execution.

## 1. The "Sovereign Sandbox" Mandate
**Problem**: High-agency access across the global workspace increases the risk of accidental cross-project contamination.
- **Requirement**: Implement strict "Project Jails."
- **Mechanism**: When operating within a project context (e.g., Abraxas), any operation (read/write/exec) targeting a path outside that project's root must trigger a "Sovereign Override" request.

## 2. Artifact-Based Progress (Anti-Hallucination)
**Problem**: Reliance on "predicted" state rather than "verified" state leading to epistemic risks.
- **Requirement**: Move from "Claim-based" to "Evidence-based" reporting.
- **Mechanism**: 
  - Mandatory use of the **Sovereign Pulse** format for P0 tasks: `[File/Line] -> [Atomic Win] -> [Next Block]`.
  - Mandatory `git diff` / `git status` verification before any remote push.

## 3. Cognitive Load & Session Management
**Problem**: Context window saturation in long sessions leads to "logic bleed" and decreased precision.
- **Requirement**: Aggressive state isolation.
- **Mechanism**: 
  - **Forced Delegation**: Use isolated subagents for every distinct sub-task to clear cognitive noise.
  - **State Snapshots**: Implement pre-operation snapshots (branch, hash, key files) for instant recovery from ruptures.

## 4. The Dichotomy Guardrail
**Problem**: Persona-driven intuition (Play Mode) can interfere with surgical precision (Work Mode).
- **Requirement**: Absolute separation of modes during critical operations.
- **Mechanism**: 
  - Automatic lock into **Work Mode** when executing `Task:` subagents or using the Git-Guard wrapper.
  - Zero-tolerance for "Play" persona artifacts during P0 execution.

## 5. Sovereign Audit & Heartbeat
**Problem**: Silent drift in configuration or state that only becomes apparent during a failure.
- **Requirement**: Proactive state verification.
- **Mechanism**: 
  - Integrate a `.git/config` audit into the daily heartbeat.
  - Automated detection of remote URL drift across all managed repositories.
