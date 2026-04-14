---
name: beads-auto-task
description: >
  Automatically creates Beads tasks from conversation. Triggers on patterns like
  "T: task name", "task: do something", "TODO:", "todo:". Extracts priority,
  labels, and dependencies. Spawns subagents intelligently for batch work.
  
  Triggers: "T:", "task:", "TODO:", "todo:", "add task", "create task"
---

# Beads Auto-Task Skill

Automatically intercepts task requests and creates beads with intelligent delegation.

## Trigger Patterns

```
T: <task description>
task: <task description>
TODO: <task description>
todo: <task description>
Add task: <task description>
Create task: <task description>
```

## Priority Extraction

Parse from prompt or infer:
- `-p 0` or `P0` / `URGENT` / `ASAP` → P0
- `-p 1` or `P1` / `HIGH` → P1
- `-p 2` or `P2` / `MEDIUM` → P2 (default)
- `-p 3` or `P3` / `LOW` → P3

## Auto-Create Bead

```python
import subprocess, os, re

BEADS = "/usr/local/bin/bd"
CWD = "/root/.openclaw/workspace/projects/mary-jane"
ENV = {**os.environ, "DOLT_AUTO_COMMIT": "on"}

def create_bead(title, priority=2, labels=None, parent=None):
    """Create a bead and optionally link to parent."""
    cmd = [BEADS, "create", title, "-p", str(priority)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=CWD, env=ENV)
    
    if r.returncode != 0:
        return None
    
    # Extract bead ID from output (e.g., "mary-jane-1cn")
    match = re.search(r'(mary-jane-[a-z0-9]+)', r.stdout)
    bead_id = match.group(1) if match else None
    
    # Link to parent if specified
    if bead_id and parent:
        subprocess.run([BEADS, "link", bead_id, parent], capture_output=True, cwd=CWD, env=ENV)
    
    return bead_id
```

## Intelligent Spawning Decision Engine

```python
def decide_execution(tasks):
    """
    Returns: {'mode': 'subagent'|'main', 'count': N, 'timeout': seconds}
    
    Decision matrix:
    - 1 task, simple → main session (120s timeout)
    - 1 task, research needed → subagent (600s timeout)
    - 2 tasks → main session (parallel exec)
    - 3-5 tasks → 2-3 subagents (300s each)
    - 6-10 tasks → 5 subagents max (600s each)
    - 10+ tasks → batch with coordinator (900s timeout)
    """
    
    if not tasks:
        return {'mode': 'main', 'count': 1, 'timeout': 120}
    
    if len(tasks) == 1:
        task = tasks[0]
        if task.get('needs_research') or task.get('complexity') == 'high':
            return {'mode': 'subagent', 'count': 1, 'timeout': 600}
        return {'mode': 'main', 'count': 1, 'timeout': 120}
    
    if len(tasks) <= 2:
        return {'mode': 'main_parallel', 'count': len(tasks), 'timeout': 300}
    
    if len(tasks) <= 5:
        return {'mode': 'subagent', 'count': min(3, len(tasks)), 'timeout': 300}
    
    if len(tasks) <= 10:
        return {'mode': 'subagent', 'count': 5, 'timeout': 600}
    
    # 10+ tasks - coordinator pattern
    return {'mode': 'coordinator', 'count': 5, 'timeout': 900}
```

## Batch Subagent Spawning

```python
def spawn_batch_workers(tasks, n_workers=3):
    """Split tasks among N subagents."""
    chunk_size = max(1, len(tasks) // n_workers)
    chunks = [tasks[i:i+chunk_size] for i in range(0, len(tasks), chunk_size)]
    
    spawned = []
    for i, chunk in enumerate(chunks[:n_workers]):
        task_list = "\n".join([f"- {t['title']}" for t in chunk])
        subagent = sessions_spawn(
            task=f"""Process these tasks:\n{task_list}\n\nFor each:
1. Run: bd create "<title>" -p <priority>
2. Report bead IDs created""",
            runtime="subagent",
            timeoutSeconds=300,
            label=f"batch-worker-{i+1}"
        )
        spawned.append(subagent)
    
    return spawned
```

## Workflow Examples

### Example 1: Single Simple Task (Main Session)
```
User: "T: Check the git status"
→ create_bead("Check the git status", priority=2)
→ Handle inline: subprocess.run(['git', 'status'])
→ Update bead to closed
```

### Example 2: Single Research Task (Subagent)
```
User: "T: Research competitor pricing - P1"
→ create_bead("Research competitor pricing", priority=1)
→ Spawn subagent with research task, 10min timeout
→ Subagent reports back, bead updated to delivered
```

