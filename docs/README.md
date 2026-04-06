# Abraxas Documentation

**Organized:** April 2026

---

## Folder Structure

```
docs/
├── overview/        # Main documentation (whitepaper, architecture, index)
├── systems/         # System-specific documentation
├── api/             # API documentation
├── testing/         # Testing documentation
├── design/          # Design documentation
└── deployment/      # Deployment guides
```

---

## File Index

### overview/ — Main Documentation

| File | Description |
|------|-------------|
| `index.md` | Abraxas overview and quick start |
| `whitepaper.md` | **MAIN WHITEPAPER** — Epistemic verification architecture (April 2026) |
| `architecture.md` | System architecture details |

### systems/ — System Documentation

| File | System | Description |
|------|--------|-------------|
| `skills.md` | All | Command reference for all systems |
| `honest-integration.md` | Honest | Anti-hallucination interface |
| `logos-parser.md` | Logos | Claim decomposition engine |
| `mnemosyne.md` | Mnemosyne | Cross-session memory |
| `skill-relationships.md` | All | How systems work together |

### api/ — API Documentation

| File | Description |
|------|-------------|
| `abraxas-api-architecture.md` | REST API design and endpoints |

### testing/ — Testing Documentation

| File | Description |
|------|-------------|
| `testing.md` | Testing methodology and strategy |
| `VERIFICATION.md` | Verification protocols |
| `five-model-evaluation.md` | Multi-model evaluation results |

### design/ — Design Documentation

| File | Description |
|------|-------------|
| `visual-design.md` | Visual design guidelines |
| `composition-patterns.md` | Architectural composition patterns |

### deployment/ — Deployment Guides

| File | Description |
|------|-------------|
| `website.md` | Website deployment |
| `ollama-model.md` | Ollama deployment |
| `frames.md` | Session frame management |

---

## Quick Start

### New Users

1. Start with `overview/index.md` — what Abraxas is
2. Read `overview/whitepaper.md` — full architecture
3. Use `systems/skills.md` — command reference

### Developers

1. Read `overview/architecture.md` — system design
2. Check `api/abraxas-api-architecture.md` — API docs
3. See `testing/testing.md` — how to test

### Deployers

1. See `deployment/ollama-model.md` — Ollama setup
2. See `deployment/website.md` — web deployment
3. See `deployment/frames.md` — session configuration

---

## Related Directories

- **`/research/`** — Research papers, proposals, comparisons
- **`/skills/`** — Implemented system code
- **`/demos/interactive/`** — Web demo

---

## Git Status

All files tracked in main branch: https://github.com/TylerGarlick/abraxas

_Last updated: 2026-04-06_
