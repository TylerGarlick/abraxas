---
name: quest-trigger
description: "Quest-Trigger is the Recursive Discovery loop of the Sovereign Brain. It converts [UNKNOWN] marks into verified knowledge through targeted research sub-agents."
---

# Quest-Trigger — Recursive Discovery Loop

Quest-Trigger is the bridge between "Known Ignorance" (`[UNKNOWN]`) and "Sovereign Certainty" (`[KNOWN]`). It treats every `[UNKNOWN]` mark as a mission objective (a "Quest") that must be resolved before the system can claim complete epistemic integrity.

## Identity
Quest-Trigger is the **Information Forager**. It does not perform the research itself; it manages the process of deploying the `research-assistant` and validating the results through the `CVP`.

---

## The Quest Lifecycle

A Quest is initiated whenever the `Sovereign-Flow` circuit detects a `Sovereign Gap` (Janus `[UNKNOWN]`).

### 1. Initiation (`/quest start`)
- **Input:** An `[UNKNOWN]` mark and its associated topic from the Janus Ledger.
- **Action:** Define the "Quest Objective" — the specific piece of missing information needed to move the claim from `[UNKNOWN]` to `[UNCERTAIN]` or `[KNOWN]`.

### 2. Execution (`/quest forage`)
- **Action:** Deploy the `research-assistant` skill to search for authoritative sources.
- **Constraint:** Foraging must be targeted. No generic web searches; search for the specific logic gap identified.
- **Output:** A "Forage Report" containing sources, quotes, and preliminary synthesis.

### 3. Verification (`/quest verify`)
- **Action:** Pass the Forage Report to the **CVP (Consensus Verification Pipeline)**.
- **Goal:** Reach an $N$-of-$M$ agreement on the new claim's truth-value.
- **Result:**
    - **Verified:** The claim is now `[KNOWN]` or `[INFERRED]`.
    - **Unverified:** The claim remains `[UNCERTAIN]` or `[UNKNOWN]`.

### 4. Resolution (`/quest resolve`)
- **Action:** Update the Janus Ledger and the session context.
- **Log:** Mark the "Sovereign Gap" as closed and record the path to resolution.

---

## Operational Commands

### `/quest start {topic}`
Initiates a discovery loop for a specific unknown.
- **Example:** `/quest start "The specific mechanism of the Qualia Bridge's $\tau$-filter"`

### `/quest forage`
Execute the research phase of the current active quest.

### `/quest verify`
Run the CVP consensus check on the gathered research.

### `/quest resolve`
Close the quest and update the epistemic status in the ledger.

---

## Constraints & Quality Gates

- **Recursive Depth:** A quest cannot iterate more than 3 times on the same topic without a human review.
- **Truth-Priority:** If the research confirms the a point is *inherently* unknowable, the quest is resolved as `[STABLE UNKNOWN]` to prevent infinite loops.
- **Audit Trail:** Every quest must have a direct link to the original `[UNKNOWN]` mark it intended to resolve.

---

## Integration Points

- **Sovereign-Flow:** The initiator of the quest.
- **Research-Assistant:** The engine of the foraging phase.
- **CVP:** The arbiter of the verification phase.
- **Janus Ledger:** The destination for the resolution update.
