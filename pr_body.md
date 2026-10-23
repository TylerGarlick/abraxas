Implements Issue #66: Hardening: Internal Chaos Signal (Auto-Rupture).

### Changes
- **Meta-Monitor**: Added `analyzeChaosSignal` to detect token-entropy velocity and structural attractors.
- **Auto-Rupture**: Implemented `ChaosCoordinator` to maintain entropy history and automatically trigger `InternalRupture()` upon seizure detection.
- **Hardened Rupture**: Updated `triggerInternalRupture` with a critical, high-valence instruction to shatter latent attractors.
- **Tooling**: Added `soter_monitor_chaos` tool to the Soter suite for explicit entropy monitoring.
- **Verification**: Added comprehensive unit tests and E2E stream tests to verify seizure detection and rupture triggering.

### Verification Results
- `tests/chaos.test.ts`: PASS
- `tests/chaos_e2e.test.ts`: PASS
