# Mnemosyne Memory MCP Server

MCP-compliant semantic memory server for Abraxas — provides long-term memory storage, semantic search, synthesis, and knowledge base management.

## Overview

This MCP server implements the Mnemosyne memory layer with three core tools:

1. **`semantic_retrieve`** — Semantic search across memory fragments
2. **`synthesize_memory`** — Create synthesized summaries from multiple fragments
3. **`update_knowledge_base`** — Inject verified knowledge into the memory layer

## Installation

```bash
cd /root/.openclaw/workspace/abraxas/mcps/mnemosyne-memory
bun install
```

## Usage

### Start the Server

```bash
bun run src/server.ts
```

### Tools

#### `semantic_retrieve`

Perform semantic search across long-term memory fragments.

**Parameters:**
- `query` (required): Search query for semantic matching
- `limit` (optional, default: 10): Maximum results to return
- `minScore` (optional, default: 0.1): Minimum similarity score threshold (0-1)
- `tags` (optional): Filter by tags

**Example:**
```json
{
  "name": "semantic_retrieve",
  "arguments": {
    "query": "quantum computing algorithms",
    "limit": 5,
    "minScore": 0.3,
    "tags": ["research", "quantum"]
  }
}
```

#### `synthesize_memory`

Create a synthesized summary from multiple memory fragments.

**Parameters:**
- `fragmentIds` (required): List of memory fragment IDs to synthesize
- `query` (optional): Query context for the synthesis
- `themes` (optional): Themes to check for coverage

**Example:**
```json
{
  "name": "synthesize_memory",
  "arguments": {
    "fragmentIds": ["frag-20260421-abc123", "frag-20260421-def456"],
    "query": "Research summary on quantum computing",
    "themes": ["algorithms", "error correction"]
  }
}
```

#### `update_knowledge_base`

Inject new verified knowledge into the memory layer.

**Parameters:**
- `title` (required): Title of the knowledge entry
- `content` (required): Content of the knowledge entry
- `verified` (optional, default: false): Whether this knowledge is verified
- `source` (optional, default: "manual"): Source of this knowledge
- `tags` (optional): Tags for categorization
- `relatedFragmentIds` (optional): Related memory fragment IDs

**Example:**
```json
{
  "name": "update_knowledge_base",
  "arguments": {
    "title": "Quantum Error Correction Methods",
    "content": "Summary of error correction techniques...",
    "verified": true,
    "source": "synthesis",
    "tags": ["quantum", "error-correction"],
    "relatedFragmentIds": ["frag-20260421-abc123"]
  }
}
```

## Storage Architecture

Data is stored in `~/.abraxas/mnemosyne/`:

```
~/.abraxas/mnemosyne/
├── semantic-index.json    # Master index of all fragments and knowledge
├── memory/                # Memory fragments
│   └── frag-YYYYMMDD-xxxx.json
└── knowledge-base/        # Verified knowledge entries
    └── kb-YYYYMMDD-xxxx.json
```

### Memory Fragment Schema

```json
{
  "id": "frag-20260421-abc123",
  "content": "Memory content...",
  "embedding": [0.1, 0.2, ...],
  "metadata": {
    "created": "2026-04-21T00:00:00Z",
    "modified": "2026-04-21T00:00:00Z",
    "source": "manual|synthesis|import",
    "tags": ["tag1", "tag2"],
    "confidence": 0.9
  },
  "links": ["other-fragment-ids"]
}
```

### Knowledge Entry Schema

```json
{
  "id": "kb-20260421-xyz789",
  "title": "Knowledge Title",
  "content": "Verified knowledge content...",
  "embedding": [0.1, 0.2, ...],
  "verified": true,
  "metadata": {
    "created": "2026-04-21T00:00:00Z",
    "verifiedAt": "2026-04-21T00:00:00Z",
    "source": "manual|synthesis|import",
    "tags": ["tag1", "tag2"]
  },
  "relatedFragments": ["frag-20260421-abc123"]
}
```

## Testing

```bash
bun test
bun test --coverage
```

## Development

```bash
# Watch mode
bun run dev

# Build
bun build src/server.ts --outdir dist --target node
```

## Embedding Strategy

Currently uses a simple TF-IDF based embedding for semantic similarity. For production use with large datasets, consider upgrading to:

- `fastembed` (ONNX-based, fast)
- `sentence-transformers` (Python, via subprocess)
- Remote embedding API (OpenAI, Cohere, etc.)

## Integration with Abraxas

This server integrates with the broader Abraxas ecosystem:

- **Janus** — Session ledgers can reference memory fragments
- **Mnemon** — Beliefs can be stored as knowledge entries
- **Logos** — Analysis results can be synthesized into memory
- **Kairos** — Decisions can be linked to related fragments

## License

MIT
