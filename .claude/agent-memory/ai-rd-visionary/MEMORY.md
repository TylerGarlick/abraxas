# ai-rd-visionary Agent Memory — Abraxas

## Project Identity

- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace (Python CLI phase retired)
- **AI stack:** Claude Code / Claude API (Anthropic) — not OpenAI, not Gemini
- **Primary Claude model in use:** claude-sonnet-4-6 (as of Feb 2026)

## Skill Library and Thematic Domains

| Skill | File | AI/Epistemic Domain |
|---|---|---|
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | Symbolic reasoning, Jungian shadow work, multi-session continuity |
| Janus System | `skills/janus-system.skill` | Epistemic architecture: Sol face (truth discipline), Nox face (creative freedom), anti-hallucination labeling |

The Janus System is particularly relevant to this agent's mandate: its `[KNOWN]` / `[INFERRED]` / `[UNCERTAIN]` / `[UNKNOWN]` labeling system is an implemented anti-hallucination protocol worth referencing when designing new epistemic features.

## Agent Roster

| Agent | Domain |
|---|---|
| `skill-author` | Authoring and packaging `.skill` archives |
| `project-coordinator` | PLAN.md, cross-agent coordination, meta-layer |
| `docs-architect` | Technical documentation and Mermaid diagrams |
| `ai-rd-visionary` | AI model/agent architecture, hallucination/scheming risk **(this agent)** |
| `brand-ux-architect` | Brand identity, naming, aesthetic coherence |
| `systems-architect` | Project structure, tooling, skill format, distribution |

## Division of Labor Boundary

**This agent owns:** AI model selection, agent behavioral design, hallucination/scheming risk assessment, alignment and safety tradeoffs, evaluation of new AI techniques for adoption.

**systems-architect owns:** Project file structure, `.skill` format, distribution mechanisms, tooling, component integration. For structural questions with AI implications, consult both agents.

## Key Established Decisions

- Claude API (Anthropic) is the platform — no multi-provider abstraction is planned
- Agent memory is markdown-based (MEMORY.md max 200 lines, loaded into system prompt)
- Skills are static files (no runtime hooks or tool-use within skills currently)
- Agents use `model: sonnet` by default; Opus not used (cost/latency tradeoff)
