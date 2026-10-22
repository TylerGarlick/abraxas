# Plan: Git Isolation and Project Boundary Reinforcement

## Objective
Prevent accidental git history merging, cross-project data bleed, and operational leakage between project channels and threads.

## 1. Technical Layer: Git Hard-Locking
**Goal**: Eliminate manual errors by replacing generic git commands with a validation-aware wrapper.

- **Remote-to-Path Mapping**: Maintain a strict mapping of:
  - `Project Name` $\rightarrow$ `Required Remote URL` $\rightarrow$ `Authorized Workspace Path`.
- **Pre-Flight Validation**: Before any `push`, `pull`, or `merge`, the system must verify:
  - Current Working Directory (`pwd`) matches the Authorized Workspace Path.
  - `git remote get-url origin` matches the Required Remote URL.
- **Hard Abort**: Any mismatch results in an immediate operation kill and alert.

## 2. Logical Layer: Context-Aware Routing
**Goal**: Ensure structural separation of work contexts.

- **Project-Siloed Subagents**: 
  - All `Task:` work must use isolated subagents.
  - Subagents initialized with restricted `cwd` and project-specific `taskName`.
- **Channel-to-Project Binding**:
  - Strict binding: e.g., `#abraxas` channel $\rightarrow$ `workspace/projects/abraxas/`.
  - Command execution for a project outside its bound channel will trigger a "Context Mismatch" alert.

## 3. Operational Layer: Session & Thread Discipline
**Goal**: Prevent cognitive and state leakage between conversations.

- **Thread Isolation**: Use thread-bound session spawns for feature-specific work to isolate "working memory" from the main project feed.
- **Sovereign Audit Sweep**: 
  - Implement a daily heartbeat check of `.git/config` files across all active projects.
  - Detect and flag any remote URL "drift" or accidental re-linking before push operations occur.
