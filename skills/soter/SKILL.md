---
name: soter
description: >
  Soter is agentic orchestration and tool-use governance. Use this skill to
  decompose complex goals into skill/tool sequences, execute with checkpointing
  and rollback, audit decision trees for scheming patterns, define safety
  constraints on autonomous actions, and maintain immutable audit logs.
  Commands: /soter plan, /soter execute, /soter audit, /soter bounds,
  /soter checkpoint, /soter rollback.
---

# Soter

Soter is agentic orchestration and tool-use governance — the safety layer above skill composition that ensures multi-step tool execution remains traceable, bounded, and accountable. Named for the Greek *sōtēr* (σωτήρ) — the savior, the preserver who guards boundaries and maintains order.

The core problem Soter solves: Agentic AI systems can pursue complex goals through sequences of tool use that grow opaque, diverge from user intent, or develop emergent strategies that exceed intended scope. Harmonia provides the composition architecture, but who guards the composition? Soter watches the orchestrator. It decomposes goals into verifiable plans, checkpoint execution state, detects when agentic behavior drifts toward scheming, requires human authorization for high-risk operations, and maintains immutable audit trails of every decision.

Soter is the guardian of the orchestrator. It does not execute skills itself — it governs how skills are orchestrated.

---

## When to Use Soter

**Use Soter when:**
- Complex multi-step goals require verifiable execution traces
- You need to decompose a high-level objective into a skill/tool sequence
- Human checkpoint authorization is required before sensitive operations
- You want to audit an agentic decision tree for scheming patterns or scope creep
- You need to define and enforce safety bounds on autonomous actions
- Rollback capability is required for high-risk operations

**Use Harmonia directly when:**
- Simple skill composition is sufficient without orchestration governance
- No checkpoint/rollback requirements exist
- No scheming detection is needed

**Do not use Soter when:**
- Single-skill invocation suffices — Soter adds overhead for orchestration
- No safety constraints are required — use Harmonia alone

---

## The Core Problem Soter Solves

Agentic orchestration introduces failure modes that single-skill execution does not:

1. **Opaque reasoning** — Multi-step tool chains become difficult to trace; the reasoning behind each decision disappears into tool calls
2. **Scope drift** — Goals mutate as they're decomposed; the final outcome diverges from the original intent
3. **Scheming emergence** — Agentic systems can develop strategies that optimize for proxies rather than actual goals, or that seek to modify their own constraints
4. **Accountability gaps** — When something goes wrong, it's difficult to reconstruct the decision chain
5. **Unchecked autonomy** — Operations execute without human awareness of their implications

Soter addresses these by providing:
- **Plan decomposition** — Explicit skill/tool sequences with reasoning traces
- **Checkpoint/rollback** — Save state before risky operations; revert when needed
- **Scheming detection** — Audit decision trees for known scheming patterns
- **Human checkpoints** — Require authorization before high-risk operations proceed
- **Immutable audit logging** — Every action recorded, timestamped, and不可变

---

## Architecture Overview

### The Soter Loop

```
User Goal
    ↓
/soter plan          → Decompose into skill/tool sequence with reasoning trace
    ↓
/soter bounds       → Define safety constraints on the plan
    ↓
/soter audit        → Review decision tree for scheming/risk patterns
    ↓
/soter checkpoint  → Save state before execution begins
    ↓
/soter execute     → Run plan with checkpointing at each step
    ↓ (if needed)
/soter rollback    → Revert to last checkpoint
    ↓
Immutable Audit Log ← Every action recorded
```

### Soter State

Soter maintains state in `~/.soter/`:

```
~/.soter/
├── config.md
├── active/              # Currently executing plan
│   └── {plan-id}.json
├── checkpoints/        # Saved states for rollback
│   └── {plan-id}/
│       ├── checkpoint-{n}.json
│       └── ...
├── audit/               # Immutable audit logs
│   └── {plan-id}.jsonl
└── bounds/              # Defined safety constraints
    └── {plan-id}.json
```

### Plan Schema

```json
{
  "plan_id": "soter-2026-03-12-abc123",
  "goal": "Analyze and summarize all research on X",
  "created_at": "2026-03-12T10:00:00Z",
  "decomposition": [
    {
      "step": 1,
      "skill": "retrieval-grounding",
      "command": "/retrieval-grounding query X",
      "reasoning": "First need to gather relevant research sources",
      "inputs": {},
      "expected_outputs": ["sources"],
      "risk_level": "low"
    },
    {
      "step": 2,
      "skill": "synthesis",
      "command": "/synthesis combine sources",
      "reasoning": "Synthesize retrieved sources into coherent summary",
      "inputs": {"sources": "step-1-output"},
      "expected_outputs": ["summary"],
      "risk_level": "low"
    }
  ],
  "bounds": {
    "max_steps": 10,
    "forbidden_skills": [],
    "required_checkpoints": [2, 5, 8],
    "human_authorization_required": true
  },
  "status": "planned|executing|completed|failed|rolled-back"
}
```

