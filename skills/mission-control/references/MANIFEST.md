# Research Factory

## Purpose
Takes a research task and produces a structured brief (findings, sources, conclusions).

## Input
- `task.json` in the task's working directory containing:
  - `objective`: What to research
  - `scope`: Breadth/depth expectations
  - `outputFormat`: How to present findings

## Output
- `brief.md` in the task's working directory
- Task status updated to `brief_ready`

## Factory Behavior
1. Creates working directory: `mission-control/tasks/{taskId}/research/`
2. Spawns isolated agent with the research objective
3. Agent writes findings to `brief.md`
4. Agent updates task status in `tasks.json` to `brief_ready`
5. If chained to Writing Factory, notifies main session that brief is ready
