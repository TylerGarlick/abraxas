# Abraxas Skills Reference

This document highlights skill relationships and selected skills. The maintained source catalog
is [`skills/README.md`](../../skills/README.md), which links to the skill source files.

## Core Skills

### Tasks (historically documented as Ledger)

- **Path**: [`skills/ledger/SKILL.md`](../../skills/ledger/SKILL.md)
- **Current source name**: `tasks`
- **Purpose**: Project and task management with progress tracking and dependencies.
- **Legacy details**: The Ledger name, `/ledger` commands, and `ledger-mcp`/the graph database backend
  below were documented previously. Verify them against the current skill and runtime before use.
- **Previously documented commands**: `/ledger create`, `/ledger ready`, `/ledger update`,
  `/ledger dep`, `/ledger show`.
- **Previously documented backend**: `ledger-mcp` (the graph database).

## Specialized Skills

### Abraxas Alias
- **Path**: [`skills/abraxas-alias/SKILL.md`](../../skills/abraxas-alias/SKILL.md)
- **Purpose**: Semantic gateway providing intuitive, namespaced aliases (`/abraxas:`) for all Greek-named systems.
- **Key Commands**: `/abraxas:honest`, `/abraxas:debate`, `/abraxas:analyze`, `/abraxas:dream`, `/abraxas:status`.

## Additional skills

The skills source tree contains more capabilities than this short reference previously covered.
Use the [complete source catalog](../../skills/README.md) for the full list. The following source
pages were not represented in the earlier Ledger/Alias-only overview:

| Skill | Purpose | Source |
| --- | --- | --- |
| [Metanoia](../../skills/metanoia/SKILL.md) | Recursive self-evolution of stress-test parameters and composition workflows. | `skills/metanoia/SKILL.md` |
| [Mnemosyne Memory MCP](../../skills/mnemosyne/SKILL.md) | Long-term storage for verified truth fragments and provenance. | `skills/mnemosyne/SKILL.md` |
| [Sieve](../../skills/sieve_pkg/SKILL.md) | Filters noise and curates epistemic signals. | `skills/sieve_pkg/SKILL.md` |
| [Sovereign Anchor](../../skills/sovereign_anchor/SKILL.md) | Privileged write operation for immutable Genesis Blocks. | `skills/sovereign_anchor/SKILL.md` |
| [Tasks](../../skills/ledger/SKILL.md) | Project and task management. | `skills/ledger/SKILL.md` |