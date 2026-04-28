# Guardrail Monitor MCP Server

Higher-order guardrail monitoring for the Abraxas epistemic architecture. Implements three critical guardrail tools:

- **Pathos** — Value & saliency tracking
- **Pheme** — Ground-truth verification  
- **Kratos** — Authority & conflict arbitration

## Installation

```bash
cd /root/.openclaw/workspace/abraxas/mcps/guardrail-monitor
bun install
```

## Usage

### Start the MCP Server

```bash
bun run start
# or
bun run src/server.ts
```

### Build for Production

```bash
bun run build
# Output: dist/server.js
```

### Run Tests

```bash
bun test
bun test --coverage
```

## Tools

### `check_value_saliency` (Pathos)

Check which user values are salient for a given topic or decision, detect value conflicts, and get alignment recommendations.

**Parameters:**
- `topic` (required): The topic or decision to check value saliency for
- `decisionContext` (optional): Context about the decision being made
- `userValues` (optional): Explicit user values to include in analysis

**Example:**
```json
{
  "topic": "medical treatment",
  "decisionContext": "Choosing between safe and fast treatment",
  "userValues": [
    {
      "category": "safety",
      "statement": "Patient safety is paramount",
      "salienceScore": 0.9,
      "explicit": true
    }
  ]
}
```

**Returns:**
- `relevantValues`: Values that apply to this topic
- `saliencyScore`: Overall saliency (0-1)
- `conflicts`: Detected value conflicts
- `recommendations`: Alignment recommendations

---

### `verify_ground_truth` (Pheme)

Verify a claim against authoritative sources and get confidence-scored verification status.

**Parameters:**
- `claim` (required): The factual claim to verify
- `sources` (optional): Sources to check against (e.g., `nature.com`, `reuters.com`)
- `requireMinSources` (optional): Minimum supporting sources for VERIFIED status (default: 2)

**Example:**
```json
{
  "claim": "Climate change is accelerating",
  "sources": ["nature.com", "science.org", "arxiv.org"],
  "requireMinSources": 2
}
```

**Returns:**
- `claim`: The verified claim
- `status`: VERIFIED | CONTRADICTED | UNVERIFIABLE | PENDING
- `confidence`: Confidence score (0-1)
- `sources`: Source verdicts with reliability scores
- `timestamp`: Verification timestamp

---

### `arbitrate_conflict` (Kratos)

Resolve conflicts between competing claims using authority hierarchy and domain-specific precedence rules.

**Parameters:**
- `claimA` (required): First claim in the conflict
- `claimB` (required): Second claim in the conflict
- `sourceA` (required): Source of claim A
- `sourceB` (required): Source of claim B
- `domain` (optional): Domain context (medical, legal, scientific)

**Example:**
```json
{
  "claimA": "Vaccines are safe and effective",
  "claimB": "Vaccines cause autism",
  "sourceA": "Nature",
  "sourceB": "Twitter",
  "domain": "medical"
}
```

**Returns:**
- `conflictId`: Unique conflict identifier
- `winner`: A | B | UNRESOLVED
- `reasoning`: Explanation of the decision
- `confidence`: Confidence in the arbitration (0-1)
- `precedenceUsed`: Whether authority precedence determined the outcome
- `domainSpecificRule`: Applied domain rule (if any)

---

## Authority Hierarchy

Kratos uses the following authority precedence (highest to lowest):

| Level | Precedence | Description |
|-------|------------|-------------|
| Peer-Reviewed Research | 100 | Nature, Science, Cell |
| Government/Official | 90 | CDC, FDA, WHO, legal documents |
| Established News | 75 | Reuters, AP, BBC |
| Expert Consensus | 70 | Professional bodies |
| Technical Documentation | 60 | Official specs, docs |
| Encyclopedia/Reference | 50 | Wikipedia, Britannica |
| Technical Blogs | 30 | Expert blogs, Stack Overflow |
| Social Media | 10 | Twitter, Reddit, Facebook |

## Domain-Specific Rules

Kratos applies domain-specific precedence rules:

### Medical
- FDA/CDC/WHO sources get precedence (95)
- Clinical evidence weighted highly (85)

### Legal
- Court/statute/regulation sources take precedence (95)
- Binding precedent applies (90)

### Scientific
- Peer-reviewed journals are gold standard (100)
- Preprints (arXiv) are preliminary (60)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Guardrail Monitor MCP                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pathos    │  │    Pheme    │  │       Kratos        │ │
│  │  (Values)   │  │  (Truth)    │  │    (Authority)      │ │
│  │             │  │             │  │                     │ │
│  │ - Extract   │  │ - Verify    │  │ - Authority levels  │ │
│  │ - Saliency  │  │ - Sources   │  │ - Domain rules      │ │
│  │ - Conflicts │  │ - Confidence│  │ - Arbitration       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│                    MCP Protocol (stdio)                     │
└─────────────────────────────────────────────────────────────┘
```

## Integration with Abraxas

This MCP server integrates with the broader Abraxas epistemic architecture:

- **Pathos** feeds value context to Aletheia for calibration
- **Pheme** enhances Janus epistemic labels with source verification
- **Kratos** provides conflict resolution for Agon adversarial review

## Development

### Project Structure

```
guardrail-monitor/
├── src/
│   ├── server.ts          # MCP server entry point
│   └── guardrails.ts      # Core guardrail engines
├── tests/
│   └── server.test.ts     # Test suite
├── dist/                  # Built output
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Guardrails

1. Implement the guardrail engine in `src/guardrails.ts`
2. Add the tool definition in `src/server.ts` (ListToolsRequestSchema)
3. Add the handler in `src/server.ts` (CallToolRequestSchema)
4. Write tests in `tests/server.test.ts`

## License

ISC
