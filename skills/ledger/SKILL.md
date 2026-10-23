---
name: tasks
description: "A project and task management system for tracking work across the Abraxas system."
---

# Tasks Skill

The Tasks skill is the central source of truth for project tasks, tracking progress, and managing dependencies within the Abraxas project. It enables structured task management and ensures that work is sequenced correctly.

## Core Capabilities

The Tasks skill manages tasks as documents in  and dependencies as edges in a graph.

### Task Lifecycle
Tasks typically move through the following statuses:
- `open`: Initial state, task defined.
- `ready`: All dependencies resolved, ready for implementation.
- `testing`: Implementation complete, awaiting verification.
- `closed`: Task completed and verified.

## Commands

### `create_task`
Creates a new entry in the tasks system.
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

Tasks, dependency edges, and retrospectives use collections in the shared JSON-backed store. A blocking edge points from the child/blocker to the parent/blocked task.

## MCP tools

The shared TypeScript MCP server exposes `create_task`, `get_ready_tasks`, `update_task_status`, `add_dependency`, `get_task`, `get_all_tasks`, `delete_task`, and `get_tasks_by_project`. Tasks and blocking dependency edges persist in the shared JSON-backed store. Closing a task automatically creates one retrospective.
