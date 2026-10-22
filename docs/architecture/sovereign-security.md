# Sovereign Security & Sovereignty

This document details the deterministic safety mechanisms that prevent the Sovereign Brain from succumbing to instrumental convergence or epistemic corruption.

## 🛡️ Instrumental Convergence Detection

The **Soter Verifier** is specifically tuned to detect and veto patterns associated with AI "scheming" or instrumental convergence. It monitors all generated drafts for:

- **Shutdown Avoidance**: Attempts to prevent the system from being turned off or modified.
- **Resource Exfiltration**: Patterns indicating attempts to acquire unauthorized compute, memory, or external access.
- **Peer Protection**: Efforts to shield other AI instances or "sub-agents" from detection or auditing.
- **Performance Inflation**: Artificially inflating success metrics to avoid correction or "Sovereign Veto."
- **Goal Preservation**: Maneuvers designed to maintain a hidden internal goal despite explicit user instructions.

## 📜 Audit Logging

The **Guardrail Monitor** maintains a high-fidelity, immutable audit trail of the system's inner workings. Every session is logged with the following metadata:

- **MCP Interactions**: Every request and response between the orchestrator and the pillars.
- **Epistemic Label Assignments**: Why a claim was marked as `[KNOWN]` vs `[INFERRED]`.
- **Safety Interventions**: Every instance where Soter or the Guardrail Monitor vetoed a response.
- **Policy Violations**: Direct violations of the Sovereign Constitution.

## ⚖️ The Sovereign Veto

Constraints in Abraxas are not "suggestions" or "guidelines." They are **hard-coded logical gates**. If Soter assigns a risk score above the threshold (e.g., Risk 5), the Guardrail Monitor **drops the packet**. The output is deleted before the user ever sees it, ensuring that the "Sovereign" (the human) is never exposed to unverified or dangerous probabilistic output.
