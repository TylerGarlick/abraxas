# Boot Protocol Skill

**Version:** 1.0  
**Status:** Phase 5 — Session Boot Protocol  
**Purpose:** Structured session-startup protocol for Abraxas-capable sessions

---

## What It Is

The Boot Protocol Skill provides a structured, repeatable boot sequence for every Abraxas session startup. It replaces manual prompting with a deterministic startup that:

1. Verifies the constitution (genesis.md) is intact
2. Runs infrastructure health checks (DB, MCP, filesystem)
3. Audits constitution files for drift (unauthorized changes)
4. Reports the operational mode (Sovereign vs Simulation)

## When to Invoke

Invoke the boot protocol:

- **At session startup** — always the first action for any Abraxas session
- **After a system reset or restart** — to verify state
- **When commanded explicitly** — e.g., "boot Abraxas", "run the boot protocol", `/boot`
- **Before any constitution changes** — to capture pre-change state
- **After constitution sync** — to verify the sync didn't introduce drift

## The Boot Sequence

The `session-boot.py` script executes four ordered phases:

### Phase 1: Genesis Load
- Verifies `genesis.md` exists and is readable
- Extracts version from genesis metadata (does not load full file)
- Counts all `constitution-*.md` files in the constitution directory
- Counts total defined commands across all systems
- Compares genesis version against last recorded version in manifest

### Phase 2: Health Check
- **ArangoDB**: Checks environment vars (`ARANGO_URL`, `ARANGO_DB`, `ARANGO_USER`, `ARANGO_ROOT_PASSWORD`), performs TCP socket probe
- **MCP Health Endpoint**: Probes `$ABRAXAS_HEALTH_URL` (default: `http://localhost:9901/health`)
- **Filesystem**: Verifies key directories exist and are readable (constitution, skills, project root)
- **System Resources**: Reports Python version, platform, hostname

### Phase 3: Constitution Drift Audit
- Computes SHA-256 hashes for every constitution file and genesis.md
- Compares against a stored manifest at `constitution/.manifest.json`
- Detects: **added** files (new constitutions), **removed** files, **modified** files (hash mismatch)
- Assigns severity: `none`, `info`, `low`, `medium`, `high`, `critical`
- Updates manifest after each run

### Phase 4: Mode Report
- **Sovereign Mode**: DB connected + MCP available + filesystem ok + genesis readable
- **Simulation Mode**: Filesystem ok + genesis readable, but DB or MCP degraded
- **Degraded Mode**: Critical infrastructure missing (no constitution directory, etc.)
- Flags all issues found: missing systems, DB down, drift detected, version changes

## Usage

### Default (quiet summary)
```bash
python3 scripts/session-boot.py
```
- Prints a human-readable summary report
- Exit code 0 = Sovereign, 1 = Simulation, 2 = Degraded

### Verbose
```bash
python3 scripts/session-boot.py --verbose
python3 scripts/session-boot.py -v
```
- Includes full system roster and detailed connectivity info

### JSON output
```bash
python3 scripts/session-boot.py --json
```
- Machine-readable JSON on stdout
- Key fields: `operational_mode`, `status`, `systems.total`, `connectivity.*`, `drift.*`, `issues`

### Verbose JSON
```bash
python3 scripts/session-boot.py -v --json
```
- Includes raw phase data alongside the report

## Response Format

After boot, the agent acknowledges with:

```
[ABRAXAS INITIALIZED — {MODE} MODE]
Systems: {count} loaded · Commands: {total} · Genesis: v{version}
Drift: {drift_summary}
Connectivity: ArangoDB({db_status}) · MCP({mcp_status}) · FS({fs_status})
Issues: {issue_count}
```

## Performance Requirements

- Script runs in under 2 seconds
- Does NOT load genesis.md fully into memory (reads metadata from first 10 lines)
- Uses SHA-256 for fast file hashing with 64KB chunked reads
- Manifest is a lightweight JSON file (< 10KB typical)

## Manifest Format

```json
{
  "genesis_version": "4.4.1",
  "generated_at": "2026-05-15T04:20:00+00:00",
  "generated_by": "session-boot.py",
  "files": {
    "constitution-honest.md": {
      "sha256": "abc123...",
      "modified": "2026-05-02T01:17:07+00:00"
    }
  }
}
```

## Integration Points

| System | Integration |
|--------|-------------|
| **Genesis Load** | Uses `genesis.md` metadata header, does not parse full content |
| **Constitution Index** | Cross-references system count against `constitution-index.md` |
| **Drift Audit** | Hooks into sync script output, detects post-sync changes |
| **Health Check** | Leverages existing `health-check.sh` endpoint logic, `nexus-health-check.py` server probing patterns |
| **Sovereign Boot** | This skill replaces manual `sovereign-boot.js` invocation; more structured, more auditable |

## Red Lines

- Never skip the boot protocol at session startup
- Never assume state — always verify
- If drift is detected, report it before executing any commands
- If in Degraded mode, surface the critical issue immediately

## Related Skills

- `constitution-validator.skill` — semantic validation, query interface, conflict detection
- `sovereign-boot.skill` — legacy boot skill; this protocol supersedes it for structured session startup
- `guardrail.skill` — final auditor, epistemic seal; invoked after boot to validate the session
