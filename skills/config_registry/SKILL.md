---
name: config-registry
description: "Manages and retrieves Sovereign system configuration parameters and operational constants."
---

# Config Registry MCP

The Config Registry is a specialized Sovereign system service responsible for the centralized management and retrieval of configuration parameters. It ensures that all other MCP services have a single source of truth for thresholds, modes, and constants.

## Identity
The Config Registry acts as the **Sovereign Epistemic Anchor** for system settings. It provides a read-only (primarily) interface to the core configuration file, ensuring that operational parameters are consistent across the distributed architecture.

## Commands

### `/config_get`
- **Behavior**: Retrieves a specific configuration value using dot-notation (e.g., `Soter.RiskThreshold`).
- **Input**: `path` (string)
- **Output**: JSON object containing the value and path.

### `/config_get_all`
- **Behavior**: Returns the entire system configuration.
- **Security**: Automatically masks secrets (passwords, keys) using the `SecretMasker` logic.
- **Output**: Masked configuration JSON including version and last load timestamp.

### `/config_get_section`
- **Behavior**: Retrieves a specific top-level configuration block (e.g., "Soter", "Ethos").
- **Input**: `section` (string)
- **Output**: Masked JSON object for the requested section.

### `/config_reload`
- **Behavior**: Forces the service to re-read the `SOVEREIGN_CONFIG.yaml` from the workspace.
- **Input**: None
- **Output**: Success/Failure status and new configuration version.

## Operational Constraints
- **Read-Only by Default**: The registry primarily serves as a provider. Configuration changes are typically made to the file on disk by an authorized agent and then reloaded.
- **Secret Masking**: No raw secrets are ever emitted via MCP tools.
- **Path Validation**: Invalid dot-notation paths result in a specific error message rather than a system crash.

## Implementation Details
- **Storage**: Backed by `SOVEREIGN_CONFIG.yaml`.
- **Architecture**: Implemented as a Python FastMCP server with a decoupled logic layer for configuration loading and secret masking.
