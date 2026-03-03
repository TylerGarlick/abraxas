# Compatibility Sync Map

Last updated: 2026-03-03

## Overview

This file tracks cross-platform compatibility between Claude Code (`.claude/`) and OpenCode (`.opencode/`) artifacts.

## Translation Status

### Agents

| Claude Code | OpenCode | Status | Notes |
|-------------|----------|--------|-------|
| .claude/agents/skill-author.md | .opencode/agent/skill-author.md | pending | Needs translation |
| .claude/agents/project-coordinator.md | .opencode/agent/project-coordinator.md | pending | Needs translation |
| .claude/agents/docs-architect.md | .opencode/agent/docs-architect.md | pending | Needs translation |
| .claude/agents/ai-rd-visionary.md | .opencode/agent/ai-rd-visionary.md | pending | Needs translation |
| .claude/agents/brand-ux-architect.md | .opencode/agent/brand-ux-architect.md | pending | Needs translation |
| .claude/agents/systems-architect.md | .opencode/agent/systems-architect.md | pending | Needs translation |
| .claude/agents/constitution-keeper.md | .opencode/agent/constitution-keeper.md | pending | Needs translation |
| .claude/agents/compatibility-keeper.md | .opencode/agent/compatibility-keeper.md | pending | Needs translation |

### Commands

No commands currently defined.

### Skills

| Skill | Compatible | Notes |
|-------|------------|-------|
| honest | ✓ | SKILL.md format is natively compatible |
| janus-system | ✓ | SKILL.md format is natively compatible |
| abraxas-oneironautics | ✓ | SKILL.md format is natively compatible |

## Known Issues

- Claude Code uses `model: inherit` / `model: haiku` — OpenCode requires explicit model
- Claude Code uses tool lists — OpenCode requires boolean flags
- Claude Code has implicit permissions — OpenCode requires explicit permissions
- Claude Code agents don't specify `mode` — OpenCode requires `mode: subagent` or `mode: primary`

## Translation Patterns

### Model Mapping
- `model: inherit` → `model: anthropic/claude-3-5-sonnet-20241022`
- `model: haiku` → `model: anthropic/claude-haiku-2024-05-22`

### Tool Mapping
- `tools: Read` → `read: true`
- `tools: Write` → `write: true`
- `tools: Edit` → `edit: true`
- `tools: Bash` → `bash: true`
- `tools: Grep` → `grep: true`
- `tools: Glob` → `glob: true`

## Run Commands

```bash
# Audit compatibility
/audit

# Generate OpenCode variants
/sync

# Check status
/status
```

## Logs

Detailed translation logs are stored in:
- `.claude/agent-memory/compatibility-keeper/translation-log.md`
