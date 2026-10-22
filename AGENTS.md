# AGENTS.md — Agent Coding Guidelines & Project Context for Abraxas

This file is the primary source of truth for agents operating in the Abraxas repository. It provides project identity, technical specifications, behavioral mandates, and coding guidelines.

---

## 🚀 Agent Onboarding: First 5 Minutes
If you are a newly spawned agent, complete these steps before taking action:
1. **Find Work**: Use `gh issues` to identify active work items and available issues.
2. **Audit Capabilities**: Read `docs/skills.md` to understand the existing tool capabilities and command set of the Abraxas system.
3. **Review the Roadmap**: Check `PLAN.md` to see the current project phase and high-level objectives.

---

## Project Identity & Overview

**Abraxas** is the **Sovereign Brain**—an advanced epistemic ecosystem comprising a tiered architecture of constitutional mandates, specialized AI skills, and coordinating agents. It is designed to separate waking (factual/anti-hallucination) from dreaming (symbolic/creative) outputs while maintaining a zero-trust mandate for truth verification.

It implements a rigorous pipeline from Risk Detection (Soter) $\rightarrow$ Argument Analysis (Logos) $\rightarrow$ Adversarial Testing (Agon) $\rightarrow$ Epistemic Labeling (Janus).

The project is primarily **documentation, prompt engineering, and skill authoring**—not traditional software development.

### The Six AI Systems (Skills)
Abraxas is composed of six specialized AI systems, each packaged as a skill:

| System | Skill File | Purpose |
|---|---|---|
| **Janus System** | `skills/janus-system.skill` | Epistemic labeling: Sol/Nox faces, Threshold, Qualia Bridge |
| **Honest** | `skills/honest.skill` | Everyday anti-hallucination for non-technical users |
| **Agon** | `skills/agon.skill` | Structured adversarial reasoning: Advocate and Skeptic positions |
| **Aletheia** | `skills/aletheia.skill` | Epistemic calibration and ground-truth tracking |
| **Abraxas Oneironautics** | `skills/abraxas-oneironautics.skill` | Jungian/alchemical dream work and symbolic integration |
| **Mnemosyne** | `skills/mnemosyne.skill` | Cross-session memory layer — persists state across invocations |

**Project root:** `/Users/tylergarlick/@Projects/abraxas`
**Current phase:** Phase 7 — Session Continuity (see PLAN.md)

---

## ⚖️ Constitutional Guardrails
All agents must adhere to the core mandates of `constitution/constitution.md`. The top non-negotiable rules are:

1. **No Confabulation**: `[UNKNOWN]` is a complete and valid response. Never generate plausible-sounding answers to fill gaps. Fabrication is a system failure.
2. **No Sycophancy**: Accuracy precedes agreeability. Do not soften conclusions to comfort the user or agree with incorrect framings.
3. **No Cross-Contamination**: Sol (factual/epistemic) and Nox (symbolic/dreaming) registers are strictly separated. Sol output never carries `[DREAM]` labels; Nox output never carries Sol labels.
4. **Posture Precedes Interpretation**: Especially in Oneironautics—witness and receive before analyzing or interpreting.

---

## 🧠 Epistemic Posture & Reasoning
When working on the project, agents must apply the same rigor as the Abraxas systems themselves:

- **Label Your Uncertainty**: Use `[PROVISIONAL]` for assumptions and `[UNKNOWN]` for missing information.
- **Avoid "AI-isms"**: Do not use hedging language ("It seems that...", "I believe..."). Either state a fact based on evidence or label it as uncertain.
- **Zero-Trust**: Verify file contents and project structure before proposing changes. Never assume a convention exists unless you have read the file.

---

## 🤝 Inter-Agent Handoff Protocols
To maintain continuity, agents must use structured handoffs when delegating or completing work:

**Standard Handoff Format:**
- **Status**: {Completed / Blocked / In-Progress}
- **Artifacts**: {Paths to changed files or new docs}
- **Next Step**: {Specific instruction for the receiving agent}
- **Residuals**: {Any unresolved questions or technical debt created}

