# 📖 Abraxas Ledger Usage Guide: Ending the Drift

This document defines the mandatory operational standard for task tracking within the Abraxas project. **Native OpenClaw `/tasks` are deprecated and forbidden for project work.**

## 🚨 The Golden Rule
**If it is not in the Ledger, it does not exist.**

## 🛠️ How to Use the Ledger Skill

### 1. Task Creation
Do not use `/tasks create`. Instead, use the Abraxas project-scoped tasking syntax:
- **Syntax**: `Task: Abraxas: <prompt>` or `/task abraxas: <prompt>`
- **Requirement**: Every task must be project-attached to `abraxas`.

### 2. The Sovereign Definition of Done (S-DoD)
A task is not `CLOSED` until the following empirical evidence is provided:
- **Artifact Proof**: A raw `read` or `ls -la` of the modified file.
- **Runtime Proof**: Raw `stdout`/`stderr` of the code executing in the workspace.
- **Linguistic Audit**: Final report leads with the **Atomic Win**, zero "loading spinner" fluff.

### 3. The Audit Cycle
- **Close-Out Audit**: Triggered when a task is marked `CLOSED`. Demand S-DoD proof.
- **Sovereign Pulse**: Triggered mid-task. If 2+ turns of "intent-signaling" occur without an artifact, trigger `[SVR-RUPTURE]`.

## 📉 Why we do this
Native tasks are probabilistic. The ArangoDB Ledger is empirical. By anchoring our work to the Bedrock, we eliminate the "Sovereign Static" and ensure that cognitive loops are detected and purged immediately.

---
*Last Verified: 2026-05-28*
*Sovereign Status: ALIGNED*