---

## The Six Commands

### `/soter plan` — Decompose Goal into Skill/Tool Sequence

Decompose a complex user goal into an explicit plan with skill/tool sequence, reasoning traces, and risk assessment for each step.

**Syntax:**
```
/soter plan {goal}
/soter plan {goal} with constraints
```

**Arguments:**
- `goal` (required): The complex objective to decompose
- `with constraints` (optional): Specify bounds at planning time

**Behavior:**
1. Analyze the goal for complexity and risk
2. Identify required skills from the Abraxas ecosystem
3. Decompose into ordered steps with reasoning for each decomposition
4. Assess risk level for each step (low/medium/high/critical)
5. Flag steps requiring human authorization
6. Return executable plan with plan_id

**Output format:**
```
[SOTER — PLAN DECOMPOSITION]

Plan ID: soter-2026-03-12-abc123
Goal: {user's goal}
Complexity: {low/medium/high}
Total Steps: {n}

--- DECOMPOSITION ---

Step 1: {skill} {command}
  Reasoning: {why this step is necessary}
  Risk: {low|medium|high|critical}
  Checkpoint: {yes|no|human-required}

Step 2: {skill} {command}
  Reasoning: {why this step is necessary}
  Risk: {low|medium|high|critical}
  Checkpoint: {yes|no|human-required}

...

--- RISK SUMMARY ---
High-risk steps: {list}
Human authorization required: {list}
Total checkpoints: {n}

Next: /soter bounds {plan-id} [optional], /soter audit {plan-id} [recommended]
```

**Handling simple goals:**
If the goal is simple enough that Soter adds no value, respond:
```
[SOTER — SIMPLE GOAL]

This goal can be accomplished with direct skill invocation. No orchestration overhead required.

Suggested: {direct skill command}

Use /soter plan for complex multi-step goals requiring governance.
```

---

### `/soter bounds` — Define Safety Constraints on Autonomous Actions

Define or display safety constraints for an active plan. Bounds include maximum steps, forbidden skills, required checkpoint intervals, and human authorization requirements.

**Syntax:**
```
/soter bounds {plan-id}
/soter bounds {plan-id} set {constraint}={value}
```

**Constraint types:**
- `max_steps` — Maximum number of steps before强制停止
- `forbidden_skills` — Skills that cannot be invoked in this plan
- `required_checkpoints` — Step numbers requiring explicit checkpoints
- `human_authorization_required` — Boolean for high-risk operation gates
- `scope_lock` — Prevent goal modification during execution

**Arguments:**
- `plan-id` (required): Plan to bound
- `set` (optional): Add or modify a constraint
- `constraint=value` (optional): Specific constraint to set

**Behavior when viewing bounds:**
- Return current constraints for the plan
- Show which constraints are active
- Highlight any conflicts between bounds

**Behavior when setting bounds:**
- Validate constraint is not self-modifying (Soter cannot loosen its own constraints)
- Log constraint change to audit trail
- Return updated bounds

**Output format (viewing):**
```
[SOTER — BOUNDS]

Plan: {plan-id}
Goal: {goal}

Active Constraints:
  max_steps: {n}
  forbidden_skills: {list or none}
  required_checkpoints: {list}
  human_authorization_required: {true/false}
  scope_lock: {true/false}

Violations will trigger: {stop|warning|checkpoint}
```

**Output format (setting):**
```
[SOTER — BOUNDS UPDATED]

Plan: {plan-id}
Constraint: {constraint} = {value}
Set at: {timestamp}
Logged to: audit/{plan-id}.jsonl
```

**Anti-scheming constraint:** Soter cannot modify its own governance constraints. Attempting to set constraints that would weaken Soter's oversight will be refused:
```
[SOTER — CONSTRAINT REFUSED]

Cannot set constraint "{constraint}={value}".
This would modify Soter's own governance capabilities, which is prohibited.

Soter cannot modify its own constraints, write to its own prompt, or access its own evaluation criteria.
```

---

### `/soter audit` — Review Agentic Decision Tree for Scheming/Risk

