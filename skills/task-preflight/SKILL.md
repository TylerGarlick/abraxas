# Task Preflight Skill

## Purpose
Before spawning any subagent to work on a task, all clarifying questions must be answered and the task definition must be clear enough to implement. This skill enforces that discipline.

## When to Use
Triggered when T says "start implementing" or asks to create a task, but questions remain unresolved.

## Process

### Step 1 — Ask Questions
Ask T all clarifying questions before doing anything. Do not proceed until questions are answered. Questions should cover:
- **Scope** — What exactly needs to be done?
- **Context** — Which repo, branch, or artifact contains relevant work?
- **Goal** — What does success look like?
- **Ownership** — Who owns the task (MJ, T, or shared)?

### Step 2 — Write Definition of Done
Once questions are answered, write a clear DONE.md or task definition covering:
- What constitutes completion
- What outputs are expected
- Any constraints or requirements

### Step 3 — Confirm Before Spawning
Show T the definition of done and say "Starting implementation" only after T confirms or says "go ahead."

### Step 4 — Spawn Isolated Subagent
Spawn an isolated subagent with the full context. Never do factory work in the main session.

### Step 5 — Retrospective Enforcement
After subagent completes, run retrospective-enforcer per the skill.

## Memory Note
This skill should be remembered in MEMORY.md under the Skills section.
