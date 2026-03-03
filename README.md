# Abraxas

Abraxas is the container for three AI systems — **Janus**, **Honest**, and **Abraxas Oneironautics** — packaged as Claude Code skills and supported by six specialized subagents. Each system addresses a distinct layer of the AI output problem: epistemic labeling, everyday fact-checking, and alchemical symbolic integration.

> **Note:** Abraxas began as a Python CLI application with ArangoDB and MCP server integrations. That phase of the project has concluded. The Python source is preserved in git history for reference. The project is now focused on the Claude Code skills and agents ecosystem.

---

## Table of Contents

- [What Abraxas Is](#what-abraxas-is)
- [The Systems](#the-systems)
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

## Quick Start

**Don't use Claude Code?** `CONSTITUTION.md` is a portable behavioral specification — load it
into any capable LLM to activate all three Abraxas systems. Paste it as a system prompt in
Claude.ai, ChatGPT, Gemini, or any model that accepts a system prompt or document upload.

---

Install skills to your Claude Code skills directory:

```bash
# Everyday fact-checking and anti-hallucination
unzip skills/honest.skill -d ~/.claude/skills/

# Full epistemic architecture with Sol/Nox faces
unzip skills/janus-system.skill -d ~/.claude/skills/

# Alchemical dream work and symbolic integration
unzip skills/abraxas-oneironautics.skill -d ~/.claude/skills/
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
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | 35 | Jungian/alchemical practice across sessions |

See [docs/skills.md](./docs/skills.md) for detailed descriptions and all commands.

---

## Agents

Custom Claude Code subagents are defined in `.claude/agents/` as markdown files.

| Agent | File | Purpose |
|---|---|---|
| skill-author | `.claude/agents/skill-author.md` | Authors and packages `.skill` archives |
| project-coordinator | `.claude/agents/project-coordinator.md` | Owns PLAN.md; cross-agent coordination |
| docs-architect | `.claude/agents/docs-architect.md` | Multi-level technical documentation with Mermaid diagrams |
| ai-rd-visionary | `.claude/agents/ai-rd-visionary.md` | AI architecture; hallucination and scheming risk assessment |
| brand-ux-architect | `.claude/agents/brand-ux-architect.md` | Brand identity, naming, aesthetic coherence; UI design |
| systems-architect | `.claude/agents/systems-architect.md` | Project structure, skill format, distribution, tooling |
| constitution-keeper | `.claude/agents/constitution-keeper.md` | Maintains CONSTITUTION.md in sync with skill changes |

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
