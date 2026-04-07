# RESTRUCTURE.md - Repository Structure Changes

**Date:** 2026-04-07

## Changes Made

### 1. MCP Servers → packages/
Moved `mcp-servers/` to `packages/` for cleaner package organization.

### 2. Agent Definitions Consolidated
- Copied agent definitions from `.claude/agents/` and `.opencode/agent/` to `agents/`
- JavaScript agent implementations consolidated in `agents/` directory

### 3. Plans Archive Consolidated
- Moved archived plans from `plans/archive/` to `archive/plans/`

### 4. Duplicated Code Cleaned Up
- `src/logos/` only contained a subset of `skills/logos/`
- Moved `__init__.py` to `skills/logos/` to consolidate
- `src/` now only contains `logos/models.py`, `logos/parser.py`, `logos/svo_extractor.py` as a minimal subset

### 5. Gitignore Enhanced
Added Python-specific ignores, backup file patterns, and storage exclusions.

### 6. Storage Directory Created
- `skills/storage/` with `.gitkeep` for generated runtime files
- `memory/.gitkeep` added

### 7. Cache Files Removed
- Cleaned `__pycache__/` directories throughout

## Directory Structure (Root Level)

```
abraxas-checkout/
├── agents/           # Agent definitions and JS implementations
├── archive/           # Archived research, plans, completed work
├── assets/            # Logo and image assets
├── constitution/      # Constitutions (root-level as required)
├── docs/              # Documentation
├── frames/            # Session frame templates
├── packages/          # MCP servers (renamed from mcp-servers)
├── plans/             # Implementation plans
├── research/          # Research papers and reports
├── skills/            # Skills (root-level as required)
├── src/               # Minimal source code subset
├── tests/             # Test suite
└── [config files]    # README.md, PLAN.md, etc.
```

## Preserved Root-Level Items
- All constitutions remain in `/constitution/` at root
- All skills remain in `/skills/` at root
- Root config files: README.md, PLAN.md, AGENTS.md, CLAUDE.md, etc.

## Notes
- Duplication between `skills/logos/` and `src/logos/` not fully resolved (src may be legacy)
- `demos/ergon/` has some overlap with `src/systems/ergon/` but demos are kept separate
- Consider future cleanup of src/ directory if it's fully superseded by skills/