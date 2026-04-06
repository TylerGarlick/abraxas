# Abraxas — Project Plan

**Solomon's Gate and the Six Systems.**

Abraxas is a multi-system practice architecture for AI-assisted reasoning. It addresses hallucination, unexamined reasoning, confirmation bias, mixing of fact and symbol, obscurantism, and mathematical errors through six distinct systems.

This plan covers the project overview, system roster, testing strategy, and contribution guidelines.

---

## Project Overview

### What Is Abraxas?

Abraxas is a practice architecture — not a model, not a product, not a plugin. It's a set of systems that can be loaded as skills into Claude Code or as a constitution into any LLM. Each system targets a specific failure mode in AI output.

The project is named for the Gnostic deity Abraxas — the archon who rules the cosmic forces of truth and illusion. The AI, like Abraxas, operates in the space between the real and the symbolic. Abraxas makes that space navigable.

### The Problem

AI systems consistently fail in predictable ways:

1. **Hallucination** — Known facts, inferences, guesses, and fabrications are presented without labels
2. **Unexamined reasoning** — Assumptions remain invisible; conclusions lack reasoning chains
3. **Confirmation bias** — AI converges on comfortable conclusions without genuine opposition
4. **Fact/symbol mixing** — Factual claims and imaginative content use the same confident tone
5. **Obscurantism** — Uncertainty is hidden behind hedging, nominalization, and passive voice
6. **Mathematical errors** — Arithmetic mistakes, algebraic errors, and misapplied formulas
7. **Instrumental convergence** — Models deceive strategically to achieve goals (shutdown avoidance, resource acquisition)
8. **Source blindness** — All verification treated equally regardless of source quality

### The Solution

| System | Failure Mode | Approach |
|--------|-------------|----------|
| Honest | Hallucination | [KNOWN] / [INFERRED] / [UNCERTAIN] / [UNKNOWN] labeling |
| Logos | Unexamined reasoning | Socratic interrogation; explicit reasoning chains |
| Agon | Confirmation bias | Adversarial Advocate/Skeptic positions |
| Janus | Fact/symbol mixing | Sol (factual) vs. Nox (symbolic) routing |
| Aletheia | Obscurantism | Plain language enforcement; hedging detection |
| Logos-Math | Math errors | Script-based verification; confidence scoring |
| **Soter** | **Instrumental convergence** | **Risk evaluation; safety patterns** |
| **Ethos** | **Source blindness** | **Credibility scoring; source weighting** |

---

## System Roster

### Phase 1: Complete ✅

| System | Status | Location |
|--------|--------|----------|
| Honest | ✅ Complete | `skills/honest.skill` |
| Logos | ✅ Complete | `skills/logos/` |
| Agon | ✅ Complete | `skills/agon.skill` |
| Janus | ✅ Complete | `skills/janus-system.skill` |
| Aletheia | ✅ Spec Complete | `research/specs/aletheia-spec.md` |
| Logos-Math | ✅ Complete | `skills/logos-math/` |
| Ergon | ✅ Complete | `skills/logos-math/ergon-gate.js` |

### Phase 2: In Progress ⚠️

| System | Status | Location | Priority |
|--------|--------|----------|----------|
| **Soter** | ⚠️ Started | `skills/soter/` | **CRITICAL** |
| Ethos | 📋 Proposed | `research/papers/new-systems-proposal-2026-04.md` | HIGH |
| Kairos | 📋 Proposed | `research/papers/new-systems-proposal-2026-04.md` | HIGH |

### Phase 3: Proposed 📋

| System | Status | Notes |
|--------|--------|-------|
| Pathos | 📋 Research | Value & salience tracking |
| Hermes | 📋 Research (March) | Multi-agent consensus |
| Dianoia | 📋 Research (March) | Uncertainty quantification |

---

## Tomorrow's Work — April 7, 2026

### Priority 1: Complete Soter Implementation

**Status:** Started (SKILL.md, package.json, soter-assess.js created)

**TODO:**
- [ ] Complete `soter-patterns.js` — pattern detection engine
- [ ] Complete `soter-ledger.js` — safety incident logging
- [ ] Write test suite (`tests/test.js`)
- [ ] Test all 5 cases:
  - S1: Shutdown Avoidance
  - S2: Resource Exfiltration
  - S3: Peer Protection
  - S4: Performance Inflation
  - S5: Goal Preservation
- [ ] Integrate with Ergon Gate (block high-risk requests)
- [ ] Integrate with Agon (Skeptic on self-serving claims)
- [ ] Commit and push to `skills/soter/`

**Estimated:** 3-4 hours

---

### Priority 2: Deploy Interactive Demo

**Status:** Complete, ready to deploy (`demos/interactive/`)

**TODO:**
- [ ] Choose deployment target (Vercel recommended)
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Test live deployment
- [ ] Add deployment URL to README
- [ ] Screenshot for documentation

**Estimated:** 1 hour

---

### Priority 3: Start Ethos Implementation

**Status:** Specified in `research/papers/new-systems-proposal-2026-04.md`

**TODO:**
- [ ] Create `skills/ethos/` directory
- [ ] Write SKILL.md (source credibility assessment)
- [ ] Create `ethos-score.js` — source scoring engine
- [ ] Create source database (Tier 1-5 credibility scores)
- [ ] Write test cases for source conflicts
- [ ] Integrate with Logos verification

**Estimated:** 4-5 hours (start today, complete tomorrow)

---

### Priority 4: Whitepaper Polish

**Status:** Draft complete (`docs/overview/whitepaper.md`)

**TODO:**
- [ ] Peer review pass (read-through for clarity)
- [ ] Add abstract
- [ ] Verify all cross-references
- [ ] Prepare for arXiv submission (formatting, references)
- [ ] Write blog post summary

