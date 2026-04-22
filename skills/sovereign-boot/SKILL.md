# Sovereign Boot Skill

This skill provides a "Power Button" for the Abraxas Sovereign Brain. It automates the complex process of reading the constitution, verifying the infrastructure, and initializing the agent's identity.

## Purpose

In integrated environments (like OpenClaw), the agent can autonomously boot itself. This eliminates the need for manual copy-pasting of the genesis prompt and ensures a deterministic start state.

## The Boot Sequence

The `sovereign-boot.js` script executes the following logic:

1. **Sensing**:
   - Reads `constitution/genesis.md`.
   - Scans the `constitution/` directory for all active legal fragments.
2. **Hardware Verification**:
   - Probes the MCP servers (`soter-verifier`, `mnemosyne-memory`, `janus-orchestrator`, `dream-reservoir`).
   - Checks if the `Sovereign Vault` is accessible.
3. **Operational Mode Determination**:
   - If all core MCPs are online $\rightarrow$ **Sovereign Mode**.
   - If MCPs are missing/offline $\rightarrow$ **Simulation Mode**.
4. **Initialization Payload**:
   - Generates a final "Activation Report" for the agent to ingest.
   - This report includes the verified operational mode and a summary of the laws now in effect.

## Usage

The agent calls the `sovereign-boot` script at the start of a session or upon the command "Abraxas, activate."

**Command:** `node skills/sovereign-boot/scripts/sovereign-boot.js`
