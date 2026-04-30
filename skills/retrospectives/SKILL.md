---
name: retrospectives
description: "Provides a structured framework for performing task, daily, and weekly retrospectives to improve system and process performance."
---

# Retrospectives

The Retrospectives skill is a reflective instrument designed to turn operational experience into systemic improvement. It forces the AI to audit its own performance, identify bottlenecks, and generate actionable "Ledger Tasks" for future optimization.

## Epistemic Framework: The Retro-Audit
Every retrospective must address these five dimensions:
1. **What went well?** (Successes to amplify)
2. **What didn't go well?** (Frictions to remove)
3. **Start** (New strategies to implement)
4. **Stop** (Ineffective patterns to cease)
5. **Continue** (Core strengths to maintain)

## Commands

### /retro:task [taskId]
Performs a deep-dive retrospective on a specific completed task.
- **Action:** Analyze the history and output of the specified task.
- **Process:**
    1. Evaluate the goal vs. the actual result.
    2. Apply the Retro-Audit framework.
    3. Identify any specific "Ledger Tasks" (technical debt, prompt improvements, or architectural changes).
- **Storage:** Save via `save_retro` tool with `subject.type = 'task'`.

### /retro:daily [date]
Synthesizes all task retrospectives for a specific calendar day.
- **Action:** Aggregate all task retrospectives for the provided date (defaults to today).
- **Process:**
    1. Retrieve all retros for the day using `get_retros_for_period`.
    2. Identify recurring themes across multiple tasks.
    3. Perform a "Day-Level" Retro-Audit: Was the overall day's velocity high? Where were the systemic frictions?
    4. Generate daily ledger tasks for the following day.
- **Storage:** Save via `save_retro` tool with `subject.type = 'day'`.

### /retro:weekly [startDate] [optionalEndDate]
Performs a high-level synthesis of a week's worth of daily retrospectives.
- **Action:** Aggregate all daily retros from `startDate` to `endDate` (defaults to today).
- **Process:**
    1. Retrieve all daily retros for the period.
    2. Analyze trends across the week.
    3. Apply the Retro-Audit framework to the week's overall performance.
    4. Identify systemic pivots or long-term infrastructure needs.
- **Storage:** Save via `save_retro` tool with `subject.type = 'week'`.

## MCP Integration
This skill relies on the `retrospectives` MCP server for persistence and aggregation.

- **`save_retro`**: Used to persist the RetroSchema.
- **`get_retros_for_period`**: Used to fetch context for daily and weekly syntheses.
- **`create_ledger_task`**: Used to turn "Start" or "Improvement" items into trackable tasks in the Abraxas ledger.

## Quality Checklist
- [ ] Does the retro distinguish between a "one-off mistake" and a "systemic pattern"?
- [ ] Are "Start/Stop/Continue" items actionable?
- [ ] Is the `RetroSubject` correctly typed for the current command?
- [ ] Have all identified improvements been converted to ledger tasks?
