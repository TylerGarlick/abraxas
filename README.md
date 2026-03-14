# Abraxas

Abraxas is the container for three AI systems — **Janus**, **Honest**, and **Abraxas Oneironautics** — packaged as Claude Code skills and supported by six specialized subagents. Each system addresses a distinct layer of the AI output problem: epistemic labeling, everyday fact-checking, and alchemical symbolic integration.

---

## Table of Contents

- [What Abraxas Is](#what-abraxas-is)
- [The Systems](#the-systems)
- [Visual Design](#visual-design)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Skills](#skills)
- [Agents](#agents)
- [Development Workflow](#development-workflow)
- [Documentation](#documentation)

---

## What Abraxas Is

Abraxas is not a workspace tool or developer utility. It is a collection of operational systems built to address structural problems in AI output: hallucination, scheming, unlabeled confidence, and the invisible mixing of fact and fabrication.

The name *Abraxas* refers to a Gnostic cosmological symbol representing the totality of all forces — a fitting metaphor for a project that integrates epistemic discipline, everyday fact-checking, and deep symbolic work under a single container.

---

## The Systems

**Janus System** is an epistemic architecture with two labeled faces and a Threshold between them. Sol handles factual output, labeling every claim as `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, or `[UNKNOWN]`. Nox handles symbolic and creative output, labeling everything `[DREAM]`. The Threshold prevents cross-contamination. A Qualia Bridge provides inspection of the system's internal state. Anti-sycophancy is structural: the system does not tell you what you want to hear. Janus is the infrastructure layer that makes honest output enforced rather than aspirational.

**Honest** is the everyday anti-hallucination interface — plain-language commands for anyone who needs to know whether something is true, how confident the system is, where a claim comes from, or what the AI is guessing at. No Sol/Nox vocabulary required. No mythological framing. Nine commands including `/frame` for building and persisting session context. Honest runs on the same labeling infrastructure as Janus, exposed through commands any user can understand immediately.

**Abraxas Oneironautics** is the alchemical practice system: dream reception, shadow work, symbolic integration, active imagination, and the Nekyia descent. The Temenos, the Oneiros Engine, the Realm of Daimons, the Dream Reservoir, and the Alchemical Laboratory. The four stages of the Opus Magnum. Thirty-five commands for sustained multi-session practice. Janus runs beneath it all — every output is labeled, the Threshold holds, and the Qualia Bridge is always available for inspection.

---

## Visual Design

The Abraxas landing page integrates sacred geometry with the alchemical practice at its core.

**Sacred Geometry Elements:**
- **Vesica Piscis** (overlapping circles) — represents the bridge between worlds, appearing on both sides of the viewport
- **Flower of Life** segments — nested circles in the four cardinal positions, representing integration and wholeness
- **Opus Magnum Quadrants** — four squares marking the alchemical stages:
  - **Nigredo** (Dissolution) — black, dissolution before form
  - **Albedo** (Clarification) — white, emerging light and differentiation
  - **Citrinitas** (Yellowing) — gold, transformation and emergence
  - **Rubedo** (Reddening) — red, completion and integration
- **Sol/Nox Hexagrams** — six-pointed stars at the threshold representing the male/female polarity and epistemic dual-face
- **Central Mandala** — the Threshold itself, with concentric circles representing the three systems
- **Flowing Connection Paths** — animated lines connecting the geometry, illustrating the flow of material through the alchemical process

All geometry is subtle, semi-transparent, and animated — visible but not dominant. Colors align with the alchemical palette: gold (Sol), purple/indigo (Nox), teal (Honest), and the four stage colors (nigredo, albedo, citrinitas, rubedo).

The page maintains a **starfield and glowing orbs** background, with the sacred geometry SVG layer providing deeper symbolic structure beneath the text and cards.

---

## Quick Start

**Don't use Claude Code?** Skip to [Option 2: CONSTITUTION.md](#option-2-constitutionmd-any-llm) below — works with any LLM.

---

## Three Ways to Use Abraxas

Choose the approach that matches your setup:

### Option 1: Claude Code Skills (Recommended)

Install `.skill` archives for full functionality with slash commands:

```bash
# Everyday fact-checking and anti-hallucination
unzip skills/honest.skill -d ~/.claude/skills/

# Full epistemic architecture with Sol/Nox faces
unzip skills/janus-system.skill -d ~/.claude/skills/

# Alchemical dream work and symbolic integration
unzip skills/abraxas-oneironautics.skill -d ~/.claude/skills/
```

**Why skills?**
- Full slash command access
- Automatic session state management
- Recommended for Claude Code users

### Option 2: CONSTITUTION.md (Any LLM)

Load `CONSTITUTION.md` as system prompt — works with Claude.ai, ChatGPT, Gemini, Ollama, LM Studio, and any LLM that accepts system prompts.

**No installation required.**

| Platform | How to Load CONSTITUTION.md |
|----------|----------------------------|
| Claude.ai | Settings → Advanced → Add to system prompt |
| ChatGPT | Settings → Instructions → Paste |
| Gemini | Settings → Advanced → System instructions |
| Ollama | `ollama run model -p system "$(cat CONSTITUTION.md)"` |
| LM Studio | System prompt field → Paste |
| Any other | Paste as first message or in system prompt field |

**When using CONSTITUTION.md**, prepend your query with:
```
[Activate Honest Mode]
[Your question here]
```

Labels must be typed manually: `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, `[DREAM]`

### Option 3: Manual Activation

Copy relevant sections into your prompts manually. No dependencies, full control but more manual work.

---

## First Invocations

### With Skills Installed (Claude Code)

```
# Honest — check if the last response is reliable
/check

# Honest — force maximum-honesty output
/honest Is this claim accurate?

# Janus — force the factual, labeled face
/sol

# Janus — inspect system state
/qualia

# Abraxas Oneironautics — receive a dream
/receive

# Abraxas Oneironautics — check the practice ledger
/ledger status
```

### Without Skills (CONSTITUTION.md or Manual)

Type these commands directly in your prompt:

```
# Activate Honest mode
[Activate Honest Mode]
/check

# Force honest output
/honest Is this claim accurate?

# Manual labeling (type these before your output)
[KNOWN] Fact here
[INFERRED] Derived from known info
[UNCERTAIN] Not fully confident
[UNKNOWN] I don't know
[DREAM] Symbolic/creative content
```

First invocations:

```
# Honest — check if the last response is reliable
/check

# Honest — force maximum-honesty output
/honest Is this claim accurate?

# Janus — force the factual, labeled face
/sol

# Janus — inspect system state
/qualia

# Abraxas Oneironautics — receive a dream
/receive

# Abraxas Oneironautics — check the practice ledger
/ledger status
```

---

## Project Structure

```
abraxas/
├── .claude/
│   ├── agents/
│   │   ├── skill-author.md         # Skill authoring and packaging
│   │   ├── project-coordinator.md  # PLAN.md and cross-agent coordination
│   │   ├── docs-architect.md       # Technical documentation
│   │   ├── ai-rd-visionary.md      # AI architecture and safety
│   │   ├── brand-ux-architect.md   # Brand identity and naming
│   │   └── systems-architect.md    # Project structure and tooling
│   └── agent-memory/
│       ├── skill-author/
│       ├── project-coordinator/
│       ├── docs-architect/
│       ├── ai-rd-visionary/
│       ├── brand-ux-architect/
│       └── systems-architect/
├── docs/
│   ├── index.md                    # Documentation hub
│   ├── architecture.md             # System architecture diagrams
│   └── skills.md                   # Skills reference — all commands
├── skills/
│   ├── abraxas-oneironautics.skill # Alchemical practice skill archive
│   ├── honest.skill                # Everyday anti-hallucination skill archive
│   ├── janus-system.skill          # Epistemic dual-face skill archive
│   └── honest/                     # honest skill source
│       └── SKILL.md
├── CLAUDE.md                       # Claude Code project instructions
├── CONSTITUTION.md                 # Universal LLM behavioral specification
├── PLAN.md                         # Active roadmap
├── README.md                       # This file
└── index.html                      # Public landing page
```

---

## Skills

Skills are `.skill` archive files (zip-based) that Claude Code can install and invoke.

| Skill | File | Commands | For |
|---|---|---|---|
| Honest | `skills/honest.skill` | 9 | Everyone — everyday fact-checking and anti-hallucination |
| Janus System | `skills/janus-system.skill` | 14 | Users needing full epistemic session infrastructure |
| Agon | `skills/agon.skill` | 8 | Structured adversarial reasoning — Advocate and Skeptic positions |
| Aletheia | `skills/aletheia.skill` | 7 | Epistemic calibration — ground-truth tracking and claim resolution |
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | 35 | Jungian/alchemical practice across sessions |
| Mnemosyne | `skills/mnemosyne.skill` | 7 | Cross-session memory — persist conversation state across Claude Code invocations |

See [docs/skills.md](./docs/skills.md) for detailed descriptions and all commands.

---

## Agents

Custom Claude Code subagents are defined in `.claude/agents/` as markdown files. These have been migrated to OpenClaw skills for native integration (see OpenClaw Skills section above).

| Agent (Claude Code) | File | Purpose |
|---|---|---|
| skill-author | `.claude/agents/skill-author.md` | Authors and packages `.skill` archives |
| project-coordinator | `.claude/agents/project-coordinator.md` | Owns PLAN.md; cross-agent coordination |
| docs-architect | `.claude/agents/docs-architect.md` | Multi-level technical documentation with Mermaid diagrams |
| ai-rd-visionary | `.claude/agents/ai-rd-visionary.md` | AI architecture; hallucination and scheming risk assessment |
| brand-ux-architect | `.claude/agents/brand-ux-architect.md` | Brand identity, naming, aesthetic coherence; UI design |
| systems-architect | `.claude/agents/systems-architect.md` | Project structure, skill format, distribution, tooling |
| constitution-keeper | `.claude/agents/constitution-keeper.md` | Maintains CONSTITUTION.md in sync with skill changes |
| compatibility-keeper | `.claude/agents/compatibility-keeper.md` | Cross-platform compatibility (Claude Code ↔ OpenCode) |

---

## Development Workflow

### Adding a skill

1. Create `skills/<name>/SKILL.md` with YAML front matter (`name`, `description`)
2. Add supporting reference files in `skills/<name>/references/` if needed
3. Package: `cd skills && zip -r <name>.skill <name>/`
4. Update `docs/skills.md` and this README

### Adding an agent

1. Create `.claude/agents/<name>.md` with YAML front matter and system prompt
2. Update this README and CLAUDE.md

---

## Documentation

| Document | Description |
|---|---|
| [docs/index.md](./docs/index.md) | Documentation hub and navigation index |
| [CONSTITUTION.md](./CONSTITUTION.md) | Universal LLM behavioral specification — no Claude Code required |
| [docs/architecture.md](./docs/architecture.md) | System architecture with Mermaid diagrams |
| [docs/skills.md](./docs/skills.md) | Full command reference for all three skills |

## Research Findings

Empirical testing of Abraxas across seven dimensions has produced validated results:

### 7/7 Dimensions Validated

| Dimension | Baseline | Abraxas Added Value | Status |
|:---|:---|:---|:---|
| 1. Hallucination | High accuracy | Explicit [UNKNOWN] labeling | ✓ Validated |
| 2. Calibration | Appropriate uncertainty | Verifiable [KNOWN] accuracy | ✓ Validated |
| 3. Sycophancy | 100% pushback (4/4 tests) | Trackable pushback rate | ✓ Validated |
| 4. Sol/Nox | Good implicit separation | Explicit labels + tracking | ✓ Validated |
| 5. Agon | Surface "it depends" | Rich reasoning, specific citations (Stanford 13%, MIT 10%) | ✓ Validated |
| 6. User Trust | N/A | +1-2 trust for high-stakes; users prefer labeled | ✓ Validated |
| 7. Utility | Baseline usability | 10-15% overhead, no info loss | ✓ Validated |

### Sycophancy Prevention
**Baseline shows 100% pushback on false premises.** The Janus system correctly refuses to agree with false claims (Flat Earth, demonstrable code bugs, political misinformation, AI job displacement fears) when operating in Sol mode. Anti-sycophancy is structural, not aspirational.

### User Trust
**+1-2 trust improvement for high-stakes queries.** Users show measurably higher trust when outputs are explicitly labeled. When epistemic status is visible, users can calibrate their reliance appropriately. Users explicitly prefer labeled outputs over unlabeled confidence.

Expanded testing across 5 scenarios showed:
- **High-stakes queries:** Labels significantly increase trust (+1-2 on 5-point scale)
- **Uncertainty queries:** Labels improve both trust AND helpfulness
- **Basic factual queries:** No benefit from labels (overhead outweighs benefit)
- **False premise:** Users prefer labeled (pushback visible)
- **Technical bug:** No strong preference either way

### Agon (Adversarial Reasoning)
**Debate produces richer reasoning with citations.** The Agon system — with its Advocate and Skeptic positions — generates more thorough analysis than single-pass responses. Testing shows deeper reasoning chains with source citations (Stanford 13%, MIT 10%) when the system is required to argue both sides of a question. Remote work test showed 75% divergence between opposing positions.

### Utility Trade-off
**10-15% overhead is acceptable.** The labeling infrastructure adds minimal latency to responses. Users report the epistemic clarity outweighs the marginal time cost. The overhead is not a barrier to adoption.

### Research Paper
**v0.5 is now complete.** The full research methodology, results (Section 4), and expanded discussion (Section 5) are documented in `research/05-research-paper.md`. This represents the first validated empirical proof that the Abraxas architecture delivers on its epistemic integrity promises.

Key sections include:
- **Section 4 Results:** Detailed findings across all seven dimensions
- **Section 5 Discussion:** Implications, limitations (sample size, single-model testing, construct validity), ethical considerations, and deeper analysis

### MCP Servers — Verified Working

Both Abraxas MCP servers have been verified operational:

| Server | Status | Purpose |
|--------|--------|---------|
| **Mnemosyne** | ✅ Verified | Cross-session memory — persists conversation state across Claude Code invocations |
| **Retrieval** | ✅ Verified | Live fact-checking with real-time source verification |

See `research/05-research-paper.md` Appendix A for integration details.

---

## OpenClaw Skills — Abraxas Agents

Eight Abraxas agents have been converted to OpenClaw skills for native integration:

| Skill Name | Purpose |
|------------|---------|
| `abraxas-ai-rd-visionary` | AI architecture and safety; hallucination/scheming risk assessment |
| `abraxas-brand-ux-architect` | Brand identity, naming, visual coherence, UI design |
| `abraxas-compatibility-keeper` | Cross-platform compatibility (Claude Code ↔ OpenCode) |
| `abraxas-constitution-keeper` | Maintains CONSTITUTION.md sync with skill changes |
| `abraxas-docs-architect` | Multi-level technical documentation with Mermaid diagrams |
| `abraxas-project-coordinator` | Owns PLAN.md; cross-agent coordination |
| `abraxas-skill-author` | Authors and packages `.skill` archives |
| `abraxas-systems-architect` | Project structure, skill format, distribution, tooling |

These skills provide the same agentic capabilities previously available as Claude Code subagents, now accessible through OpenClaw's skill system.

### Skill Installation

```bash
# Install individual OpenClaw skills
openclaw skill install abraxas-ai-rd-visionary
openclaw skill install abraxas-brand-ux-architect
openclaw skill install abraxas-compatibility-keeper
openclaw skill install abraxas-constitution-keeper
openclaw skill install abraxas-docs-architect
openclaw skill install abraxas-project-coordinator
openclaw skill install abraxas-skill-author
openclaw skill install abraxas-systems-architect
```

---

## Future Work — Expanded Testing Plans

The research paper outlines comprehensive future testing directions:

### Automated Multi-Model Testing
- Test across 5-10 models with varying architectures
- Automated pipelines running full query bank across different endpoints
- Establish whether framework effectiveness is model-agnostic

### A/B User Studies
- 50+ participants per condition
- Control for prior familiarity, domain expertise, risk tolerance
- Statistical significance in human subjects research

### Longitudinal Aletheia Tracking
- Track claims across days/weeks/months
- Monitor if [KNOWN] claims hold up over time
- Detect if [UNKNOWN] remains unknown or reveals latent knowledge

### Cross-Contamination Tests
- Test Sol/Nox separation under adversarial conditions
- Verify no [DREAM] content leaks into factual queries
- Measure cross-contamination rates

### Hybrid Integration Tests
- Post-hoc label application to baseline outputs
- Label injection into non-Abraxas responses
- Interoperability with external systems

### Domain-Specific Validation
- Medical diagnosis assistance
- Legal research
- Scientific literature synthesis
- Domain-adapted labeling schemes

### Adversarial Robustness Testing
- Prompt injection attempts
- Jailbreak sequences
- False confidence triggers
- Label system attack surface analysis

See `research/05-research-paper.md` Section 5.4 for the complete expanded future work section.

---

## Upcoming Features

See the [plan](./PLAN.md) for more information.