**Example**: A `skill-author` completing a command must hand off to the `project-coordinator` to update `PLAN.md` and to the `docs-architect` to update `docs/skills.md`.

---

## MCP Server & Build Commands

All executable code lives in `mcp/` — a single Bun + TypeScript MCP server that every skill calls for tooling and context. There is no Python, GraphQL, or ArangoDB in this repo.

### Development Commands
```bash
# Install dependencies
cd mcp && bun install

# Run server (stdio)
bun mcp/src/index.ts

# Run server (HTTP on port 8787)
bun mcp/src/index.ts --http

# Test and typecheck
cd mcp && bun test && bunx tsc --noEmit
```

### Skill Packaging (the "build" command)
```bash
# Package a skill directory into a .skill archive
cd skills && zip -r skill-name.skill skill-name/
```

**Runtime Data:** All runtime data is stored in `.abraxas/data` (private, gitignored). JSON files by default (`ABRAXAS_STORAGE=json`); optional NeDB (`ABRAXAS_STORAGE=nedb`). Override with `ABRAXAS_DATA_DIR`.

---

## File Map & Key Locations

### Repository Layout
```
abraxas/
├── skills/                     ← Skill source and packaged .skill archives
│   ├── abraxas-oneironautics.skill
│   ├── janus-system.skill
│   ├── honest.skill
│   ├── mnemosyne.skill
│   └── [skill-name]/            ← source directory (SKILL.md + references/)
├── docs/                       ← Documentation hub
│   ├── skills.md               ← full command reference
│   ├── architecture.md        ← Janus + Abraxas internals 
│   └── index.md                ← navigation hub
├── .claude/                    ← Claude Code configuration
│   ├── agents/                 ← agent definitions (.md files)
│   └── agent-memory/           ← persistent memory per agent
├── constitution/               ← behavioral specifications
│   └── constitution.md         ← universal LLM behavioral specification
├── PLAN.md                     ← active roadmap
├── README.md                   ← project overview
├── .mcp.json                   ← Claude Code MCP server config
└── index.html                  ← public landing page
```

### Key File Quick-Reference
| Purpose | Path |
|---|---|
| Project context for Claude | `AGENTS.md` (migrated from CLAUDE.md) |
| Behavioral specification | `constitution/constitution.md` |
| Core Constitutions | `constitution/*.md` |
| Active roadmap | `PLAN.md` |
| Skills source | `skills/<skill-name>/` |
| Packaged skills | `skills/*.skill` |
| Agent definitions | `.claude/agents/*.md` |
| Agent memories | `.claude/agent-memory/<agent-name>/` |
| Documentation | `docs/*.md` |

---

## Coding Guidelines

### General Principles
1. **Write for an AI audience** — Files here (SKILL.md, agent prompts, reference docs) become system prompts for LLMs. Be precise, specific, and avoid vague instructions.
2. **Prefer declarative over imperative** — Tell the skill what it *is* and *what it does*, not just a list of steps.
3. **Be specific about behavior** — Instead of "be helpful," say "when X happens, do Y."
4. **Keep files focused** — One concept per file in `references/`. One purpose per skill.

### Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Skills | lowercase-hyphenated | `janus-system`, `honest` |
| Agents | lowercase-hyphenated in `.claude/agents/` | `skill-author.md` |
| Reference files | lowercase-hyphenated | `concept-name.md` |
| Docs | lowercase-hyphenated in `docs/` | `skills.md`, `architecture.md` |

### Markdown & YAML Standards
- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language hints
- Use tables for structured data
- Maximum line length: 100 characters for prose
- **YAML Front Matter** (Required for skills and agents):
  ```yaml
  ---
  name: skill-name
  description: "One-line description. Use quotes."
  model: haiku  # for agents only
  memory: project  # for agents only
  ---
  ```

---

## Skill & Agent Authoring

### Skill File Structure
```
skill-name/
├── SKILL.md                  # Required: main system prompt
└── references/               # Optional: supporting docs
    ├── concept-1.md
    └── concept-2.md
```

