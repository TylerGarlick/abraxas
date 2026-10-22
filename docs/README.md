# Abraxas Documentation

**Organized:** April 2026  
**Reorganized:** 2026-05-14
**Last Updated:** 2026-05-14

---

## Folder Structure

```
docs/
├── README.md                      # This file
├── overview/                      # Entry points (whitepaper, architecture, index)
├── architecture/                  # Architecture design documents (source of truth)
├── codex/                         # Sovereign Codex volumes (I-V + Master Index)
├── systems/                       # System-specific documentation
├── reference/                     # Comprehensive reference documents
├── research/                      # Research documentation mirror (index, architecture docs)
│   └── architecture/              # Architecture docs formatted for research audience
├── philosophy/                    # Philosophical foundations
├── api/                           # API documentation
├── testing/                       # Testing methodology and results
├── verification/                  # Sovereignty verification and gauntlet docs
├── design/                        # Visual and composition design docs
├── deployment/                    # Deployment guides
├── plans/                         # Version roadmaps (v4.1 → v4.5)
├── manual/                        # Manuals and examples
├── case-studies/                  # Task case studies
├── history/                       # Changelogs
└── website/                       # Website style guide
```

---

## Quick Start

### New Users
1. Start with [`overview/index.md`](overview/index.md) — what Abraxas is
2. Read [`reference/sovereign-brain-reference.md`](reference/sovereign-brain-reference.md) — comprehensive architecture
3. See [`research/INDEX.md`](research/INDEX.md) — research documentation index
4. See [`systems/skills.md`](systems/skills.md) — command reference

### Researchers
1. Read [`research/INDEX.md`](research/INDEX.md) — full research documentation map
2. Read [`reference/sovereign-brain-reference.md`](reference/sovereign-brain-reference.md) — complete architecture overview
3. Read [`research/architecture/`](research/architecture/) — architecture docs with research focus
4. See [`../research/reports/`](../research/reports/) — empirical reports and evaluations
5. See [`testing/testing.md`](testing/testing.md) — testing methodology

### Developers
1. Read [`overview/architecture.md`](overview/architecture.md) — system design
2. Read [`architecture/`](architecture/) — detailed architecture specs
3. Check [`api/abraxas-api-architecture.md`](api/abraxas-api-architecture.md) — API docs
4. See [`systems/skill-relationships.md`](systems/skill-relationships.md) — integration patterns
5. See [`../skills/`](../skills/) — implemented system code

### Deployers
1. See [`deployment/ollama-model.md`](deployment/ollama-model.md) — Ollama setup
2. See [`deployment/website.md`](deployment/website.md) — web deployment
3. See [`deployment/frames.md`](deployment/frames.md) — session configuration
4. Review [`plans/4.5.md`](plans/4.5.md) — current implementation roadmap

---

## Key Cross-References

| Content | Primary Location | Research Copy |
|---------|-----------------|---------------|
| Architecture docs | `docs/architecture/` | `docs/research/architecture/` |
| Sovereign Brain reference | `docs/reference/sovereign-brain-reference.md` | `docs/research/sovereign-brain-reference.md` |
| Research paper v4 | `research/papers/research-paper-v4.md` | — |
| Codex volumes | `docs/codex/` | — |
| Reports | `research/reports/` | — |
| Benchmarks | `research/benchmarks/` | — |

---

## Related Directories

- **`../research/`** — Research data, reports, benchmarks, papers, daily briefings
- **`../skills/`** — Implemented system code (MCP modules)
- **`../infra/`** — Docker, MCP server infrastructure
- **`../demos/interactive/`** — Web demo

---

## Git Status

All files tracked in main branch: https://github.com/TylerGarlick/abraxas

_Last updated: 2026-05-14_
