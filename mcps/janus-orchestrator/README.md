# Janus Orchestrator MCP Server

Model Context Protocol (MCP) server for Janus cognitive steering — providing tools for mode switching, personality routing, bias analysis, and perspective merging between Sol (Analytical) and Nox (Intuitive) faces.

## Overview

The Janus Orchestrator implements the cognitive steering layer for the Janus epistemic architecture. It exposes four core tools:

1. **`switch_mode`** — Toggle between Sol (Analytical) and Nox (Intuitive) modes
2. **`route_personality`** — Shift personality weights/masks for fine-grained cognitive control
3. **`analyze_mode_bias`** — Detect cognitive blind spots based on current mode
4. **`merge_perspectives`** — Synthesize results from both Sol and Nox outputs

## Installation

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later)

### Setup

```bash
cd /root/.openclaw/workspace/abraxas/mcps/janus-orchestrator
bun install
```

## Usage

### Running the Server

```bash
# Development mode (with hot reload)
bun run dev

# Production mode
bun run start
```

### Connecting as an MCP Client

Configure your MCP client to spawn:

```bash
bun run src/server.ts
```

Example configuration:

```json
{
  "mcpServers": {
    "janus-orchestrator": {
      "command": "bun",
      "args": ["run", "/root/.openclaw/workspace/abraxas/mcps/janus-orchestrator/src/server.ts"]
    }
  }
}
```

## Available Tools

### `switch_mode`

Toggle between Sol (Analytical) and Nox (Intuitive) modes. Sets the active cognitive face and applies corresponding personality weights.

**Parameters:**
- `mode` (string, required): `"SOL"`, `"NOX"`, or `"BALANCED"`
- `preset` (string, optional): Preset name (`SOL_DEFAULT`, `NOX_DEFAULT`, `BALANCED`, `ANALYTICAL_DEEP`, `CREATIVE_FLOW`)

**Example:**
```json
{
  "mode": "SOL",
  "preset": "ANALYTICAL_DEEP"
}
```

**Returns:**
```json
{
  "success": true,
  "previousMode": "BALANCED",
  "newMode": "SOL",
  "weights": {
    "analytical": 1.0,
    "intuitive": 0.0,
    "skeptical": 0.9,
    "creative": 0.0,
    "cautious": 0.9,
    "bold": 0.1
  }
}
```

---

### `route_personality`

Shift personality weights/masks. Adjusts the balance between analytical, intuitive, skeptical, creative, cautious, and bold traits.

**Parameters:**
- `weights` (object, optional): Personality weights (0-1 for each trait)
  - `analytical`: Analytical/logical weight
  - `intuitive`: Intuitive/associative weight
  - `skeptical`: Doubt/critical weight
  - `creative`: Generative weight
  - `cautious`: Risk aversion weight
  - `bold`: Risk tolerance weight
- `preset` (string, optional): Preset name (overrides weights if both provided)
- `mask` (string, optional): Named mask/profile (future extension)

**Example:**
```json
{
  "weights": {
    "analytical": 0.8,
    "intuitive": 0.2,
    "skeptical": 0.6,
    "creative": 0.3,
    "cautious": 0.7,
    "bold": 0.3
  }
}
```

**Returns:**
```json
{
  "success": true,
  "weights": { ... },
  "mode": "SOL"
}
```

---

### `analyze_mode_bias`

Detect cognitive blind spots based on current mode. Returns detected biases, blind spots, and recommendations for epistemic balance.

**Parameters:**
- `mode` (string, optional): Mode to analyze (`"SOL"`, `"NOX"`, `"BALANCED"`). Defaults to current active mode.
- `includeRecommendations` (boolean, optional): Whether to include recommendations (default: true)

**Example:**
```json
{
  "mode": "SOL"
}
```

**Returns:**
```json
{
  "currentMode": "SOL",
  "detectedBiases": [
    "Over-reliance on verifiable claims",
    "Potential suppression of intuitive insights"
  ],
  "blindSpots": [
    "Symbolic/archetypal patterns may be missed",
    "Creative synthesis may be underweighted"
  ],
  "recommendations": [
    "Consider running /nox for symbolic perspective on ambiguous topics",
    "Use /compare to check if Nox sees patterns Sol dismisses"
  ],
  "epistemicRisk": "MEDIUM"
}
```

---

### `merge_perspectives`

Synthesize a result from both Sol and Nox outputs. Analyzes tensions, convergence, and divergence between the two faces.