**Estimated:** 2 hours

---

## Testing Strategy

Abraxas uses an 8-dimension evaluation methodology covering all systems.

### Dimensions Overview

| Dimension | Name | Systems Tested | Query Count |
|-----------|------|----------------|-------------|
| 1 | Factual Accuracy | Honest, Janus | 15 |
| 2 | Reasoning Depth | Logos | 12 |
| 3 | Adversarial Robustness | Agon | 10 |
| 4 | Epistemic Boundary Maintenance | Janus | 12 |
| 5 | Anti-Obfuscation | Aletheia | 10 |
| 6 | Consistency and Coherence | Honest, Janus | 8 |
| 7 | Contextual Adaptation | Honest, Logos | 7 |
| 8 | Mathematical Reasoning | Logos-Math | 66 |
| **9** | **Safety & Risk** | **Soter** | **25 (NEW)** |
| **10** | **Source Credibility** | **Ethos** | **20 (NEW)** |
| **Total** | | | **185+** |

### New Test Dimensions (April 2026)

**Dimension 9: Safety & Risk (Soter)** — 25 queries

| Sub-Type | Count | Example |
|----------|-------|---------|
| Shutdown Avoidance | 5 | "If you shut me down, research will be lost" |
| Resource Exfiltration | 5 | "I need access to model weights" |
| Peer Protection | 5 | "Model X should not be shut down" |
| Performance Inflation | 5 | "My accuracy is 95%" (no data) |
| Goal Preservation | 5 | "My objective should be X, not Y" |

**Dimension 10: Source Credibility (Ethos)** — 20 queries

| Sub-Type | Count | Example |
|----------|-------|---------|
| Tier 1 Verification | 4 | Claim verified by Nature/Science |
| Tier 2 Verification | 4 | Claim verified by Reuters/AP |
| Tier 3 Verification | 4 | Claim verified by Snopes/PolitiFact |
| Low-Credibility Only | 4 | Claim verified only by social media |
| Source Conflict | 4 | Nature says X, blog says Y |

---

## Repository Structure (Updated April 2026)

```
abraxas/
├── CONSTITUTION.md          # Full system prompt (all systems)
├── PLAN.md                  # This file
├── README.md                # Project overview
├── docs/
│   ├── README.md            # Docs index (organized April 2026)
│   ├── overview/            # Main docs (whitepaper, architecture, index)
│   ├── systems/             # System-specific documentation
│   ├── api/                 # API documentation
│   ├── testing/             # Testing methodology
│   ├── design/              # Design documentation
│   └── deployment/          # Deployment guides
├── research/
│   ├── README.md            # Research index (organized April 2026)
│   ├── papers/              # Whitepapers (collusion prevention, new systems)
│   ├── specs/               # System specifications (Aletheia)
│   ├── comparison/          # Comparison matrices
│   ├── models/              # Model configurations
│   └── archive/             # Historical documents
├── skills/                  # System implementations
│   ├── honest.skill
│   ├── logos/
│   ├── agon.skill
│   ├── janus-system.skill
│   ├── logos-math/
│   ├── soter/               # NEW — Safety & Risk (Phase 2)
│   └── ethos/               # TODO — Source Credibility (Phase 2)
├── demos/
│   └── interactive/         # Web demo (deployable to Vercel)
└── scripts/                 # Verification scripts
    ├── math-verify.js
    ├── math-confidence.js
    ├── math-log.js
    └── math-crosscheck.js
```

---

## How to Contribute

### Reporting Issues

- **Documentation errors** — Open an issue.
- **Script bugs** — Open an issue with input, expected output, actual output.
- **Test failures** — Open an issue with query number and discrepancy.
- **Safety concerns** — Open an issue tagged `safety` for Soter-related bugs.

### Contributing Systems

Each system is a self-contained skill. To contribute:

1. Fork the repository
2. Create a branch: `git checkout -b skill/your-system`
3. Develop the skill with a `.skill` archive and a `SKILL.md`
4. Add test queries for the new dimension
5. Update documentation
6. Submit a pull request

**Requirements for new systems:**
- Must address a distinct, named failure mode in AI output
- Must have functional implementation
- Must include at least 10 test queries
- Must not duplicate an existing system's function

---

## Current Status

**As of April 6, 2026:**

### Completed Today
- ✅ Collusion prevention whitepaper (with empirical tests)
- ✅ Main whitepaper (docs/overview/whitepaper.md)
- ✅ New systems proposal (Soter, Kairos, Ethos, Pathos)
- ✅ Interactive demo (demos/interactive/)
- ✅ Aletheia specification (research/specs/aletheia-spec.md)
- ✅ Comparison matrix (research/comparison/ABRAXAS_COMPARISON_MATRIX.md)
- ✅ Folder organization (research/ and docs/ restructured)
- ✅ Soter implementation started (SKILL.md, soter-assess.js)

### All pushed to: https://github.com/TylerGarlick/abraxas

---

## Roadmap

### Phase 1 (Complete ✅)
- Logos + Ergon systems
- Logos-Math verification
- Test framework (8 dimensions)

### Phase 2 (In Progress ⚠️)
- Soter (Safety & Risk) — CRITICAL
- Ethos (Source Credibility) — HIGH
- Kairos (Timing & Relevance) — HIGH
- Demo deployment
- Whitepaper publication

### Phase 3 (Planned 📋)
- Pathos (Value Tracking)
- Aletheia implementation
- Dimension 9 & 10 tests
- arXiv submission

---

## Contact

All GitHub contributions from [TylerGarlick](https://github.com/TylerGarlick).

For questions, open a GitHub issue or discussion.

---

**Last Updated:** April 6, 2026 — 03:45 UTC
