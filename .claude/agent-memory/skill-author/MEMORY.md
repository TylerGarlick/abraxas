# skill-author Agent Memory — Abraxas

## Project Identity

- **Project name:** Abraxas
- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace (Python CLI phase retired)
- **Primary output artifact:** `.skill` archives in `skills/`

## Skill File Format

`.skill` files are zip archives with the following internal structure:

```
skill-name/
├── SKILL.md                  # Required: main system prompt for the skill
└── references/               # Optional: supporting markdown reference files
    ├── concept-name.md
    └── another-reference.md
```

**Packaging command:**
```bash
cd /path/to/skill-directory-parent && zip -r ../skills/skill-name.skill skill-name/
```

Archive contains only `SKILL.md` and `references/` — no extra files.

## Skill Library Inventory

| Skill | File | Domain | Archive Size |
|---|---|---|---|
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | Dream interpretation, shadow auditing, symbolic integration | ~16 KB |
| Janus System | `skills/janus-system.skill` | Epistemic dual-perspective architecture (Sol/Nox faces) | ~7.5 KB |

### Oneironautics Reference Files
- `SKILL.md` — 5-stage process (Reception → Mapping → Shadow Check → Descent → Integration)
- `references/janus-system.md` — Janus architecture integration
- `references/dream-reservoir.md` — Symbol and pattern storage
- `references/system-architecture.md` — Overall system design
- `references/command-suite.md` — Abraxas unified command suite

### Janus System Reference Files
- `SKILL.md` — Sol/Nox/Qualia Bridge epistemic protocol
- `references/janus-architecture.md` — Full architecture documentation

## Naming Conventions

- **Format:** lowercase-hyphenated
- **Style:** conceptually evocative — mythological, phenomenological, or domain-specific
- **Examples:**
  - `abraxas-oneironautics` = oneironautics (conscious dream navigation)
  - `janus-system` = Janus (Roman god of thresholds, two-faced duality)
- **Avoid:** generic names (`ai-helper`, `smart-tool`), product-style names, acronyms

## Skills Documentation

New skills must be added to `docs/skills.md` after packaging. Include: skill name, file path, archive size, purpose paragraph, and reference file inventory.

## Integration Notes

- The Janus System can operate as infrastructure beneath other skills (Oneironautics integrates it)
- Skills that benefit from epistemic rigor can reference or integrate `janus-system`
- New skills should declare whether they stand alone or build on existing skills
