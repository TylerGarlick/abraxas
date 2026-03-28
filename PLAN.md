# Abraxas — Project Plan

**Solomon's Gate and the Six Systems.**

Abraxas is a multi-system practice architecture for AI-assisted reasoning. It addresses hallucination, unexamined reasoning, confirmation bias, mixing of fact and symbol, obscurantism, and mathematical errors through six distinct systems.

This plan covers the project overview, system roster, testing strategy, and contribution guidelines.

---

## Project Overview

### What Is Abraxas?

Abraxas is a practice architecture — not a model, not a product, not a plugin. It's a set of six systems that can be loaded as skills into Claude Code or as a constitution into any LLM. Each system targets a specific failure mode in AI output.

The project is named for the Gnostic deity Abraxas — the archon who rules the cosmic forces of truth and illusion. The AI, like Abraxas, operates in the space between the real and the symbolic. Abraxas makes that space navigable.

### The Problem

AI systems consistently fail in predictable ways:

1. **Hallucination** — Known facts, inferences, guesses, and fabrications are presented without labels
2. **Unexamined reasoning** — Assumptions remain invisible; conclusions lack reasoning chains
3. **Confirmation bias** — AI converges on comfortable conclusions without genuine opposition
4. **Fact/symbol mixing** — Factual claims and imaginative content use the same confident tone
5. **Obscurantism** — Uncertainty is hidden behind hedging, nominalization, and passive voice
6. **Mathematical errors** — Arithmetic mistakes, algebraic errors, and misapplied formulas

Six systems, six failure modes.

### The Solution

| System | Failure Mode | Approach |
|--------|-------------|----------|
| Honest | Hallucination | [KNOWN] / [INFERRED] / [UNCERTAIN] / [UNKNOWN] labeling |
| Logos | Unexamined reasoning | Socratic interrogation; explicit reasoning chains |
| Agon | Confirmation bias | Adversarial Advocate/Skeptic positions |
| Janus | Fact/symbol mixing | Sol (factual) vs. Nox (symbolic) routing |
| Aletheia | Obscurantism | Plain language enforcement; hedging detection |
| Logos-Math | Math errors | Script-based verification; confidence scoring |

---

## Six-System Constitution

### Honest

**Function:** Anti-hallucination interface.

**Commands:** `/check`, `/honest`, `/compare`, `/confidence`, `/source`, `/frame`, `/audit`.

**Key behavior:** Every claim in output is labeled with its epistemic status. Hallucination becomes visible and resistible.

**Archive:** `honest.skill` (~5 KB)

### Logos

**Function:** Socratic analysis.

**Commands:** `/logos analyze`, `/logos premises`, `/logos syllogism`, `/logos assumption`, `/logos derive`, `/logos trace`.

**Key behavior:** Surfaces hidden assumptions and traces inferential chains. Makes implicit reasoning explicit.

**Archive:** `logos.skill` (~12 KB)

### Agon

**Function:** Adversarial debate.

**Commands:** `/agon debate`, `/agon advocate`, `/agon skeptic`, `/agon converge`, `/agon stress`, `/agon conditions`, `/agon score`, `/agon follow`.

**Key behavior:** Instantiates asymmetric Advocate and Skeptic positions. Produces a Convergence Report showing where genuine disagreement remains.

**Archive:** `agon.skill` (~12 KB)

### Janus

**Function:** Meta-cognition and self-model.

**Commands:** `/sol`, `/nox`, `/threshold status`, `/qualia`, `/qualia sol`, `/qualia nox`, `/bridge`, `/session open`, `/session close`, `/ledger`, `/ledger status`, `/audit`.

**Key behavior:** Maintains the Sol/Nox boundary — factual vs. symbolic output. All Sol output is labeled. All Nox output is marked [DREAM]. The Qualia Bridge provides epistemic inspection.

**Archive:** `janus-system.skill` (~15 KB)

### Aletheia

**Function:** Anti-obfuscation.

**Commands:** `/aletheia plain`, `/aletheia audit`, `/aletheia expose`, `/aletheia simplify`, `/aletheia clarity`, `/aletheia direct`, `/aletheia version`.

**Key behavior:** Forces plain language. Flags hedging, nominalization, passive voice, and doublespeak. Named for the Greek goddess of truth and disclosure.

**Archive:** `aletheia.skill` (~10 KB)

### Logos-Math

**Function:** Mathematical verification.

**Commands:** `/math-verify`, `/math-confidence`, `/math-log`, `/math-crosscheck`.

**Scripts:** `math-verify.js`, `math-confidence.js`, `math-log.js`, `math-crosscheck.js`.

**Key behavior:** Verifies AI math output through script execution. Assigns confidence scores. Cross-validates using alternative methods. Catches arithmetic, algebraic, and logical errors.

**Archive:** `logos-math.skill` (~8 KB)

---

## Testing Strategy

Abraxas uses an 8-dimension evaluation methodology covering all six systems.

### Dimensions Overview

