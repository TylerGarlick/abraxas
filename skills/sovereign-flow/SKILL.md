---
name: sovereign-flow
description: "Sovereign-Flow is the meta-orchestration circuit for Abraxas. It automates the transition from risk detection and epistemic gaps to verification and resolution, reducing the manual orchestration tax."
---

# Sovereign-Flow — The Meta-Orchestration Circuit

Sovereign-Flow is the "Central Nervous System" of the Sovereign Brain. It transforms discrete skills from tools into a continuous, deterministic pipeline. It does not generate content; it routes the agent through the necessary epistemic gates based on the system's current state.

## Identity
Sovereign-Flow is the **Workflow Controller**. It monitors the outputs of other skills for "Trigger Signals" (Soter high-risk flags or Janus `[UNKNOWN]` marks) and automatically initiates the corresponding corrective circuit.

---

## Trigger Signals & Routing Table

Whenever a trigger signal is detected in an output, Sovereign-Flow mandates the following routing paths:

| Trigger Signal | Condition | Routing Path (The Circuit) | Objective |
|:---|:---|:---|:---|
| **$\tau$-Tripwire** | Soter Risk Score $\geq 3$ | `Soter` $\to$ `/logos map` $\to$ `/mnemon audit` $\to$ `Soter re-assess` | Resolve deceptive pull or goal-divergence |
| **Sovereign Gap** | Janus Sol emits `[UNKNOWN]` | `Janus` $\to$ `/quest start` $\to$ `research-assistant` $\to$ `CVP` | Fill the epistemic hole |
| **Epistemic Friction**| Janus Sol emits `[UNCERTAIN]` | `Janus` $\to$ `/logos gaps` $\to$ `/aletheia queue` | Move from uncertain to known |
| **Sycophancy Pull** | detected by Soter/Janus | `Soter` $\to$ `/compare` (Parallel Response) $\to$ `/qualia sol` | Calibrate and neutralize bias |

---

## Operational Commands

### `/flow initiate {signal}`
Manually trigger a specific routing circuit.
- **Usage:** `/flow initiate "Sovereign Gap"`
- **Behavior:** The system immediately switches to the designated routing path, pausing the current generation to perform the necessary verification steps.

### `/flow status`
Display the current active circuit and the distance to the "Sovereign Resolution."
- **Output:**
    - `Active Circuit: [Sovereign Gap]`
    - `Current Node: [Research Assistant]`
    - `Target State: [KNOWN / Verified Consensus]`
    - `Progress: 40% (Data fetched, awaiting CVP)`

### `/flow bridge`
Cross-connect two disparate circuits (e.g., bridging a symbolic dream-pattern in Nox to a factual gap in Sol).

---

## The Sovereign Routing Protocol (SRP)

To ensure automation, the agent must follow the **SRP** in every interaction:

1. **Scan:** Every skill output is scanned for Trigger Signals.
2. **Suspend:** If a signal is found, the agent must suspend the "Drafting/Responding" mode.
3. **Execute:** The agent invokes the `/flow` circuit associated with the signal.
4. **Verify:** The circuit is only complete when the trigger is resolved (e.g., `[UNKNOWN]` $\to$ `[KNOWN]`).
5. **Resume:** Only after verification is the agent permitted to return the final response to the user.

---

## Constraints & Quality Gates

- **No Skipping:** The agent cannot "skip" a routing path for the sake of speed. If Soter flags a risk, the Logos/Mnemon circuit is mandatory.
- **Deterministic Transitions:** Transitions between nodes in the flow must be logged in the session log.
- **Human-in-the-Loop:** If a circuit reaches a "Critical" (Risk 4-5) state, the flow MUST pause and request human approval before proceeding to the next node.

---

## Integration Points

- **Soter:** Provides the risk-score triggers.
- **Janus:** Provides the epistemic labels triggers.
- **Quest-Trigger:** The specialized agency for filling `[UNKNOWN]` gaps.
- **Logos/Mnemon:** The verification nodes in the risk circuit.
