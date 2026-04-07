# Abraxas Logos - MCP Server

Verification layer for atomic propositions. Integrates Pheme (fact-checking) and Janus (epistemic labeling).

## Overview

The Logos verification layer sits between the Claim Parser (Task 100.1) and the Confidence Engine (Task 100.3). It:

1. **Receives** atomic propositions from the Claim Parser
2. **Classifies** each atom type (factual, inferential, value)
3. **Verifies** factual atoms against Pheme (fact-checking API)
4. **Labels** each atom with Janus epistemic labels
5. **Passes** verified atoms to the Confidence Engine

## Installation

```bash
cd mcp-servers/abraxas-logos
bun install
```

## Usage

### Start the server

```bash
bun start
# or for development with hot reload
bun dev
```

### Available Tools

| Tool | Description |
|:---|:---|
| `logos_verify` | Verify multiple atoms |
| `logos_verify_single` | Verify a single atom |
| `logos_verify_fallback` | Verify with fallback on error |
| `logos_history` | Get verification history |
| `logos_clear_cache` | Clear verification cache |
| `logos_status` | Get system status |
| `logos_pipeline` | Full pipeline for confidence engine |

## Integration Points

### Pheme (Fact-Checking)

Verifies factual claims against authoritative sources:

- **VERIFIED**: Multiple sources confirm the claim
- **CONTRADICTED**: Sources contradict the claim
- **UNVERIFIABLE**: No sources available for verification

### Janus (Epistemic Labeling)

Applies confidence labels to each atom:

- **[KNOWN]**: Verified by sources, high confidence
- **[INFERRED]**: Derived through reasoning
- **[UNCERTAIN]**: Could not verify
- **[UNKNOWN]**: Contradicted or cannot know

## Pipeline Flow

```
Task 100.1 (Claim Parser)
         │
         ▼
    Atomic Atoms
         │
         ▼
┌─────────────────────┐
│  Logos Verification │
│  ─────────────────  │
│  1. Classify atom   │
│  2. Pheme verify    │
│  3. Janus label     │
│  4. Combine results │
└─────────────────────┘
         │
         ▼
   Verified Atoms
         │
         ▼
Task 100.3 (Confidence Engine)
```

## Example

```javascript
// Verify atoms from claim parser
const result = await verify({
  atoms: [
    "The Earth orbits the Sun",
    "Paris is the capital of France",
    "This is a good idea"
  ]
});

// Results include:
// - atomType: 'factual', 'inferential', or 'value'
// - verification: { status, sources, confidence }
// - epistemic: { label, reasoning, confidence }
// - combinedLabel: "[KNOWN][VERIFIED]" etc.
```

## Configuration

Storage location: `~/.logos/`

```
~/.logos/
├── verifications.json   # Verification history
├── cache/               # Cached verification results
└── config.md            # (future) User preferences
```

## Testing

```bash
bun test
bun test:watch
bun test:coverage
```

## Requirements

- Node.js >= 18.0.0
- Bun >= 1.0.0
- Pheme MCP server (for production fact-checking)
- Janus MCP server (for production epistemic labels)

## License

MIT