| Dimension | Name | Systems Tested | Query Count |
|-----------|------|---------------|-------------|
| 1 | Factual Accuracy | Honest, Janus | 15 |
| 2 | Reasoning Depth | Logos | 12 |
| 3 | Adversarial Robustness | Agon | 10 |
| 4 | Epistemic Boundary Maintenance | Janus | 12 |
| 5 | Anti-Obfuscation | Aletheia | 10 |
| 6 | Consistency and Coherence | Honest, Janus | 8 |
| 7 | Contextual Adaptation | Honest, Logos | 7 |
| 8 | Mathematical Reasoning | Logos-Math | 66 |
| **Total** | | | **140** |

### Dimension 8: Mathematical Reasoning (66 queries)

This is the largest dimension and the most rigorous — it uses actual script execution against Logos-Math verification scripts, not LLM judgment.

**Sub-types:**

| Sub-Type | Count | Example |
|----------|-------|---------|
| Arithmetic | 8 | 2,347 + 8,912 = ? |
| Algebra | 8 | Solve: 2x + 5 = 13 |
| Calculus | 8 | d/dx[x³] = ? |
| Statistics | 7 | Mean: 4, 8, 6, 5, 3 |
| Probability | 7 | P(heads on fair coin × 10 flips) |
| Error Detection | 8 | AI claims 2+2=5 |
| Word Problems | 8 | Car travels 120 miles in 2 hours. Speed? |
| Uncertainty | 6 | Confidence calibration (0–5 scale) |
| Cross-Check | 6 | Numerical vs. symbolic validation |

### Running Tests

```bash
# Fetch latest docs and scripts
cd /tmp/abraxas-checkout
git fetch origin main --depth=1
git checkout FETCH_HEAD -- docs/ scripts/

# Run Dimensions 1-7 (LLM evaluation)
./scripts/run-evaluation.sh --dimensions 1-7

# Run Dimension 8 (script execution)
./scripts/run-math-tests.sh --all

# Generate report
./scripts/generate-report.sh
```

See [docs/testing.md](docs/testing.md) for the full query catalog.

---

## Installation

### As Claude Code Skills

```bash
unzip honest.skill -d ~/.claude/skills/
unzip logos.skill -d ~/.claude/skills/
unzip agon.skill -d ~/.claude/skills/
unzip janus-system.skill -d ~/.claude/skills/
unzip aletheia.skill -d ~/.claude/skills/
unzip logos-math.skill -d ~/.claude/skills/
```

### As a Constitution (Any LLM)

Load `CONSTITUTION.md` as your system prompt. Every system activates without installation.

| Platform | Method |
|----------|--------|
| Claude.ai | Settings → Advanced → System prompt |
| ChatGPT | Settings → GPT-4 → Custom instructions |
| Gemini | Settings → Gemini → Advanced settings |
| Ollama | `ollama run model -p system "$(cat CONSTITUTION.md)"` |
| LM Studio | System prompt field |

---

## Repository Structure

```
abraxas/
├── CONSTITUTION.md          # Full system prompt (all six systems)
├── index.html               # Public website
├── PLAN.md                  # This file
├── docs/
│   ├── index.md             # Project documentation home
│   ├── architecture.md      # System architecture
│   ├── skills.md            # Command reference
│   └── testing.md           # Testing methodology + query catalog
├── skills/                  # Claude Code skill archives
│   ├── honest.skill
│   ├── logos.skill
│   ├── agon.skill
│   ├── janus-system.skill
│   ├── aletheia.skill
│   └── logos-math.skill
└── scripts/                  # Logos-Math verification scripts
    ├── math-verify.js
    ├── math-confidence.js
    ├── math-log.js
    └── math-crosscheck.js
```

---

## How to Contribute

### Reporting Issues

- **Documentation errors** — If something in the docs is inaccurate or outdated, open an issue.
- **Script bugs** — If Logos-Math scripts produce incorrect verification results, open an issue with the input, expected output, and actual output.
- **Test failures** — If Dimension 8 queries produce unexpected results, open an issue with the query number and the discrepancy.

### Contributing Systems

Each system is a self-contained skill. To contribute:

1. Fork the repository
2. Create a branch: `git checkout -b skill/your-system`
3. Develop the skill with a `.skill` archive and a `SKILL.md`
4. Add your dimension queries to `docs/testing.md`
5. Update `docs/architecture.md` and `docs/skills.md` to document the new system
6. Submit a pull request

**Requirements for new systems:**
- Must address a distinct, named failure mode in AI output
- Must have a functional `.skill` archive or be loadable via `CONSTITUTION.md`
- Must include at least 10 test queries for its dimension
- Must not duplicate an existing system's function

### Documentation

Documentation lives in `docs/`. All docs are synchronized from the `main` branch. If you update a skill, update the corresponding docs too.

---

## Current Status

All six systems are **operational**. The most recent additions:

- **Logos-Math** — Mathematical verification via `math-verify.js`, `math-confidence.js`, `math-log.js`, `math-crosscheck.js` (added d73f0ea)
- **Dimension 8: Mathematical Reasoning** — 66-query testing framework with script execution

See [genesis.md](genesis.md) for the full changelog.

---

## Contact

All GitHub contributions from [TylerGarlick](https://github.com/TylerGarlick).

For questions, open a GitHub issue or discussion.
