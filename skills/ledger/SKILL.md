---
name: ledger
description: "A project and task management ledger for tracking work across the Abraxas system."
---

# Ledger Skill

The Ledger is the central source of truth for project tasks, tracking progress, and managing dependencies within the Abraxas project. It enables structured task management and ensures that work is sequenced correctly.

## Core Capabilities

The Ledger manages tasks as documents in ArangoDB and dependencies as edges in a graph.

### Task Lifecycle
Tasks typically move through the following statuses:
- `open`: Initial state, task defined.
- `ready`: All dependencies resolved, ready for implementation.
- `testing`: Implementation complete, awaiting verification.
- `closed`: Task completed and verified.

## Commands

### `create_task`
Creates a new entry in the ledger.
- **Arguments**: `title` (required), `project`, `scope`, `priority`.
- **Behavior**: Defaults status to `open` and initializes timestamps.

### `get_ready_tasks`
Retrieves a list of tasks that are actionable.
- **Behavior**: A task is considered "ready" if:
    1. Its status is explicitly set to `ready`.
    2. Its status is `open` AND it has no remaining `blocks` dependencies leading to tasks that are not `closed`.

### `update_task_status`
Transitions a task to a new state.
- **Arguments**: `id` (required), `status` (required: `open`, `ready`, `testing`, `closed`).

### `add_dependency`
Creates a directed edge between two tasks.
- **Arguments**: `child_id` (required), `parent_id` (required), `type` (defaults to `blocks`).
- **Behavior**: Indicates that `child_id` must be completed before `parent_id` can proceed.

## Implementation Details

- **Database**: ArangoDB.
- **Collections**: `tasks` (document), `task_edges` (edge).
- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ LedgerLogic).