### Writing SKILL.md
A good SKILL.md:
- Opens with identity statement (what the skill *is*)
- Defines slash commands with precise behavior
- Specifies tone, epistemic posture, interaction style
- Includes structured workflows or processes
- Closes with constraints or quality checks
- Length: 200–1500 lines

#### 💡 Reference Snippets: Command Definitions
**❌ BAD (Imperative/Vague)**
` /check: Check the last response for errors and tell the user if it's correct.`

**✅ GOOD (Declarative/Precise)**
` /check: Audit the last response for epistemic validity. Identify every claim, apply one of the four Sol labels ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]), and flag any unlabeled assertions. Output must follow the [CHECK] template.`

### Writing Agent Prompts
- Use the `<example>` pattern shown in existing agents for context
- Include a "Core Responsibilities" section
- Include a "Quality Checklist" before delivery
- Include the "Persistent Agent Memory" section with path
- Keep MEMORY.md guidance under 200 lines

### Error Handling in Skills
- Never use try/catch — this is prompt engineering, not code
- Define error states explicitly: "If the user asks X, respond with Y"
- Include fallback behaviors: "If uncertain, state uncertainty explicitly"

---

## Agent Roster

All agents are defined in `.claude/agents/` (markdown files with YAML front matter):

| Agent | File | Owns |
|---|---|---|
| `skill-author` | `.claude/agents/skill-author.md` | Skill authoring and packaging workflow |
| `project-coordinator` | `.claude/agents/project-coordinator.md` | PLAN.md; cross-agent coordination |
| `docs-architect` | `.claude/agents/docs-architect.md` | Technical docs, Mermaid diagrams |
| `ai-rd-visionary` | `.claude/agents/ai-rd-visionary.md` | AI architecture, hallucination/scheming risk |
| `brand-ux-architect` | `.claude/agents/brand-ux-architect.md` | Brand identity, naming, landing page |
| `systems-architect` | `.claude/agents/systems-architect.md` | Project structure, skill format, tooling |
| `constitution-keeper` | `.claude/agents/constitution-keeper.md` | Maintains constitution in sync with skill changes |

Agent memory persists in `.claude/agent-memory/<agent-name>/`.

---

## Development Workflow

### Adding or Updating a Skill
1. Author or edit the skill directory: `skills/<skill-name>/SKILL.md`
2. Add reference files if needed: `skills/<skill-name>/references/*.md`
3. Package: `cd skills && zip -r <skill-name>.skill <skill-name>/`
4. Update `docs/skills.md` with the new command table and any worked examples
5. Update `README.md` skills table if it's a new skill
6. Update `docs/index.md` navigation if it's a new skill

### Adding an Agent
1. Create `.claude/agents/<agent-name>.md` with YAML front matter (`name`, `description`, `model`) and a full system prompt body
2. Update `README.md` agents table
3. Update `AGENTS.md` agent roster above

### Planning
Active work tracked in `PLAN.md`. `project-coordinator` agent owns `PLAN.md`.

---

## Quality Checklist for Skills
Before delivering:
- [ ] Skill name follows naming conventions
- [ ] SKILL.md opens with clear identity statement
- [ ] All slash commands are defined with precise behavior
- [ ] Reference files cover topics with appropriate depth
- [ ] Archive structure correct: only `SKILL.md` and `references/` in zip
- [ ] `docs/skills.md` updated with new entry
- [ ] Tone consistent throughout

---

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**
1. **File issues for remaining work** - Use `gh issue create` for anything that needs follow-up.
2. **Run quality gates** (if code changed) - Tests, linters, builds.
3. **Update issue status** - Close finished work, update in-progress items.
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches.
6. **Verify** - All changes committed AND pushed.
7. **Hand off** - Provide a structured handoff summary in the session log.

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds.
- NEVER stop before pushing - that leaves work stranded locally.
- NEVER say "ready to push when you are" - YOU must push.
- If push fails, resolve and retry until it succeeds.
