# Software Factory

## Purpose
Takes a software task (or a writeup) and produces working code.

## Input
- `task.json` in the task's working directory containing:
  - `type`: "original" | "from_writing"
  - `objective`: What to build
  - `specFile`: Path to spec/requirements (if from_writing)
  - `language`: e.g. "javascript", "python", "rust"
  - `outputDir`: Where to place the code

## Output
- Code in `outputDir`
- `README.md` with setup/run instructions
- Task status updated to `build_complete`

## Factory Behavior
1. Creates working directory: `mission-control/tasks/{taskId}/software/`
2. If `from_writing`, reads spec/requirements from writing stage
3. Spawns isolated agent with the build objective
4. Agent writes code to `outputDir`
5. Agent writes `README.md`
6. Agent updates task status in `tasks.json` to `build_complete`
7. Marks task as `done` when all stages complete
