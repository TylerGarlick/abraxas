---
name: story-workflow
description: >
  Explore → Plan → Implement → Validate workflow for Mission Control tasks.
  Use when T assigns a task that needs full SDLC lifecycle, or when retrofitting
  existing tasks with story files. Creates story files in /docs/stories/ per repo,
  tracks phase in Beads metadata, and manages the complete workflow.
---

# Story Workflow

## Core Principle
Every task that needs design, planning, or multi-step implementation follows:
**Explore → Plan → Implement → Validate**

Stories live in `/docs/stories/` in each repository. Files update in place through phases.

## Story File Naming
`/<repo>/docs/stories/<id>-<slug>.md`

Example: `mc-1jm-janus-parallel-tools.md`

## Story Template

```markdown
# Story: <id> — <title>

**Persona:** <As X, I want Y, so that Z>
**Task:** `<bd-id>`
**Phase:** explore | plan | implement | validate | archived
**Created:** <YYYY-MM-DD>
**Updated:** <YYYY-MM-DD>

---

## Context & Discovery (Explore)

*What we know, what we learned during exploration.*

## Intent (As a / I want / So that)

- **As a:** <persona>
- **I want:** <verb + object>
- **So that:** <desired outcome>

## Gap Analysis

*What are we missing? What's unclear? What could go wrong?*

## Acceptance Criteria (Given / When / Then)

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

## Spec (Plan)

*Detailed technical specification — written for another coding agent.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
```

## Phase Tracking in Beads

Each task has a `phase` metadata field:
```
phase: explore | plan | implement | validate | archived
```

Update phase:
```bash
bd update <id> --set-metadata '{"phase":"plan","story_file":"<path>"}'
```

When a task is closed and archived:
```bash
bd update <id> --set-metadata '{"phase":"archived","story_file":"<path>"}'
```

## Workflow Steps

### 1. Explore (phase: explore)
- Read codebase, understand existing patterns
- Add context to the story file
- Identify unknowns and gaps
- Update: `bd update <id> --set-metadata '{"phase":"explore"}'`

### 2. Plan (phase: plan)
- Define persona + intent (As a / I want / So that)
- Write acceptance criteria (Given / When / Then)
- Conduct gap analysis — what are we missing?
- Write spec for another coding agent
- Update: `bd update <id> --set-metadata '{"phase":"plan","story_file":"<path>"}'`

### 3. Implement (phase: implement)
- Spawn subagent with story file context
- Implementation notes go in the story
- Update: `bd update <id> --set-metadata '{"phase":"implement"}'`

### 4. Validate (phase: validate)
- Walk through the new functionality against the plan
- Confirm acceptance criteria are met
- Update: `bd update <id> --set-metadata '{"phase":"validate"}'`

### 5. Close & Archive
- Move story to `/docs/stories/archived/<id>-<slug>.md`
- Update: `bd update <id> --status closed --set-metadata '{"phase":"archived"}'`

## Repo Paths (for /docs/stories/ creation)

| Repo | Path |
|------|------|
| abraxas | `/tmp/abraxas-checkout/` |
| amplify-checkout | `/tmp/amplify-checkout/` |
| outerspace | `/tmp/outerspace/outerspace/` |
| curiosity-hour | clone on demand |
|  | `/home/ubuntu/.openclaw/workspace/mc/` |

## Bootstrap

When `/docs/stories/` doesn't exist in a repo:
```bash
mkdir -p <repo-path>/docs/stories
mkdir -p <repo-path>/docs/stories/archived
```

## Story ID Format

File ID = Beads task ID (e.g., `mc-1jm`)
Slug = lowercase hyphenated title (e.g., `janus-parallel-tools`)
Full: `mc-1jm-janus-parallel-tools.md`