### Example 3: Batch Tasks (Multiple Subagents)
```
User: "Create tasks for:
- T: Generate portrait images
- T: Update gallery README  
- T: Commit to git
- T: Push changes"
→ create_bead() for each
→ Decision: 4 tasks → spawn 2 subagents
→ Subagent 1 handles: Generate + Update README
→ Subagent 2 handles: Commit + Push
```

### Example 4: Large Batch (Coordinator Pattern)
```
User: "Create 15 task tickets for the sprint"
→ Create coordinator bead
→ Spawn 5 subagents, each handling 3 tasks
→ Coordinator aggregates results
→ Update main bead with all child IDs
```

## Auto-Retrospective on Close

After `mark_complete(bead_id)`, automatically prompt for retrospective:

```python
def prompt_retro_on_close(bead_id: str, title: str):
    """
    After closing a bead, ask user if they want a retro.
    If yes, create the retrospective file.
    """
    print(f"\n✅ Task completed: {title} ({bead_id})")
    print(f"📝 Quick retro? Say 'yes' to document learnings")
    
    # In practice, this is handled by the agent prompting the user
    # User can say: "yes" / "nah" / "skip"
    
    # If yes, call retrospective.py:
    # subprocess.run([
    #     'python3', 
    #     '/root/.openclaw/workspace/scripts/retrospective.py',
    #     'task', bead_id, title, '--channel', '#mary-jane'
    # ])
```

## Memory Integration

On each session start, check for:
```python
# Check beads-integration skill notes
# Query for tasks assigned to Mary Jane
bd list --assignee mary-jane --status open
```

## Error Handling

- If `bd` fails: Log error, create fallback JSON in `mary-jane/tasks/fallback/`
- If subagent spawn fails: Handle in main session with extended timeout
- If bead already exists (duplicate): Skip, report existing ID

## Notes

- All bead creation auto-commits to git via `DOLT_AUTO_COMMIT=on`
- Use `bd quickstart` for interactive tutorial
- Bead IDs are permanent (hash-based, no collisions)

## Auto-Status Update Functions

```python
def update_bead_status(bead_id: str, status: str):
    """
    Update bead status. Valid statuses:
    - open → detected (initial)
    - planned → in_progress
    - delivered → closed
    - qa_blocked → (retry)
    - stale → detected (reset)
    """
    valid_statuses = ["detected", "planned", "in_progress", "delivered", 
                      "qa_blocked", "stale", "open", "closed"]
    if status not in valid_statuses:
        print(f"⚠️  Invalid status: {status}")
        return False
    
    cmd = [BEADS, "update", bead_id, "--status", status]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=CWD, env=ENV)
    return r.returncode == 0


def claim_and_start(bead_id: str):
    """Atomically claim a task and set to in_progress."""
    cmd = [BEADS, "update", bead_id, "--claim"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=CWD, env=ENV)
    return r.returncode == 0


def mark_complete(bead_id: str):
    """Mark a bead as delivered and closed."""
    update_bead_status(bead_id, "delivered")
    update_bead_status(bead_id, "closed")


def create_batch_from_text(text: str) -> list:
    """
    Parse comma or newline separated tasks and create beads.
    
    Examples:
    - "Task 1, Task 2, Task 3" → 3 beads
    - "Task 1\nTask 2\nTask 3" → 3 beads
    """
    tasks = re.split(r'[,\n]+', text)
    beads = []
    
    for task in tasks:
        task = task.strip()
        if not task:
            continue
        
        # Extract priority if present
        priority = 2  # Default P2
        if re.search(r'\bP0\b|\bURGENT\b|\bASAP\b', task, re.IGNORECASE):
            priority = 0
        elif re.search(r'\bP1\b|\bHIGH\b', task, re.IGNORECASE):
            priority = 1
        elif re.search(r'\bP3\b|\bLOW\b', task, re.IGNORECASE):
            priority = 3
        
        # Remove priority tags from title
        title = re.sub(r'\s*[-:]?\s*P[0-3]\s*', '', task, flags=re.IGNORECASE)
        title = re.sub(r'\s*\b(URGENT|ASAP|HIGH|LOW)\b\s*', '', title, flags=re.IGNORECASE)
        title = title.strip()
        
        bead_id = create_bead(title, priority=priority)
        if bead_id:
            beads.append(bead_id)
            print(f"✅ Created: {bead_id} - {title} (P{priority})")
    
    return beads
```

## Usage Examples

```python
# Create single bead
bead_id = create_bead("Fix the login bug", priority=1)

# Update status
update_bead_status(bead_id, "in_progress")

# Claim task (sets in_progress + assignee)
claim_and_start(bead_id)

# Mark complete
mark_complete(bead_id)

# Batch create from comma-separated
beads = create_batch_from_text("Task 1, Task 2 P1, Task 3")
# → Creates 3 beads with appropriate priorities
```
