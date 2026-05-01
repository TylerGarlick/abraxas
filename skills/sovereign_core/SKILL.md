---
name: sovereign-core
description: "The core governance and system integrity layer of the Abraxas sovereign environment."
---

# Sovereign Core Skill

Sovereign Core is the fundamental management layer responsible for system integrity, configuration persistence, and the secure application of system patches. It ensures the Abraxas environment remains stable, up-to-date, and verifiable.

## Core Responsibilities

Sovereign Core provides the mechanisms to safely evolve the system state without compromising its foundational integrity.

## Commands

### `sovereign_patcher`
Applies vetted updates (patches) to the system.
- **Arguments**: `patchId` (required), `validateOnly` (defaults to false), `force` (defaults to false).
- **Behavior**:
    - Validates the patch signature and dependencies.
    - If `validateOnly` is true, it confirms the patch is applicable without modifying the system.
    - Otherwise, it applies the patch and creates a rollback point.

### `config_management`
A centralized hub for reading and writing system-level configuration.
- **Arguments**: `action` (required: `get`, `set`, `list`, `validate`, `reset`), `key`, `value`, `section`.
- **Behavior**:
    - `get`: Retrieves a specific value by key.
    - `set`: Updates a configuration value.
    - `list`: Returns all settings, optionally filtered by a section prefix.
    - `validate`: Verifies the current configuration for errors.
    - `reset`: Reverts settings to a known-good baseline.

### `system_state_audit`
Performs a comprehensive verification of the current system health and versioning.
- **Arguments**: `checkType` (defaults to `full`: `full`, `version`, `config`, `integrity`, `dependencies`), `verbose`.
- **Behavior**: Checks version alignment, configuration validity, file integrity, and dependency health.

### `health_check`
Reports on the immediate operational status of the Sovereign Core.
- **Arguments**: `detailed` (defaults to false).
- **Behavior**: Returns uptime and status. Detailed mode includes memory metrics and tool operationality.

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ SovereignCoreLogic).
- **State**: Managed via an internal configuration store and system timers.
- **Dependencies**: Uses `psutil` for resource monitoring.
