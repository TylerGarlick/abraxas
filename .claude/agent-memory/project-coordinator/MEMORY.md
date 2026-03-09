# project-coordinator Agent Memory — Abraxas

## Project Identity

- **Project name:** Abraxas
- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace
- **Git remote:** https://github.com/TylerGarlick/abraxas

## Meta-Layer Files

| File | Purpose | Update Frequency |
|---|---|---|
| `PLAN.md` | Shared task board for all agents | Frequently |
| `RELEASES.md` | Completed tasks from the `PLAN.md` that have been completed | Frequently |
| `README.md` | Project overview, agent roster, skills table | When roster or structure changes |
| `docs/index.md` | Documentation hub and navigation | When docs or roster changes |
| `CLAUDE.md` | Claude Code project instructions | Rarely |

## Agent Roster (7 agents)

| Agent | File | Domain |
|---|---|---|
| `skill-author` | `.claude/agents/skill-author.md` | Authoring and packaging `.skill` archives |
| `project-coordinator` | `.claude/agents/project-coordinator.md` | PLAN.md, cross-agent coordination, meta-layer |
| `docs-architect` | `.claude/agents/docs-architect.md` | Technical documentation and Mermaid diagrams |
| `ai-rd-visionary` | `.claude/agents/ai-rd-visionary.md` | AI model/agent architecture, hallucination/scheming risk |
| `brand-ux-architect` | `.claude/agents/brand-ux-architect.md` | Brand identity, naming, aesthetic coherence, future UI |
| `systems-architect` | `.claude/agents/systems-architect.md` | Project structure, tooling, skill format, distribution |
| `constitution-keeper` | `.claude/agents/constitution-keeper.md` | Maintains CONSTITUTION.md in sync with skill changes |

## Current Project Status (March 2026)

- **Phase 2 (Accessibility)** complete: Honest skill (9 commands), CONSTITUTION.md (58 commands), constitution-keeper agent, docs refreshed
- **Phase 3 (Dialogue Engine & Veritas)** substantially complete: Agon and Aletheia shipped, CONSTITUTION.md extended, docs updated
- Five `.skill` archives shipped: honest, janus-system (14 commands), agon (8 commands), aletheia (7 commands), abraxas-oneironautics (35 commands)
- Seven agents fully defined

## Skill Library (Current)

| Skill | File | Commands | Domain |
|---|---|---|---|
| `honest` | `skills/honest.skill` | 9 | Everyday anti-hallucination, plain language |
| `janus-system` | `skills/janus-system.skill` | 14 | Epistemic dual-face (Sol/Nox), Threshold routing, Qualia Bridge |
| `agon` | `skills/agon.skill` | 8 | Structured adversarial reasoning, Advocate/Skeptic, Convergence Report |
| `aletheia` | `skills/aletheia.skill` | 7 | Epistemic calibration, ground-truth tracking, claim resolution |
| `abraxas-oneironautics` | `skills/abraxas-oneironautics.skill` | 35 | Dream interpretation, alchemical practice |

## Phase 3 — Dialogue Engine & Veritas (2026-03-05 decomposed)

**Dialogue Engine build sequence:**
1. ai-rd-visionary writes spec: position asymmetry constraints, Convergence Report format, Threshold routing rules, failure-mode detection
2. brand-ux-architect names skill, validates aesthetic fit with Abraxas family
3. skill-author writes SKILL.md with 14+ commands, position constraint spec, behavioral guardrails
4. skill-author packages and validates asymmetric position behavior works
5. docs-architect adds Dialogue Engine section to docs/skills.md
6. constitution-keeper extends CONSTITUTION.md with Dialogue Engine commands and syncs

**Veritas build sequence:**
1. systems-architect researches `~/.janus/` schema, identifies extension points (resolution_status, resolution_date, resolution_note)
2. ai-rd-visionary writes spec: frictionless resolution commands (2-sec act), open-debt surfacing, disconfirmation tracking, Nox scoping
3. brand-ux-architect names skill, validates aesthetic fit
4. skill-author writes SKILL.md with resolution commands, ledger persistence, Nox redirect logic
5. skill-author packages and validates ledger persistence, disconfirmation rate flagging
6. docs-architect adds Veritas section to docs/skills.md
7. constitution-keeper extends CONSTITUTION.md with Veritas commands and syncs

**Long-term sequence (after Veritas):**
- Synthesis skill (session-closing artifact generator)
- Scribe skill (source-grounded citation management)
- Retrieval grounding layer (first tool-use dependency)
- Oneironautics v2 + Individuation Ledger

## PLAN.md Format Convention

```markdown
## [Category Name]

- [ ] [Specific actionable task] — **Agent:** agent-name — **Status:** pending
- [ ] [Blocked task] — **Agent:** agent-name — **Blocked:** reason
- [x] [Completed task] — **Agent:** agent-name
```
