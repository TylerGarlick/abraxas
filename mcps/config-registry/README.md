# Sovereign Config Registry MCP Server

**Centralized configuration management for the Abraxas Sovereign Core**

This MCP server provides a standardized API for all skills and MCPs to access configuration parameters from a single source of truth (`SOVEREIGN_CONFIG.yaml`).

## Features

- ✅ **Single Source of Truth** — One YAML file for all configuration
- ✅ **Hot-Reloading** — Changes detected and loaded within 1 second, no restart required
- ✅ **Secret Masking** — Automatic detection and masking of tokens, keys, passwords
- ✅ **Validation** — Zod schema validation on load and reload
- ✅ **Standardized API** — Consistent dot-notation access (`config.get('Soter.RiskThreshold')`)
- ✅ **Audit Trail** — Config file is version-controlled in git

## Installation

```bash
cd /root/.openclaw/workspace/projects/abraxas/mcps/config-registry
npm install
npm run build
```

## Usage

### Start the Server

```bash
npm start
```

The server runs on stdio (standard MCP protocol).

### MCP Tools

#### `config.get`

Fetch a configuration value by dot-notation path.

**Input:**
```json
{
  "path": "Soter.RiskThreshold"
}
```

**Output:**
```json
{
  "value": 3,
  "path": "Soter.RiskThreshold",
  "masked": false
}
```

#### `config.getAll`

Return entire configuration with secrets masked.

**Input:** `{}`

**Output:**
```json
{
  "config": {
    "Core": { ... },
    "Soter": { ... },
    ...
  },
  "maskedKeys": ["Skills.SecretsManager.MasterKeyEnv"],
  "version": 1,
  "lastLoadTime": "2026-04-24T04:46:00.000Z"
}
```

#### `config.getSection`

Return a specific configuration section.

**Input:**
```json
{
  "section": "Soter"
}
```

**Output:**
```json
{
  "section": "Soter",
  "config": {
    "Enabled": true,
    "RiskThreshold": 3,
    ...
  },
  "maskedKeys": [],
  "masked": false
}
```

#### `config.validate`

Validate current configuration against schema.

**Input:** `{}`

**Output:**
```json
{
  "valid": true,
  "errors": [],
  "version": 1
}
```

#### `config.reload`

Force reload configuration from file.

**Input:** `{}`

**Output:**
```json
{
  "success": true,
  "error": null,
  "version": 2,
  "timestamp": "2026-04-24T04:47:00.000Z"
}
```

## Configuration File

The server reads from `/root/.openclaw/workspace/projects/abraxas/SOVEREIGN_CONFIG.yaml`.

### Example Config

```yaml
Core:
  Name: "Abraxas"
  Version: "1.0.0"
  Mode: "sovereign"
  Timezone: "MST"

Soter:
  Enabled: true
  RiskThreshold: 3
  PatternLibrary: "default"
  LedgerPath: "~/.abraxas/soter/safety-ledger.jsonl"
  HumanReviewRequired: true

Ethos:
  Enabled: true
  DriftThreshold: 30
  VoiceProfile: "tyler-authentic"
  RestoreOnDrift: true

Aletheia:
  Enabled: true
  LedgerPath: "~/.abraxas/aletheia/truth-ledger.jsonl"
  ClaimVerification: "strict"
  CalibrationReviewDays: 90

Ergon:
  Gate:
    Enabled: true
    InterceptTools: true
    LogAllRequests: true
  Routing:
    DefaultTarget: "main"
    FallbackTarget: "fallback"

Infrastructure:
  Paths:
    Workspace: "/root/.openclaw/workspace"
    Projects: "/root/.openclaw/workspace/projects"
    Skills: "/root/.openclaw/workspace/skills"
    Mcps: "/root/.openclaw/workspace/projects/abraxas/mcps"
  Timeouts:
    MCPRequest: 30
    ToolExecution: 300
    Subagent: 900
  Limits:
    MaxConcurrentSubagents: 10
    MaxHeartbeatsPerDay: 48
    MaxConfigGetsPerMinute: 100

Skills:
  Gmail:
    Enabled: true
    CheckInterval: 1800
    MaxFetch: 50
  ImageGen:
    Enabled: true
    DefaultPreset: "portrait"
    MaxBatchSize: 10
  SecretsManager:
    Enabled: true
    MasterKeyEnv: "MJ_MASTER_KEY"
    StorePath: "~/.openclaw/workspace/secrets"

Logging:
  Level: "info"
  Format: "json"
  Output: "file"
  Path: "~/.abraxas/logs/abraxas.log"
```

## Client Library Usage

### TypeScript/JavaScript

