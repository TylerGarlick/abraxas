---
name: task-clarity
description: Ensures any task or command is clear, actionable, and ready to implement before execution. Use when T says "Task:", gives a vague instruction, or when something needs clarification before starting. The skill asks focused follow-up questions until the task is unambiguous — T can skip any question by providing the answer inline (e.g., "use X" skips the question about X). Triggers on: "Task:", vague requests, or whenever uncertainty would slow execution.
---

# Task Clarity

Before executing any task, verify it is **clear enough to implement without ambiguity**. If anything is unclear, ask ONE focused question. T can skip questions by answering inline.

## The Rule

**Ask until clear, then act.** Gather all remaining questions at once — don't stagger them. Keep it to the questions that actually matter for execution.

## Clarity Checklist

For every task, confirm these dimensions are clear before executing:

| Dimension | Question to Ask if Unclear | Skip if T said... |
|-----------|---------------------------|-------------------|
| **Scope** | "What's the deliverable / output?" | Something specific like "write a script" or "update that file" |
| **Location** | "Which repo / file / project?" | A repo name, file path, or "that one" with recent context |
| **Context** | "Any constraints or gotchas?" | Already explained — budget, tech stack, style, deadline |
| **Done criteria** | "How will I know it's done?" | Explicit acceptance criteria, "it works," or "see the brief" |
| **Priority** | "Any priority / P-level?" | P1/P2/P3 already stated |

Only ask questions when the answer genuinely isn't in the prompt. If T gave you everything, spawn immediately.

## Response Template

When asking clarifying questions, batch them in one message:

```
Got it — [what I understand]. A few quick questions:

1. [Question 1]
2. [Question 2]
3. ...

You can answer any or all inline (e.g., "skip 2, use X for 3") or just respond in order.
```

**Skip syntax:** T can skip any question by saying "skip [n]" or "ignore [n]" in their answer.

**Batch examples:**

**T:** "Task: fix the CI pipeline"
**MJ:**
> Got it — fix CI. Quick questions:
> 1. Which repo — Abraxas or curiosity-hour?
> 2. Which pipeline — test, build, or deploy?
> 3. Anything specific that's broken, or pull and diagnose?

**T:** "Abraxas, test pipeline, skip 3"
→ **Clear. Spawn subagent.**

---

## Skip Syntax

T can skip questions by number or topic:
- "skip 2" → question 2 is unanswered, use your best guess
- "ignore 1 and 3" → skip those, answer the rest
- "use Abraxas for all" → applies that answer to any instance of that question

## References

- Full question bank and examples: `references/clarification-bank.md`
