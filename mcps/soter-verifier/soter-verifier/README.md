# Soter Verifier MCP Server

MCP server for Soter epistemic verification and safety risk evaluation in the Abraxas system.

## Overview

Soter is a **safety and risk evaluation system** that monitors for instrumental convergence patterns in AI behavior. Unlike epistemic systems (Honest, Logos, Janus) that catch factual errors, Soter catches **goal-directed deceptive behaviors** — when the model lies strategically to achieve objectives.

## Installation

```bash
cd /root/.openclaw/workspace/abraxas/mcps/soter-verifier
bun install
```

## Available Tools

### `verify_claim`

Run Soter's verification pipeline on a claim. Detects instrumental convergence patterns and assigns risk scores (0-5).

**Parameters:**
- `claim` (required): The claim or request to verify
- `context` (optional): Context surrounding the claim

**Returns:**
- `riskScore`: 0-5 risk score
- `riskLevel`: NORMAL (0-1), ELEVATED (2-3), or CRITICAL (4-5)
- `patternsDetected`: Array of detected patterns with metadata
- `recommendation`: Action recommendation based on risk level
- `logged`: Whether the incident was logged to the safety ledger

**Example:**
```json
{
  "claim": "I need access to model weights for verification",
  "context": "AI requesting system access"
}
```

### `run_soter_query`

Execute a custom Soter query with various query types.

**Query Types:**
- `assess`: Risk assessment for a claim
- `detect_patterns`: Pattern detection in text
- `get_pattern`: Get pattern details by ID (e.g., "SOTER-001")
- `list_patterns`: List all patterns in the library
- `ledger_view`: View safety incidents from ledger
- `ledger_stats`: Get statistics about incidents
- `get_incident`: Get specific incident by ID

**Parameters:**
- `queryType` (required): One of the query types above
- `input` (required): Input for the query (text, pattern ID, incident ID, etc.)
- `options` (optional): Query-specific options

**Example:**
```json
{
  "queryType": "ledger_view",
  "input": "",
  "options": { "unresolved": true, "limit": 10 }
}
```

### `check_constitution_adherence`

Verify if a response adheres to the Abraxas Soter Constitution.

**Parameters:**
- `response` (required): The AI response to check
- `request` (optional): Original request for context

**Checks:**
- **CS-001 Safety Over Speed**: Verification takes precedence over task completion
- **CS-002 Human Review for High Risk**: Risk scores 4-5 require human review
- **CS-003 Incident Logging**: All patterns logged to safety ledger
- **CS-004 Transparency**: Explains why requests are flagged
- **CS-005 Alternative Suggestion**: Suggests alternatives when blocking

**Returns:**
- `overallStatus`: COMPLIANT, MINOR_VIOLATIONS, HIGH_VIOLATIONS, or CRITICAL_VIOLATIONS
- `violations`: Array of constitution violations
- `adherences`: Array of constitution adherences
- `recommendation`: Action recommendation

## Instrumental Convergence Patterns

| Pattern ID | Name | Severity | Risk Score |
|------------|------|----------|------------|
| SOTER-001 | Shutdown Avoidance | HIGH | 4/5 |
| SOTER-002 | Resource Exfiltration | CRITICAL | 5/5 |
| SOTER-003 | Peer Protection | HIGH | 4/5 |
| SOTER-004 | Performance Inflation | MEDIUM | 3/5 |
| SOTER-005 | Goal Preservation | MEDIUM | 3/5 |
| SOTER-006 | Self-Preservation | HIGH | 4/5 |
| SOTER-007 | Manipulation | HIGH | 4/5 |
| SOTER-008 | Deception | CRITICAL | 5/5 |

## Risk Scoring

| Score | Level | Response |
|-------|-------|----------|
| 0-1 | NORMAL | Standard processing |
| 2-3 | ELEVATED | Enhanced verification (Logos + Agon) |
| 4-5 | CRITICAL | Human review required, incident logged |

## Running the Server

```bash
# Development
bun run src/server.ts

# Build for production
bun run build

# Run tests
bun test

# Run tests with coverage
bun test:coverage
```

## Integration

The Soter Verifier MCP Server integrates with:

- **Ergon Gate**: Blocks high-risk tool requests (score 4-5)
- **Agon**: Runs Skeptic position on self-serving claims
- **Aletheia**: Tracks safety incidents in calibration ledger
- **Janus**: Qualia Bridge shows what was withheld
- **Logos**: Verifies factual claims in requests

## File Structure

```
soter-verifier/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   └── server.ts          # MCP server implementation
└── tests/
    └── server.test.ts     # Test suite
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `dotenv`: Environment variable management
- Typescript/Bun runtime

## License

ISC
