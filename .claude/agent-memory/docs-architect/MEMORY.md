# docs-architect Agent Memory — Abraxas

## Project Identity

- **Project name:** Abraxas
- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace
- **Git remote:** https://github.com/TylerGarlick/abraxas

## Current Project Structure

```
abraxas/
├── .claude/
│   ├── agents/docs-architect.md       # This agent's definition
│   └── agent-memory/docs-architect/   # This memory directory
├── docs/
│   ├── index.md                       # Documentation hub
│   ├── architecture.md                # Mermaid architecture diagrams
│   └── skills.md                      # Skills reference (5 skills documented)
├── skills/
│   ├── honest/SKILL.md                # Everyday anti-hallucination (9 commands)
│   ├── agon/SKILL.md                  # Structured adversarial reasoning (8 commands)
│   ├── aletheia/SKILL.md              # Epistemic calibration practice (7 commands)
│   ├── janus-system/SKILL.md          # Dual-face epistemic infrastructure (19 commands)
│   └── abraxas-oneironautics/SKILL.md # Dream work and alchemical practice (35 commands)
├── CLAUDE.md                          # Claude Code project instructions
├── PLAN.md                            # Shared task board for all agents
└── README.md                          # Project overview
```

## Skills Roster (as of Mar 2026)

| Skill | Filename | Commands | Purpose | Etymology |
|---|---|---|---|---|
| **Honest** | `honest.skill` | 9 | Everyday anti-hallucination, plain language | English virtue |
| **Agon** | `agon.skill` | 8 | Structured adversarial reasoning | Greek: sacred contest |
| **Aletheia** | `aletheia.skill` | 7 | Epistemic calibration & ground-truth tracking | Greek: un-hiddenness/disclosure |
| **Janus System** | `janus-system.skill` | 19 | Dual-face epistemic infrastructure | Latin: two-faced Roman god |
| **Abraxas Oneironautics** | `abraxas-oneironautics.skill` | 35 | Dream work & alchemical integration | Gnostic: totality; Greek: dream navigation |

## Documentation Files Created

| File | Status | Purpose |
|---|---|---|
| `/README.md` | Written Feb 2026 | Project overview, skills table, agents table, workflow |
| `/docs/index.md` | Written Feb 2026 | Documentation hub, navigation table, doc map |
| `/docs/architecture.md` | Written Feb 2026 | Current + historical Mermaid diagrams |
| `/docs/skills.md` | Updated Mar 2026 | Skills reference — now covers 5 skills: Honest, Agon, Aletheia, Janus, Abraxas Oneironautics |

## Key Facts

- `.skill` files are zip archives containing `SKILL.md` and optional reference files
- Agent definitions in `.claude/agents/` use YAML front matter + markdown body
- `PLAN.md` is the shared task board; all agents coordinate through it

## Mermaid Conventions Used

- `flowchart TD` — component/architecture diagrams (top-down)
- `flowchart LR` — CLI command trees (left-right)
- `sequenceDiagram` — lifecycle and data flow sequences
- `graph TD` — module dependency graphs
- Italic caption below each diagram block

## Linking Conventions

- README links to docs with `./docs/filename.md`
- Docs cross-link with `./filename.md` (within docs/) or `../README.md` (up to root)
- All links are relative, not absolute

## Documentation Patterns for Skills

**Structure for skill docs in `docs/skills.md`:**
1. Skill name and archetype (1 para: what it is, its origin, what problem it solves)
2. ### Skill Overview section (problem, use cases, constraints)
3. ### Skill Command Reference (installation, command table with syntax & purpose)
4. ### Skill Worked Examples (2-4 detailed, realistic examples showing usage patterns)
5. ### Integration Notes (how it connects to other skills in the family)

**Agon documentation added:**
- 4 worked examples: tech claim debate, high-convergence detection, steelmanning weak claims, bridge integration
- Emphasizes position asymmetry, Convergence Report output, Threshold routing for Nox material
- Integration notes cover standalone mode and within-Abraxas layer mode

**Aletheia documentation added:**
- 5 worked examples: confirming claims, disconfirming with actual findings, checking calibration over time, seeing unresolved claims, auditing data integrity
- Emphasizes personal epistemic feedback loop, calibration tracking by label type
- Integration with Janus (required), Honest, Agon, Abraxas Oneironautics

**Table of Contents maintained:**
- All 5 skills now in ToC with subsection anchors
- Installation section lists all 5 skills
- Summary table at top ranks skills by command count and archive size

## Notes

- The Write tool was blocked on first attempt for README.md; Edit tool succeeded after chmod confirmed permissions were already correct. Use Edit tool for existing files.
- Skills documentation should always reference the SKILL.md files in `skills/{skill-name}/SKILL.md` — these are authoritative
- When adding new skills, update: ToC, Installation section, summary table, then add full sections before the "Getting Started (Janus and Abraxas)" divider
