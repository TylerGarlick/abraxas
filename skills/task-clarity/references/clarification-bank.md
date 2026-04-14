# Clarification Bank

## Core Question Templates

### Scope / Deliverable
- "What does done look like? What's the output — file, code, report, command?"
- "Just to confirm: are we writing net-new, or modifying existing?"
- "Should this be a one-off script or something reusable?"

### Repo / Location
- "Which repo should this live in — outerspace, research, Abraxas, or somewhere else?"
- "Is this file in the workspace or somewhere else on the machine?"
- "Which project is this for?"

### Tech Stack / Language
- "Python or something else?"
- "Any preferred libraries or frameworks?"
- "Is this going into the Abraxas skills directory or a standalone repo?"

### Constraints / Context
- "Any constraints I should know — budget, latency, API limits, style guide?"
- "Is there existing code I should look at first?"
- "Should this integrate with anything existing?"

### Done Criteria
- "How will you know it's done — it runs, tests pass, you said so?"
- "Any acceptance criteria I should hit?"
- "Want to review before I close the task?"

### Priority
- "P1, P2, or P3?"
- "Is this blocking something?"

---

## Example Flows

### Vague → Clear (Good)

**T:** "Task: improve the CI pipeline"

**MJ:**
> Got it — improve the CI pipeline. Which repo — Abraxas or curiosity-hour?

**T:** "Abraxas"

**MJ:**
> Cool. Which pipeline — test, build, deploy? Anything specific to fix or just general improvements?

**T:** "test pipeline, it's failing on the new janus skill tests"

**MJ:**
> Understood: Abraxas, test pipeline, fix janus skill test failures. One more — any hints on what's failing, or should I pull and diagnose fresh?

**T:** "No hints, pull fresh"

→ **Clear. Spawn subagent.**

---

### Vague → Clear (Skip Syntax Used)

**T:** "Task: update CI in Abraxas, skip scope for now"

**MJ:**
> Understood: Abraxas, update CI. A few quick questions:
> 1. Which CI — test, build, or deploy pipeline?
> 2. Full CI or just the failing part?
> 3. Reusable script or one-shot fix?

**T:** "full CI, reusable"

→ **Clear. Spawn subagent.**

---

### Clear as-is (No Questions)

**T:** "Task: Build Mobile App Skeleton — mc-76f"

**MJ:**
→ **Clear. Spawn subagent immediately.**

---

### T Provides Conflicting Info

**T:** "Task: Write a Python script in Abraxas. Actually, wait — it should be Go for the Abraxas repo"

**MJ:**
> Abraxas, Go, what's the script supposed to do?

---

## Anti-Patterns to Avoid

- **Never ask more than one question per turn** — it overwhelms and buries the most important clarification
- **Never re-ask something T already answered** — if T said "use Python" don't ask "which language"
- **Don't ask if it's already obvious** — T said "in Abraxas" and you've been working in Abraxas, just use it
- **Don't feign ignorance** — if the task is clear, execute; don't ask "just to confirm..." as a formality

## Decision Rules

1. If **everything is clear**, execute (or spawn subagent)
2. If **any dimension is unclear**, gather ALL unclear questions into one message — don't stagger
3. Keep questions to ~3-5 max — if there are more, prioritize the blockers and note the rest as assumptions
4. If T **skips via "skip n" or "ignore n"**, treat that question as answered with a reasonable default and move on
5. If T **declines to answer**, make a reasonable default, note it in the task, and proceed
