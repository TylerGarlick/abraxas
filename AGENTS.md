# AGENTS.md — Agent Coding Guidelines for Abraxas

This file provides coding guidelines for agents operating in the Abraxas repository.

---

## Project Overview

Abraxas is a container for three AI systems (Janus, Honest, Abraxas Oneironautics) packaged as Claude Code skills, along with six specialized subagents. The project is primarily **documentation and skill authoring** — not traditional software development.

---

## Build, Test, and Lint Commands

### Skill Packaging (the "build" command)

```bash
# Package a skill directory into a .skill archive
cd skills && zip -r skill-name.skill skill-name/
```

### Development Commands

```bash
# No traditional tests exist — skills are validated by manual invocation
# No linting — markdown-only project
# No build system — skills are zip archives
```

### Documentation

- `docs/skills.md` — Command reference for all skills
- `docs/architecture.md` — System architecture with Mermaid diagrams
- `docs/index.md` — Documentation hub

---

## Code Style Guidelines

### General Principles

1. **Write for an AI audience** — Files here (SKILL.md, agent prompts, reference docs) become system prompts for LLMs. Be precise, specific, and avoid vague instructions.
2. **Prefer declarative over imperative** — Tell the skill what it *is* and *what it does*, not just a list of steps.
3. **Be specific about behavior** — Instead of "be helpful," say "when X happens, do Y."
4. **Keep files focused** — One concept per file in references/. One purpose per skill.

### File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Skills | lowercase-hyphenated | `janus-system`, `honest`, `abraxas-oneironautics` |
| Agents | lowercase-hyphenated in `.claude/agents/` | `skill-author.md`, `project-coordinator.md` |
| Reference files | lowercase-hyphenated | `concept-name.md`, `qualia-bridge.md` |
| Docs | lowercase-hyphenated | `skills.md`, `architecture.md` |

### Markdown Standards

- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language hints
- Tables for structured data (commands, file maps)
- Horizontal rules (`---`) for section breaks
- Maximum line length: 100 characters for prose

### YAML Front Matter

Required for skills and agents:

```yaml
---
name: skill-name
description: "One-line description. Use quotes."
model: haiku  # for agents only
memory: project  # for agents only
---
```

Optional fields for skills:
- `argument-hint`
- `compatibility`
- `disable-model-invocation`
- `license`
- `metadata`
- `user-invokable`

### Skill File Structure

```
skill-name/
├── SKILL.md                  # Required: main system prompt
└── references/               # Optional: supporting docs
    ├── concept-1.md
    └── concept-2.md
```

### Agent File Structure

```markdown
---
name: agent-name
description: "..."
model: haiku
memory: project
---

[System prompt content]
```

### Writing SKILL.md

A good SKILL.md:
- Opens with identity statement (what the skill *is*)
- Defines slash commands with precise behavior
- Specifies tone, epistemic posture, interaction style
- Includes structured workflows or processes
- Closes with constraints or quality checks
- Length: 200–1500 lines

### Writing Agent Prompts

- Use the `<example>` pattern shown in existing agents for context
- Include a "Core Responsibilities" section
- Include a "Quality Checklist" before delivery
- Include the "Persistent Agent Memory" section with path
- Keep MEMORY.md guidance under 200 lines

### Error Handling in Skills

- Never use try/catch — this is prompt engineering, not code
- Instead, define error states explicitly: "If the user asks X, respond with Y"
- Include fallback behaviors: "If uncertain, state uncertainty explicitly"

### Quality Checklist for Skills

Before delivering:
- [ ] Skill name follows naming conventions
- [ ] SKILL.md opens with clear identity statement
- [ ] All slash commands are defined with precise behavior
- [ ] Reference files cover topics with appropriate depth
- [ ] Archive structure correct: only `SKILL.md` and `references/` in zip
- [ ] `docs/skills.md` updated with new entry
- [ ] Tone consistent throughout

---

## Key File Locations

| Purpose | Path |
|---|---|
| Project context for Claude | `CLAUDE.md` |
| Behavioral specification | `CONSTITUTION.md` |
| Active roadmap | `PLAN.md` |
| Skills source | `skills/<skill-name>/` |
| Packaged skills | `skills/*.skill` |
| Agent definitions | `.claude/agents/*.md` |
| Agent memories | `.claude/agent-memory/<agent-name>/` |
| Documentation | `docs/*.md` |

---

## Workflow Summary

1. **Skills**: Edit in `skills/<name>/`, then package with `zip`
2. **Agents**: Edit in `.claude/agents/<name>.md`
3. **Docs**: Edit in `docs/`, update `docs/index.md` for new docs
4. **Memory**: Update agent memory files in `.claude/agent-memory/`

---

## What NOT to Do

- Don't create Python, JavaScript, or other code files — this is a skills/docs project
- Don't add build tooling (npm, cargo, etc.) — unnecessary
- Don't create tests — skills are validated manually
- Don't use linters — markdown has no standard linter
- Don't deviate from naming conventions
- Don't create files outside the established structure without approval