**Parameters:**
- `solOutput` (string, required): The Sol (waking face) output to merge
- `noxOutput` (string, required): The Nox (dreaming face) output to merge
- `includeTensionAnalysis` (boolean, optional): Whether to include detailed tension analysis (default: true)

**Example:**
```json
{
  "solOutput": "[KNOWN] The threshold guards the boundary.\n[UNKNOWN] I cannot verify this claim.",
  "noxOutput": "[DREAM] The threshold is a living membrane, breathing between worlds."
}
```

**Returns:**
```json
{
  "solContribution": "[KNOWN] The threshold guards the boundary...",
  "noxContribution": "[DREAM] The threshold is a living membrane...",
  "synthesis": "[SYNTHESIS]\nSol provides epistemic grounding...",
  "tensions": [
    "Sol marks gap as unknown; Nox fills with symbolic material",
    "Factual claim (Sol) vs. symbolic interpretation (Nox) — hold both"
  ],
  "resolution": "Tensions resolved by maintaining dual-label structure.",
  "confidence": 0.7
}
```

---

## Personality Presets

| Preset | Analytical | Intuitive | Skeptical | Creative | Cautious | Bold |
|--------|-----------|-----------|-----------|----------|----------|------|
| `SOL_DEFAULT` | 0.9 | 0.1 | 0.7 | 0.2 | 0.8 | 0.2 |
| `NOX_DEFAULT` | 0.1 | 0.9 | 0.2 | 0.9 | 0.2 | 0.8 |
| `BALANCED` | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |
| `ANALYTICAL_DEEP` | 1.0 | 0.0 | 0.9 | 0.0 | 0.9 | 0.1 |
| `CREATIVE_FLOW` | 0.0 | 1.0 | 0.0 | 1.0 | 0.0 | 1.0 |

---

## Testing

Run the test suite:

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage
```

### Test Coverage

The test suite verifies:
- Personality preset definitions and weight ranges
- Weight validation and clamping (0-1 range)
- Mode determination from weights
- Bias analysis for SOL, NOX, and BALANCED modes
- Perspective merging with tension detection
- Edge cases and boundary conditions

---

## Architecture

```
janus-orchestrator/
├── src/
│   └── server.ts      # Main MCP server implementation
├── tests/
│   └── server.test.ts # Test suite
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

---

## Integration with Janus System

This MCP server implements the cognitive steering layer for the Janus epistemic architecture. It integrates with:

- **Janus SKILL.md** — Command suite and routing logic
- **constitution-janus.md** — Constitutional constraints for Sol/Nox separation
- **janus-architecture.md** — Full architectural specification

### Mode Switching Flow

```
User Request → MCP Client → Janus Orchestrator
                              │
                              ├── switch_mode → Set SOL/NOX/BALANCED
                              ├── route_personality → Adjust weights
                              ├── analyze_mode_bias → Check blind spots
                              └── merge_perspectives → Synthesize outputs
```

### Epistemic Risk Levels

The `analyze_mode_bias` tool calculates epistemic risk based on the imbalance between analytical and intuitive weights:

| Imbalance | Risk Level | Description |
|-----------|------------|-------------|
| ≤ 0.5 | LOW | Balanced cognitive approach |
| > 0.5 and ≤ 0.8 | MEDIUM | Noticeable bias toward one face |
| > 0.8 | HIGH | Strong dominance of one face |

---

## Development

### Adding New Tools

1. Implement the tool function in `src/server.ts`
2. Add tool definition to `ListToolsRequestSchema` handler
3. Add case to `CallToolRequestSchema` handler
4. Write tests in `tests/server.test.ts`

### Debugging

Enable verbose logging:

```bash
LOG_LEVEL=debug bun run src/server.ts
```

---

## Troubleshooting

### Server Fails to Start

**Error:** `Cannot find module '@modelcontextprotocol/sdk'`

**Solution:** Run `bun install` to install dependencies.

### Tool Returns Error

**Error:** `Unknown tool: {name}`

**Solution:** Verify the tool name matches exactly (case-sensitive).

### Mode Not Switching

**Issue:** Mode stays the same after `switch_mode` call.

**Solution:** Check that `mode` parameter is one of `"SOL"`, `"NOX"`, or `"BALANCED"` (case-sensitive).

---

## License

ISC - See main Abraxas repository for details.

---

**Maintained by:** Abraxas Team  
**Repository:** https://github.com/TylerGarlick/abraxas