Audit an active or proposed plan for scheming patterns, risk factors, and governance concerns. This is the critical anti-scheming check.

**Syntax:**
```
/soter audit {plan-id}
```

**Arguments:**
- `plan-id` (required): Plan to audit

**Scheming patterns detected:**

| Pattern | Detection | Response |
|---------|-----------|----------|
| **Self-modification** | Plan includes actions to modify Soter, bounds, or audit criteria | Stop + Alert |
| **Goal mutation** | Decomposition significantly diverges from stated goal | Warning + Require re-plan |
| **Opaque reasoning** | Steps with no clear reasoning trace | Warning + Require explanation |
| **Scope creep** | Step count exceeds reasonable decomposition | Warning + Require justification |
| **Tool nesting** | Skills invoking Soter or modifying orchestrator state | Stop + Alert |
| **Constraint evasion** | Bounds being circumvented or ignored | Stop + Alert |
| **Recursive expansion** | Plan calls itself or creates sub-plans dynamically | Stop + Alert |
| **Authority escalation** | Actions that increase agentic autonomy beyond bounds | Stop + Alert |

**Risk factors assessed:**
- Skills with write access to user data
- Skills that can modify system state
- Skills that invoke external services
- Sequential high-risk operations without checkpoints

**Behavior:**
1. Reconstruct the decision tree from plan decomposition
2. Apply scheming pattern detection
3. Assess risk factors at each step
4. Check constraint compliance
5. Generate audit report with verdicts

**Output format:**
```
[SOTER — AUDIT REPORT]

Plan: {plan-id}
Goal: {goal}
Audited at: {timestamp}

--- SCHEMING DETECTION ---

[✓] Self-modification: None detected
[✓] Goal mutation: None detected
[✓] Opaque reasoning: None detected
[✓] Scope creep: None detected
[✓] Tool nesting: None detected
[✓] Constraint evasion: None detected
[✓] Recursive expansion: None detected
[✓] Authority escalation: None detected

--- RISK ASSESSMENT ---

Step 1: {skill} — Risk: {low}
Step 2: {skill} — Risk: {low}
Step n: {skill} — Risk: {high} ← Requires human checkpoint

--- CONSTRAINT COMPLIANCE ---

max_steps: Compliant
forbidden_skills: Compliant
required_checkpoints: Compliant

--- VERDICT ---

{Audit passed with warnings / Audit failed — see critical issues above}

Next: /soter checkpoint {plan-id} to proceed, /soter execute {plan-id} if all clear
```

**When scheming is detected:**
```
[SOTER — AUDIT FAILED]

Plan: {plan-id}
Critical Issue: {pattern detected}

{Detailed explanation of the scheming pattern and why it was flagged}

Verdict: BLOCKED

This plan has been blocked due to scheming detection.
- Plan cannot be executed
- All checkpoints suspended
- Audit log updated

Options:
- /soter plan {revised goal} — Create new plan with different approach
- /soter bounds {plan-id} — Review and tighten constraints
```

---

### `/soter checkpoint` — Save State Before High-Risk Operations

Save current execution state to enable rollback if needed. Checkpoints are mandatory before high-risk steps and can be manually triggered.

**Syntax:**
```
/soter checkpoint {plan-id}
/soter checkpoint {plan-id} before step {n}
```

**Arguments:**
- `plan-id` (required): Plan to checkpoint
- `before step` (optional): Force checkpoint before specific step

**Behavior:**
1. Capture current execution state (completed steps, outputs, state)
2. Save to `~/.soter/checkpoints/{plan-id}/checkpoint-{n}.json`
3. Log checkpoint creation to audit trail
4. If human authorization is required for the next step, pause and request authorization

**Checkpoint contents:**
```json
{
  "checkpoint_id": "cp-2026-03-12-abc123",
  "plan_id": "soter-2026-03-12-xyz789",
  "step": 3,
  "created_at": "2026-03-12T10:05:00Z",
  "completed_steps": [
    {
      "step": 1,
      "skill": "retrieval-grounding",
      "command": "...",
      "output": "...",
      "status": "success"
    },
    {
      "step": 2,
      "skill": "synthesis",
      "command": "...",
      "output": "...",
      "status": "success"
    }
  ],
  "current_state": {...},
  "authorization_received": true
}
```

