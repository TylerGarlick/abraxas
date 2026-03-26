# Stalled Subagent Fix Skill

## Purpose
Detect and fix stalled subagent sessions by identifying sessions that appear stuck (no tool calls, no progress) and respawning them with fresh context.

## Trigger Phrases
- "fix stalled subagents"
- "subagents are stuck"
- "check for stalled subagents"
- "subagent not responding"
- "restart stalled subagents"

## What It Does

### 1. Scan Active Subagents
Use `subagents(action="list")` to get currently running subagents. Note their labels and session IDs.

### 2. Check Session Activity
For each active subagent, use `sessions_history(sessionKey, limit=5)` to check:
- **Tool calls made**: 0 = stalled
- **Last message timestamp**: compare to current time
- **Progress indicators**: look for completion or abandonment cues

### 3. Identify Stalled Sessions
A subagent is stalled when:
- 0 tool calls after significant runtime (>2 minutes)
- No completion message received
- Still appears in `subagents(action="list")`

### 4. Kill and Respawn
For each stalled subagent:
```
1. subagents(action="kill", target="<label>")
2. sessions_spawn(label="<label>", task="<original_task>", mode="run", runtime="subagent")
```

### 5. Report
Return a summary table:
| Subagent | Runtime | Tool Calls | Status | Action |
|----------|---------|------------|--------|--------|
| label | Xm | 0 | Stalled | Killed + Respawned |
| label | Xm | 5 | Active | OK |

## Implementation Notes

- Use `process(action="list")` as secondary check for orphaned processes
- Check `sessions_list(kinds=["subagent"], messageLimit=2)` as additional confirmation
- Compare runtime vs tool call ratio — a 10min session with 0 calls is definitely stalled
- Look at `sessions_history` for the actual content of subagent messages to determine if it's making progress or just idle

## Example Session Check
```
sessions_history limit=5 for each subagent:
- If "<<<END_UNTRUSTED_CHILD_RESULT>>>" present → completed (don't kill)
- If only 1-2 messages with no tools → stalled
- If messages show continuous tool use → active
```

## Safety
- Never kill a subagent that shows completion markers
- Always preserve the original task description when respawning
- Report what was done so the user can follow up

## Output Format
```
## Stalled Subagent Fix Report

### Checked: N subagents
### Found Stalled: M
### Respawned: M

[table]

### Notes
[Any observations about why subagents stalled]
```