```typescript
import { ConfigClient } from './config-client'

const config = new ConfigClient()

// Get a single value
const riskThreshold = await config.get('Soter.RiskThreshold')
console.log(`Risk threshold: ${riskThreshold}`)

// Get a section
const soterConfig = await config.getSection('Soter')
console.log(`Soter enabled: ${soterConfig.Enabled}`)

// Get all (masked)
const allConfig = await config.getAll()
console.log(`Config keys: ${Object.keys(allConfig.config)}`)

// Validate config
const validation = await config.validate()
if (!validation.valid) {
  console.error('Config validation failed:', validation.errors)
}

// Force reload
const reload = await config.reload()
console.log(`Config reloaded: ${reload.success}`)
```

### Python (via MCP)

```python
from mcp import ClientSession

async def get_config(session: ClientSession, path: str):
    result = await session.call_tool('config.get', {'path': path})
    return json.loads(result.content[0].text)['value']

# Usage
risk_threshold = await get_config(session, 'Soter.RiskThreshold')
print(f'Risk threshold: {risk_threshold}')
```

### Bash (via MCP CLI)

```bash
#!/bin/bash

# Get config value
RISK_THRESHOLD=$(openclaw mcp call config-registry config.get --path Soter.RiskThreshold)
echo "Risk threshold: $RISK_THRESHOLD"

# Validate config
openclaw mcp call config-registry config.validate

# Force reload
openclaw mcp call config-registry config.reload
```

## Hot-Reloading

The server watches `SOVEREIGN_CONFIG.yaml` for changes:

1. File is modified (e.g., git pull, manual edit)
2. Server detects change within 1 second
3. New config is loaded and validated
4. If valid: cache updated, all subsequent calls return new values
5. If invalid: error logged, old config retained

No server restart required!

## Secret Masking

The server automatically masks sensitive values:

- Keys containing: `token`, `secret`, `key`, `password`, `credential`, `auth`
- Values matching patterns: Base64 strings, API key formats, long alphanumeric strings

Masked values appear as `'[MASKED]'` in `config.getAll()` and `config.getSection()` outputs.

### Example

```yaml
Skills:
  SecretsManager:
    MasterKeyEnv: "MJ_MASTER_KEY"  # ← Will be masked
    StorePath: "~/.openclaw/workspace/secrets"  # ← Not masked
```

```json
{
  "config": {
    "Skills": {
      "SecretsManager": {
        "MasterKeyEnv": "[MASKED]",
        "StorePath": "~/.openclaw/workspace/secrets"
      }
    }
  },
  "maskedKeys": ["Skills.SecretsManager.MasterKeyEnv"]
}
```

## Validation

Config is validated against Zod schemas on:

- Initial load
- Hot-reload
- `config.validate()` tool call

### Validation Errors

```json
{
  "valid": false,
  "errors": [
    "Soter.RiskThreshold: Soter.RiskThreshold must be 0-5",
    "Core.Mode: Core.Mode must be \"sovereign\" or \"simulation\""
  ]
}
```

## Testing

```bash
npm test
```

### Test Coverage

- Config loader (load, reload, validation)
- Secret masker (pattern detection, deep masking)
- MCP tools (all 5 tools)
- Hot-reload functionality

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              SOVEREIGN_CONFIG.yaml                      │
│              (Single Source of Truth)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ File Watcher (1s poll)
                          ▼
┌─────────────────────────────────────────────────────────┐
│           Config Registry MCP Server                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Config       │  │ Secret       │  │ MCP Tools    │ │
│  │ Loader       │  │ Masker       │  │              │ │
│  │              │  │              │  │ - get        │ │
│  │ - YAML load  │  │ - Pattern    │ │ - getAll     │ │
│  │ - Validate   │  │ - Deep mask  │ │ - getSection │ │
│  │ - Cache      │  │ - Audit      │ │ - validate   │ │
│  └──────────────┘  └──────────────┘  │ - reload     │ │
│                                      └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ MCP Protocol (stdio)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Consumer Skills/MCPs                       │
│  - Soter, Ethos, Aletheia, Ergon                        │
│  - All custom skills                                    │
│  - External MCP servers                                 │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Config Not Loading

```bash
# Check file exists
ls -la /root/.openclaw/workspace/projects/abraxas/SOVEREIGN_CONFIG.yaml

# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('SOVEREIGN_CONFIG.yaml'))"

# Check server logs
journalctl -u config-registry -f
```

### Hot-Reload Not Working

```bash
# Check file permissions
ls -la SOVEREIGN_CONFIG.yaml

# Verify file watcher is running
# Look for "[ConfigRegistry] File watcher started" in logs
```

### Secret Masking Too Aggressive

Edit `src/secret-masker.ts` and adjust `SENSITIVE_PATTERNS` array.

### Validation Errors

Run `config.validate()` to see specific errors. Common issues:

- Missing required fields
- Invalid enum values (check allowed values in spec)
- Wrong types (string vs number vs boolean)

## Contributing

1. Read `SCR_SPEC.md` for full specification
2. Make changes to source files
3. Run tests: `npm test`
4. Update documentation
5. Commit with clear message

## License

MIT — Abraxas Sovereign Core
