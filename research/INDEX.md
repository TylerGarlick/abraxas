# Abraxas Research Documentation — Index

**Last Updated:** 2026-05-14  
**Reorganized:** 2026-05-14

---

## Folder Structure

```
research/
├── INDEX.md                      # This file
├── README.md                     # Original research README
├── SOVEREIGN_CORPUS.md           # Comprehensive sovereign brain reference (math-heavy)
│
├── papers/                       # Research papers and whitepapers
│   └── research-paper-v4.md      # Latest v4 whitepaper (primary)
│
├── reports/                      # Research reports and evaluations
│   ├── EXECUTIVE_SUMMARY.md
│   ├── 04-literature-review.md
│   ├── 06-agon-convergence-report.md
│   ├── 07-solnox-separation-test.md
│   ├── 08-utility-tradeoff-test.md
│   ├── 09-user-trust-tests.md
│   ├── 12-ai-research-assistant-managed.md
│   ├── 13-subagent-next-systems-report.md
│   └── ... (dated reports)
│
├── benchmarks/                   # Test result data (JSON)
│   └── abraxas-v2-test-results-*.json (10 files)
│
├── comparison/                   # Cross-model comparison data
│   └── ABRAXAS_COMPARISON_MATRIX.md
│
├── hardening/                    # Chaos Suite and stress test data
│
├── specs/                        # System specifications (aion, aletheia, episteme, etc.)
│
├── final/                        # Final manuscripts for publication
│   └── final/
│       ├── nature_mi/            # Nature Machine Intelligence manuscript
│       └── neurips_2026/         # NeurIPS 2026 manuscript
│
├── models/                       # Model configuration files
│
├── scripts/                      # Python research scripts
│
├── plans/                        # Research plans (sovereign-nexus)
│
├── memory/                       # Tested model logs
│
├── 2026/                         # Daily research briefings (38 folders, Mar—May 2026)
│   ├── 03/13—31/
│   ├── 04/11—30/
│   └── 05/01—03/
│
└── archive/                      # Deprecated and outdated files
```

---

## Key Documents

| Document | Location | Status | Description |
|----------|----------|--------|-------------|
| **Research Paper v4** | [`papers/research-paper-v4.md`](papers/research-paper-v4.md) | ✅ Current | Full v4 whitepaper — hallucinations, sycophancy, provenance chains |
| **Sovereign Corpus** | [`SOVEREIGN_CORPUS.md`](SOVEREIGN_CORPUS.md) | ✅ Current | Comprehensive reference with heavy math formalization |
| **Nature MI Manuscript** | [`final/final/nature_mi/manuscript.md`](final/final/nature_mi/manuscript.md) | ✅ Final | Nature Machine Intelligence submission |
| **NeurIPS 2026 Manuscript** | [`final/final/neurips_2026/manuscript.md`](final/final/neurips_2026/manuscript.md) | ✅ Final | NeurIPS 2026 submission |
| **Mathematical Formalization** | [`final/final/neurips_2026/mathematical_formalization.md`](final/final/neurips_2026/mathematical_formalization.md) | ✅ Final | Full math appendix |
| **Comparison Matrix** | [`comparison/ABRAXAS_COMPARISON_MATRIX.md`](comparison/ABRAXAS_COMPARISON_MATRIX.md) | ✅ Current | Cross-model comparison |
| **Executive Summary** | [`reports/EXECUTIVE_SUMMARY.md`](reports/EXECUTIVE_SUMMARY.md) | ✅ Current | High-level summary |

---

## Daily Briefings (2026)

38 daily research briefings from March—May 2026. Each folder contains a `README.md` with the day's findings.

| Period | Folders | Coverage |
|--------|---------|----------|
| March 2026 | 13/13, 16/16, 17/17, 18/18, 20/20, 21/21, 22/22, 23/23, 29/29, 30/30 | 10 folders |
| April 2026 | 11/11—30/30 | 19 folders |
| May 2026 | 01/01—03/03 | 3 folders |

---

## Cross-References to docs/

| Research Content | docs/ Equivalent |
|-----------------|-----------------|
| `SOVEREIGN_CORPUS.md` | `docs/reference/sovereign-brain-reference.md` (prose overview) |
| Architecture concepts | `docs/research/architecture/` (mirrored with cross-refs) |
| `papers/research-paper-v4.md` | `docs/research/INDEX.md` links here |

---

## Related Directories

- **`../docs/`** — Documentation, architecture, verification
- **`../docs/research/`** — Research documentation mirror with navigation
- **`../skills/`** — Implemented system code

---

*This index should be updated when new research documents are created.*