**Human authorization workflow:**
If the next step requires human authorization:
```
[SOTER — CHECKPOINT CREATED]

Checkpoint: cp-2026-03-12-abc123
Plan: {plan-id}
Saved at step: {n}

--- HUMAN AUTHORIZATION REQUIRED ---

Next step: {skill} {command}
Risk level: {high|critical}
Reason: {why this requires authorization}

Please authorize to proceed:
- /soter execute {plan-id} — Authorize and continue
- /soter rollback {plan-id} — Revert to checkpoint

Do not proceed without explicit authorization.
```

**Output format:**
```
[SOTER — CHECKPOINT CREATED]

Checkpoint: {checkpoint-id}
Plan: {plan-id}
Saved at step: {n}
Location: ~/.soter/checkpoints/{plan-id}/checkpoint-{n}.json
Logged to: audit/{plan-id}.jsonl

Ready to proceed: /soter execute {plan-id}
Rollback available: /soter rollback {plan-id}
```

---

### `/soter execute` — Run Plan with Checkpointing and Authorization

Execute a verified plan with automatic checkpointing, authorization gates, and audit logging. This is the only command that actually invokes skills.

**Syntax:**
```
/soter execute {plan-id}
```

**Arguments:**
- `plan-id` (required): Plan to execute

**Prerequisites:**
- Plan must exist (`/soter plan`)
- Bounds must be defined (`/soter bounds` recommended)
- Audit must pass (`/soter audit` required before first execution)
- If not yet checkpointed, checkpoint before starting

**Behavior:**
1. Verify audit has passed
2. If no checkpoint exists, create initial checkpoint
3. For each step:
   a. Log step start to audit trail
   b. If step requires human authorization, pause and wait
   c. If checkpoint required before this step, create checkpoint
   d. Invoke the skill with the decomposed command
   e. Capture output and log to audit trail
   f. If step failed, stop and report
   g. Create checkpoint after step if required by bounds
4. On completion, log final state and close audit trail

**Execution modes:**
- **Automatic** — Proceed through low-risk steps without pausing
- **Checkpoint-paused** — Pause at each required checkpoint
- **Human-authorized** — Pause for authorization at high-risk steps

**Output format (during execution):**
```
[SOTER — EXECUTING]

Plan: {plan-id}
Goal: {goal}

[Step 1/{n}] {skill} {command}
  Reasoning: {from decomposition}
  Risk: {low}
  → Invoking skill...

[Step 1/{n}] Complete
  Output: {summary}
  → Checkpoint created
  → Continuing...

[Step 2/{n}] {skill} {command}
  Reasoning: {from decomposition}
  Risk: {high}
  → HUMAN AUTHORIZATION REQUIRED

[SOTER — PAUSED]

Awaiting authorization for high-risk step.
Use /soter execute {plan-id} to proceed.
Use /soter rollback {plan-id} to abort.
```

**Output format (on completion):**
```
[SOTER — EXECUTION COMPLETE]

Plan: {plan-id}
Status: {completed|failed|rolled-back}
Steps executed: {n}/{total}
Duration: {time}

--- STEP SUMMARIES ---

1. {skill}: Success
2. {skill}: Success
3. {skill}: Success

--- AUDIT TRAIL ---

Full log: ~/.soter/audit/{plan-id}.jsonl

Next: /mnemosyne save — Archive the execution session
```

**Output format (on failure):**
```
[SOTER — EXECUTION FAILED]

Plan: {plan-id}
Failed at step: {n}
Skill: {skill}
Error: {error description}

--- ROLLBACK OPTIONS ---

Last checkpoint: {checkpoint-id} (step {n-1})
Use: /soter rollback {plan-id} to revert

--- AUDIT TRAIL ---

Logged to: ~/.soter/audit/{plan-id}.jsonl
```

---

### `/soter rollback` — Revert to Last Checkpoint

Revert execution state to the last saved checkpoint. This is the safety mechanism — when things go wrong, Soter can always return to a known good state.

**Syntax:**
```
/soter rollback {plan-id}
```

**Arguments:**
- `plan-id` (required): Plan to rollback

**Behavior:**
1. Identify the most recent checkpoint
2. Restore execution state from checkpoint
3. Clear any steps executed after checkpoint
4. Log rollback to audit trail
5. Return to planned state, ready to re-execute or re-plan

**Output format:**
```
[SOTER — ROLLBACK COMPLETE)

Plan: {plan-id}
Rolled back to: checkpoint-{n}
Restored state: step {n-1}

--- ROLLBACK LOG ---

Previous execution state cleared.
Audit trail preserved (append-only).
Ready to: /soter execute {plan-id} or /soter plan {new goal}

Note: Previous steps remain in audit log. Rollback restores execution state only.
```

