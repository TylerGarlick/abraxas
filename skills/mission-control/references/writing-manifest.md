# Writing Factory

## Purpose
Takes a writing task (or a research brief) and produces a written artifact.

## Input
- `task.json` in the task's working directory containing:
  - `type`: "original" | "from_research"
  - `objective`: What to write
  - `sourceBrief`: Path to brief.md (if from_research)
  - `format`: "markdown" | "html" | "document"
  - `outputFile`: Where to save the final output

## Output
- File at `outputFile` location
- Task status updated to `draft_ready`

## Factory Behavior
1. Creates working directory: `mission-control/tasks/{taskId}/writing/`
2. If `from_research`, reads `brief.md` from research stage
3. Spawns isolated agent with the writing objective
4. Agent writes to `outputFile`
5. Agent updates task status in `tasks.json` to `draft_ready`
6. If chained to Software Factory, notifies main session that draft is ready
