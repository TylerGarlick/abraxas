# Mission Control Skill

## Purpose
When a subagent task finishes, show what tasks remain from the active task list.

## Trigger
- After every subagent completion announcement
- When user asks "what's next?" or similar

## Behavior

### What to show
1. **Completed task** — brief confirmation of what finished
2. **Remaining tasks** — all incomplete tasks from `tasks/` directory
3. **Next up** — which task is most relevant/priority based on context
4. **Suggestions** — optionally, what might be a good next task

### Format
```
✅ Completed: [task name]

📋 Remaining Tasks:
1. [task file] — [brief description]
2. [task file] — [brief description]
...

🎯 Next: [recommended next task]
```

### How to find tasks
- Scan `~/.openclaw/workspace/tasks/*.md` for incomplete tasks
- A task is "done" if it has `- [x]` checkboxes or if there's a retro in recent memory files
- Sort by: explicit priority, recency, or context relevance

## Implementation
- Read task files from `~/.openclaw/workspace/tasks/`
- Check `memory/YYYY-MM-DD.md` for retros to identify completed tasks
- Use context from the conversation to recommend next steps

## Rules
- Only mention this skill when relevant (after task completions or when asked)
- Keep output concise — don't list every task if there are more than 7
- Highlight the most contextually relevant next task