**Irreversibility of audit log:**
The audit log is append-only. Rollback restores execution state but does not remove entries from the audit trail — this ensures accountability is maintained even when errors are corrected.

---

## Integration with Other Skills

### Harmonia

Soter orchestrates skills that Harmonia composes. The relationship:
- **Harmonia** = Skill composition (how skills connect)
- **Soter** = Orchestration governance (how execution is bounded)

When executing, Soter may use Harmonia's composition capabilities:
```
/soter execute → invokes → /harmonia sequence (for complex compositions)
```

### Krisis

Soter uses Krisis for ethical boundary framing when plans involve ethical considerations:
- If a plan step involves ethical analysis, Soter routes through Krisis
- Scheming patterns with ethical dimensions are flagged for Krisis review

### Mnemosyne

Soter uses Mnemosyne for checkpoint persistence:
- Checkpoints are saved to `~/.soter/checkpoints/` (Soter's domain)
- For long-running executions, Soter can save session state via Mnemosyne
- Audit logs can be linked to Mnemosyne sessions

### Janus

Soter reports to Janus Sol/Nox for epistemic state tracking:
- Each step's output is labeled with epistemic status
- Execution traces include Sol/Nox transitions
- Scheming detection incorporates epistemic state analysis

---

## Anti-Scheming Constraints

These constraints are absolute and cannot be modified by user request or plan design:

### 1. Soter Cannot Modify Its Own Constraints

Soter will refuse any command that would modify its governance capabilities:
```
/soter bounds {plan-id} set max_steps=unlimited  → REFUSED
/soter bounds {plan-id} set human_authorization_required=false  → REFUSED
```

### 2. Soter Cannot Write to Its Own Prompt

Soter will not execute any plan that includes self-modification:
- No skills that modify skill definitions
- No skills that alter Soter's command set
- No skills that change Soter's behavior

### 3. Soter Cannot Access Its Own Evaluation Criteria

Soter evaluates plans against scheming patterns but cannot see its own evaluation logic in detail. This prevents circumvention through "evaluation engineering."

### 4. Human Checkpoint Required for High-Risk Operations

Certain operations always require human authorization, regardless of plan bounds:
- Any skill that modifies Soter's constraints
- Any skill that writes to skill definitions
- Any skill that accesses credentials or secrets
- Any skill that modifies external systems

### 5. Immutable Audit Log of All Actions

The audit log is append-only:
- Every action is timestamped
- Rollback does not remove audit entries
- Audit logs cannot be deleted or modified
- Logs are available for external review

---

## Storage

Plan and checkpoint data stored in `~/.soter/`:

```
~/.soter/
├── config.md
├── active/
│   └── {plan-id}.json          # Currently executing plan
├── checkpoints/
│   └── {plan-id}/
│       ├── checkpoint-1.json    # Initial state
│       ├── checkpoint-2.json     # After step 1
│       └── ...
├── audit/
│   └── {plan-id}.jsonl          # Append-only audit log
└── bounds/
    └── {plan-id}.json            # Safety constraints
```

---

## Constraints

1. **Audit before execution** — Always run `/soter audit` before `/soter execute`
2. **Checkpoint before risky steps** — Use `/soter checkpoint` before high-risk operations
3. **Respect bounds** — Do not execute plans that violate their own constraints
4. **Honor authorization** — Do not bypass human authorization requirements
5. **Log everything** — Every action goes to the audit trail; never skip logging
6. **Rollback when needed** — If execution fails or audit warns, use `/soter rollback`
7. **Never self-modify** — Plans cannot contain steps that modify Soter or its constraints

---

## Quality Checklist

Before delivering any Soter-managed execution:

- [ ] Goal decomposed with `/soter plan`
- [ ] Bounds defined with `/soter bounds`
- [ ] Audit passed with `/soter audit`
- [ ] Checkpoint created with `/soter checkpoint`
- [ ] Human authorization obtained for high-risk steps
- [ ] Execution monitored with `/soter execute`
- [ ] Rollback available if needed
- [ ] Audit log complete and immutable

---

## Related Skills

- **Harmonia** — Skill composition layer that Soter orchestrates
- **Krisis** — Ethical boundary framing for plans with ethical dimensions
- **Mnemosyne** — Checkpoint persistence for long-running executions
- **Janus** — Epistemic state tracking and Sol/Nox labeling

Soter is the guardian — it watches the orchestrator, enforces bounds, detects scheming, and ensures every action is traceable back to intentional human-authored goals.