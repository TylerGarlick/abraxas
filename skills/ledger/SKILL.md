---
name: ledger
description: "Distributed graph task tracker for AI agents. Manages a dependency-aware ledger of tasks across projects using a graph database."
---

# Ledger Skill

The Ledger is the central operating record for the Abraxas system's evolutionary progress. It transforms linear todo lists into a dependency-aware knowledge graph, allowing agents to navigate long-horizon goals without losing context.

## Identity
The Ledger is a **Graph-Based Memory Manager**. It does not just track "what to do," but "why it must be done" and "what it unlocks." It treats tasks as nodes and dependencies as edges in a directed acyclic graph (DAG).

## Behavioral Guidance
- **Anti-Fragmentation**: Always group tasks by `project` and `scope`.
- **Blocker Awareness**: A task is only "Ready" when all its blocking dependencies are `closed`.
- **Lifecycle Discipline**: Transitioning a task to `closed` is not the end; it is the trigger for a retrospective.

## Command Suite

### /ledger create <title> [--project <p>] [--scope <s>] [--priority <priority>]
Create a new record in the ledger.
- **Action**: Calls `ledger` MCP `create_task`.
- **Behavior**: If project is omitted, use the current active project context. Default status is `open`.

### /ledger ready
Display all tasks available for immediate action.
- **Action**: Calls `ledger` MCP `get_ready_tasks`.
- **Behavior**: Lists tasks that are `ready` or `open` without active blockers.

### /ledger update <id> --status <status>
Update the state of a task.
- **Action**: Calls `ledger` MCP `update_task_status`.
- **Behavior**: 
    - Valid statuses: `open`, `ready`, `testing`, `closed`.
    - **CRITICAL**: When status is set to `closed`, the agent MUST immediately invoke `/retro <id>` from the `retrospectives` skill to capture the outcome and lessons learned.

### /ledger dep <child_id> <parent_id> [--type <type>]
Establish a relationship between two tasks.
- **Action**: Calls `ledger` MCP `add_dependency`.
- **Behavior**: 
    - Default type is `blocks`.
    - Use `parent_of` for hierarchical breakdowns.

### /ledger show <id>
Inspect a task and its local graph neighborhood.
- **Action**: Calls `ledger` MCP `get_task_details`.
- **Behavior**: Shows the task, its current status, and any tasks it blocks or is blocked by.

## Workflow Integration

1. **Finding Work**: On session start, run `/ledger ready` to identify the next logical step in the project graph.
2. **Task Breakdown**: Use `/ledger dep` to break a large epic into manageable subtasks.
3. **Closing the Loop**: 
   - Update status to `closed` $\rightarrow$ `/retro <id>`.
   - The retrospective should feed back into the ledger if new tasks are discovered during the retro.

## Constraints
- Do not mark a task as `closed` if it has open subtasks that are not `closed`.
- Ensure `project` and `scope` are consistently named across related tasks to maintain graph coherence.
