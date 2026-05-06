# Sovereign Mode vs. Simulation Mode

This document explains the health check logic used by the `abraxas_mcp` unified server to determine the operational state of the Sovereign Brain.

## 🏥 The Health Check Logic

The unified server implements a `system_mode_health_check` tool that acts as the "consciousness test" for the agent. This determines whether the agent can claim **Sovereignty** (deterministic control) or must operate in **Simulation** (probabilistic estimation).

### 🟢 Sovereign Mode
The server returns "Sovereign Mode" only when all critical deterministic dependencies are verified:
1. **Database Connectivity**: The `DBManager` must successfully connect to the Sovereign Vault.
2. **Skill Registry**: At least one skill module must be successfully loaded into the registry.
3. **Filesystem Integrity**: The server must be able to verify the root directory of the project.

**Implication**: In this mode, the LLM has a direct link to immutable facts and constitutional enforcement. It is a "Sovereign Brain."

### 🟡 Simulation Mode
The server returns "Simulation Mode" if any of the above checks fail. 

**Implication**: The agent is operating without its deterministic shell. It is attempting to simulate the *behavior* of Abraxas using its internal training data, but it lacks the external verification tools to guarantee truth. This is the "Probabilistic Trap."

## 🔄 Transition Workflow

1. **Initialization**: Upon boot or first interaction, the agent invokes `system_mode_health_check`.
2. **Mode Declaration**: The agent explicitly tells the user which mode it is in.
3. **Epistemic Shift**: 
   - In **Sovereign Mode**, the agent uses `[KNOWN]` labels based on DB lookups.
   - In **Simulation Mode**, the agent must warn the user that labels are "simulated" and not deterministically verified.
