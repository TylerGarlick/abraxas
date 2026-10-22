# Abraxas Research Repository

**Organized:** April 2026
**Last reviewed:** 2026-10-21

This page is a short orientation. The [research index](INDEX.md) is the broader catalog of papers,
reports, specifications, experiments, datasets, model files, daily notes, and historical material.

---

## Folder Structure

```
research/
├── INDEX.md         # Research catalog and cross-references
├── SOVEREIGN_CORPUS.md # Consolidated reference corpus
├── 2026/            # Dated research briefings and experiment outputs
├── benchmarks/      # Structured benchmark results (JSON)
├── hardening/       # Stress tests, datasets, and hardening reports
├── final/           # Manuscript packages and supporting analyses
├── papers/          # Whitepapers and research papers
├── reports/         # Research reports and evaluations
├── specs/           # System specifications
├── memory/          # Tested-model log
├── scripts/         # Research scripts and related notes
├── plans/           # Research plans
├── archive/         # Older proposals, superseded docs
├── models/          # Model configuration files
└── comparison/      # Comparison matrices and benchmarks
```

---

## File Index

### papers/ — Research Papers

| File | Date | Description |
|------|------|-------------|
| `collusion-prevention-whitepaper.md` | 2026-04-06 | How Abraxas prevents multi-agent deception (with empirical tests) |
| `new-systems-proposal-2026-04.md` | 2026-04-06 | Historical proposal; not a list of currently implemented systems |

### specs/ — System Specifications

| File | Date | Description |
|------|------|-------------|
| `aletheia-spec.md` | 2026-04-05 | Aletheia calibration tracking system specification |

### comparison/ — Benchmarks & Comparisons

| File | Date | Description |
|------|------|-------------|
| `ABRAXAS_COMPARISON_MATRIX.md` | 2026-04-05 | Abraxas vs. Claude/GPT/Gemini on verification tasks |

### models/ — Model Configurations

| File | Date | Description |
|------|------|-------------|
| [`Modelfile-abraxas-minimax-v2`](models/Modelfile-abraxas-minimax-v2) | 2026-03 | Ollama model configuration |
| [`Modelfile-abraxas-minimax-v2.1`](models/Modelfile-abraxas-minimax-v2.1) | 2026-03 | Updated Ollama model configuration |
| [`Modelfile-abraxian-gpt-oss-120b-cloud`](models/Modelfile-abraxian-gpt-oss-120b-cloud) | 2026-03 | GPT-OSS model configuration |

### archive/ — Historical Documents

| File | Date | Description |
|------|------|-------------|
| `10-next-systems-research.md` | 2026-03-16 | March 2026 proposal (6 systems: Hermes, Pheme, Prometheus, Dianoia, Ergon, Ananke) |
| `v2.0-systems-proposal.md` | 2026-03 | Earlier systems proposal |
| `phase1-completion-report.md` | 2026-03 | Phase 1 (Logos + Ergon) completion report |

### Test and evaluation material

| File | Date | Description |
|------|------|-------------|
| [`reports/`](reports/) | Various | Research evaluations and written test reports |
| [`benchmarks/`](benchmarks/) | Various | Structured benchmark results |
| [`../tests/`](../tests/) and [`../mcp/tests/`](../mcp/tests/) | — | Repository test suites; there is no `research/tests/` directory |

---

## Selected Documents

### Papers and references

1. [`papers/research-paper-v4.md`](papers/research-paper-v4.md) — Research paper v4; assess its claims against its cited evidence.
2. [`papers/collusion-prevention-whitepaper.md`](papers/collusion-prevention-whitepaper.md) — Research on collusion prevention.
3. [`papers/new-systems-proposal-2026-04.md`](papers/new-systems-proposal-2026-04.md) — Historical systems proposal.
4. [`comparison/ABRAXAS_COMPARISON_MATRIX.md`](comparison/ABRAXAS_COMPARISON_MATRIX.md) — Cross-model comparison.
5. [`sovereign-evidence-standard.md`](../docs/research/sovereign-evidence-standard.md) — Research evidence criteria.
6. [`SOVEREIGN_CORPUS.md`](SOVEREIGN_CORPUS.md) — Consolidated reference corpus.

### Other collections

- [`reports/`](reports/) — literature reviews, evaluations, dated reports, and summaries.
- [`specs/`](specs/) — system specifications.
- [`final/final/nature_mi/`](final/final/nature_mi/) and
  [`final/final/neurips_2026/`](final/final/neurips_2026/) — manuscript packages and supporting
  files; “final” describes the saved package, not publication or acceptance status.
- [`hardening/`](hardening/) — stress-test results, datasets, and manuscript support.
- [`benchmarks/`](benchmarks/) — raw structured benchmark outputs.
- [`2026/`](2026/) — dated briefings and experiment records.
- [`archive/`](archive/) — historical proposals, reports, and drafts.
- [`models/`](models/) — versioned Ollama model definitions.
- [`plans/`](plans/), [`memory/`](memory/), and [`scripts/`](scripts/) — research planning,
  tested-model notes, and script-related material.

---

## Related Directories

- [`../docs/`](../docs/) — System documentation, architecture, and deployment guides.
- [`../skills/`](../skills/) — Skill packages and source files.
- [`../tests/`](../tests/) and [`../mcp/tests/`](../mcp/tests/) — Repository test suites.

---

## Git Status

Repository: [[USER]/abraxas](https://github.com/[USER]/abraxas). Browse the
[research index](INDEX.md) for the repository-relative catalog.

_Last updated: 2026-04-06_