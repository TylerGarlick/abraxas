# Project Router Skill

## Purpose
When a task is being created, automatically infer which repository/project it belongs to based on context clues in the task description. If the repository is unclear or ambiguous, ask T for clarification before spawning any subagent.

## When to Use
Triggered whenever T asks to create a task, add a task, or start implementing something. Runs during the task-preflight phase before definition-of-done is written.

## How It Works

### Step 1 — Parse the Task Description
Look for these signals in the task text:
- **Explicit repo mention** — "in Abraxas", "on the mission-control repo", "in curiosity-hour"
- **Project keywords** — certain names map to repos:
  - `abraxas` → tylergarlick/abraxas
  - `axiom` → tylergarlick/axiom
  - `mission-control` → tylergarlick/mission-control
  - `curiosity-hour` → tylergarlick/curiosity-hour
  - `outerspace` → tylergarlick/outerspace
  - `research` → tylergarlick/research
  - `biz-plans` → tylergarlick/biz-plans
- **Tech stack hints** — Python/ML → Abraxas, Node.js scripts → mission-control, etc.
- **Existing task context** — if previous tasks referenced a repo, likely same project

### Step 2 — Check Recent Memory
Before asking, check `memory/YYYY-MM-DD.md` for recent context about which repo was being worked on.

### Step 3 — Resolve or Ask
- **Clear match** → include the repo in the task context, no need to mention it
- **Ambiguous** → ask T: "Which repository should this task target?"  
- **No match at all** → ask T to specify

### Step 4 — Record in Task Metadata
Once confirmed, write the `repo` field in the task's `context.json`:
```json
{
  "repo": "tylergarlick/abraxas",
  "repoUrl": "https://github.com/tylergarlick/abraxas",
  "confidence": "high|medium|low",
  "reason": "explicit mention of abraxas in task description"
}
```

## Known Repository Mappings
```
tylergarlick/abraxas       → Abraxas (Python, ML, logos system)
tylergarlick/axiom         → Axiom (old version of MJ, archived)
tylergarlick/mission-control → Mission Control (OpenClaw task orchestration)
tylergarlick/curiosity-hour → Curiosity Hour (video/podcast project)
tylergarlick/outerspace    → Outerspace (project name)
tylergarlick/research      → Research (daily briefings repo)
tylergarlick/biz-plans     → Business plans
tylergarlick/mary-jane     → MJ's own config/skills backup
```

## Skill Placement
- Primary: `/home/ubuntu/.openclaw/skills/project-router/SKILL.md`
- Also committed to: `tylergarlick/mission-control` (via bootstrap repo)

## Memory Note
After creating the skill, update MEMORY.md to note its existence and purpose.
