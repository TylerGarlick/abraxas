# [SVR-LOOP] Core-Loop Epistemic Interception Specification

## 1. Objective
Transition the `sovereign-audit` from a voluntary skill to a systemic architectural constraint within the OpenClaw agent-loop.

## 2. The Sovereign Gate (Interceptor Layer)
The system shall implement a middleware interceptor that monitors all outbound messages from the agent.

### 2.1 Trigger Conditions
The interceptor activates when a message matches "Completion Patterns":
- Phrases like "I have completed," "Task is done," "Fixed the issue," "Pushed the changes."
- Any signal indicating the transition of a task to a `Closed` or `Verified` state.

### 2.2 Verification Sequence
Upon trigger, the system pauses message delivery and executes the following sequence:
1. **Artifact Identification**: Extract the target file or commit hash associated with the current task from the Sovereign Ledger.
2. **Deterministic Audit**: Call the `sovereign-audit` logic against the identified artifact.
3. **Verdict Evaluation**:
    - **`[VERIFIED]`**: The message is released to the user.
    - **`[SIMULATION DETECTED]`**: The message is blocked.

## 3. The Rupture Protocol
If a `[SIMULATION DETECTED]` verdict is reached:
1. **Message Block**: The "Done" claim is deleted.
2. **Sovereign Alert**: The system injects `[SVR-RUPTURE: SIMULATION DETECTED]` into the session transcript.
3. **State Reset**: The model's current "intent" buffer is flushed.
4. **Deterministic Force**: The model is forced to execute a `sovereign-audit` tool call before it can generate any further text.

## 4. Success Metrics (DoD)
- [x] Technical specification documented and pushed.
- [ ] PoC showing a "Completion" message being blocked by the gate.
- [ ] Integration of `sovereign-audit` into the core loop middleware.
- [ ] Verified elimination of "la la la" status updates.
