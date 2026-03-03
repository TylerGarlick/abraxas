# Compatibility Sync Map

Last updated: 2026-03-03

## Overview

This file tracks cross-platform compatibility between Claude Code (`.claude/`) and OpenCode (`.opencode/`) artifacts.

## Translation Status

### Agents

| Claude Code | OpenCode | Status | Notes |
|-------------|----------|--------|-------|
| .claude/agents/skill-author.md | .opencode/agent/skill-author.md | ✓ synced | qwen3-coder-32b, mode: subagent |
| .claude/agents/project-coordinator.md | .opencode/agent/project-coordinator.md | ✓ synced | qwen3-coder-32b, mode: primary |
| .claude/agents/docs-architect.md | .opencode/agent/docs-architect.md | ✓ synced | qwen3-coder-32b, mode: subagent |
| .claude/agents/ai-rd-visionary.md | .opencode/agent/ai-rd-visionary.md | ✓ synced | qwen3-coder-32b, mode: subagent |
| .claude/agents/brand-ux-architect.md | .opencode/agent/brand-ux-architect.md | ✓ synced | qwen3-coder-32b, mode: subagent |
| .claude/agents/systems-architect.md | .opencode/agent/systems-architect.md | ✓ synced | qwen3-coder-32b, mode: subagent |
| .claude/agents/constitution-keeper.md | .opencode/agent/constitution-keeper.md | ✓ synced | qwen3-coder-32b, mode: subagent |
| .claude/agents/compatibility-keeper.md | .opencode/agent/compatibility-keeper.md | ✓ synced | qwen3-coder-32b, mode: subagent |

### Commands

No commands currently defined.

### Skills

| Skill | Compatible | Notes |
|-------|------------|-------|
| honest | ✓ | SKILL.md format is natively compatible |
| janus-system | ✓ | SKILL.md format is natively compatible |
| abraxas-oneironautics | ✓ | SKILL.md format is natively compatible |

## Translation Details

### Model Mapping
- Claude Code `model: haiku` → OpenCode `model: qwen/qwen3-coder-32b`
- Claude Code `model: sonnet` → OpenCode `model: qwen/qwen3-coder-32b`
- Claude Code `model: inherit` → OpenCode `model: qwen/qwen3-coder-32b`

### Default Settings
- `temperature: 0.2` for all agents
- `mode: subagent` for all except project-coordinator (mode: primary)

### Tool Permissions by Agent

| Agent | bash | edit | Notes |
|-------|------|------|-------|
| skill-author | false | true | File writing only |
| project-coordinator | true | true | Full access for coordination |
| docs-architect | false | true | Documentation work |
| ai-rd-visionary | false | false | Analysis only |
| brand-ux-architect | false | true | Design work |
| systems-architect | true | true | Project tooling |
| constitution-keeper | false | true | File editing |
| compatibility-keeper | false | true | Sync operations |

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
