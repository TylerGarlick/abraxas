---
name: plan
description: >
  Plan — Epistemic Clarity Engine. Use this skill to convert vague requests into
  actionable specs via high-leverage questioning. Extracts unknowns (Goal, Audience,
  Format, Success, Timeline, Data), asks targeted questions, applies epistemic labels
  (Sol/Confident), and exports clarity maps. Commands: /plan start, /plan answer,
  /plan status, /plan export, /plan skip. Always run /plan before implementation
  when the request is vague or underspecified.
---

# Plan — Epistemic Clarity Engine

Plan is the Abraxas system for converting vague requests into crystal-clear specifications through systematic questioning. It extracts unknowns, asks high-leverage questions, and tracks epistemic certainty — ensuring no implementation begins with critical gaps.

## Why Plan?

Vague requests lead to wasted effort. "Build me a dashboard" could mean anything. Plan solves this by:

- **Extracting unknowns** — Identifies what you don't know before you start
- **High-leverage questioning** — Asks the 5-6 questions that unlock everything else
- **Epistemic rigor** — Labels every answer (Sol/Confident, Nox/Uncertain)
- **No inference** — Never assumes; always asks
- **Clear completion** — Knows when you're ready for implementation

## The Six Unknown Categories

| Category | Question | Leverage |
|----------|----------|----------|
| **GOAL** | What exactly should this do / achieve? | 5 |
| **SUCCESS** | How will we know when this is complete / successful? | 5 |
| **AUDIENCE** | Who is the primary user / audience? | 4 |
| **FORMAT** | What format / platform / output is expected? | 3 |
| **TIMELINE** | What is the timeline / deadline? | 3 |
| **DATA** | What data / content is needed? | 3 |

## Command Suite

| Command | Description |
|:---|:---|
| `/plan start "{request}"` | Start a new clarity session with a vague request |
| `/plan answer {session_id} {question_id} "{answer}"` | Answer a question (applies Sol/Confident label) |
| `/plan skip {session_id} {question_id}` | Skip a question (marks as Nox/Skipped) |
| `/plan status {session_id}` | Show current session status and next question |
| `/plan export {session_id}` | Export the final clarity map (JSON) |
| `/plan list` | List all clarity sessions |
| `/plan clear {session_id}` | Delete a session |

## Usage Flow

```
User: "Build me a dashboard"
      │
      ▼
/plan start "Build me a dashboard"
      │
      ▼
Extracts 6 unknowns (Goal, Success, Audience, Format, Timeline, Data)
      │
      ▼
Asks highest-leverage question first (Goal @ L:5)
      │
      ▼
User answers: /plan answer abc123 1 "Server monitoring"
      │
      ▼
Applies epistemic label: Sol / Confident
      │
      ▼
Repeats until all unknowns resolved or skipped
      │
      ▼
/plan export abc123 → readyForImplementation: true
```

## Epistemic Labels

Every answer receives an epistemic label:

| Label | Meaning | When Applied |
|-------|---------|--------------|
| **Sol / Confident** | Known with certainty | User provides clear, specific answer |
| **Sol / Uncertain** | Known but shaky | User hedges or expresses doubt |
| **Nox / Skipped** | Unknown, skipped | User skips the question |
| **Nox / Contradicted** | Known false | Answer contradicts established knowns |

## Storage

**`.abraxas/plan/`**

```
.abraxas/plan/
├── clarity-ledger.jsonl    # All sessions (append-only log)
└── current-session.json    # Active session state
```

## Integration with Other Skills

### Plan → Logos → Agon → Janus

```
Vague Request
     │
     ▼
/plan start → Extract unknowns, ask questions
     │
     ▼ (readyForImplementation: true)
/logos map → Map argument structure
     │
     ▼
/agon debate → Adversarial testing
     │
     ▼
/janus label → Epistemic labeling (KNOWN/INFERRED/UNCERTAIN)
```

### Plan → Ergon (Implementation)

```
/plan export {session_id}
     │
     ▼ (clarity map with all unknowns resolved)
/ergon build → Implementation with clear spec
```

## Usage Examples

### Example 1: Vague Dashboard Request

```
User: "Build me a dashboard"

/plan start "Build me a dashboard"
→ 🔍 UNKNOWN EXTRACTION
→ ├─ GOAL: What exactly should this do / achieve? [unknown] (L:5)
→ ├─ SUCCESS: How will we know when this is complete? [unknown] (L:5)
→ ├─ AUDIENCE: Who is the primary user? [unknown] (L:4)
→ ├─ FORMAT: What format / platform? [unknown] (L:3)
→ ├─ TIMELINE: What is the deadline? [unknown] (L:3)
→ ├─ DATA: What data is needed? [unknown] (L:3)
→ 
→ ❓ NEXT: "What exactly should this do / achieve?"
→ 💡 Answer: /plan answer mnnl3h25 1 "Server monitoring"

[Answer all 6 questions]

/plan export mnnl3h25
→ {
→   "status": "complete",
→   "resolved": 6,
→   "remaining": 0,
→   "readyForImplementation": true
→ }
```

### Example 2: AI Assistant Request

```
User: "Build me an AI assistant for customer support"

/plan start "Build me an AI assistant for customer support"
→ Extracts 5 unknowns (Audience already implied)

[User answers 5 questions]

/plan export mnnl62tj
→ Knowns:
→   - GOAL: Answer customer questions about orders, returns, product info
→   - SUCCESS: 90% resolved without human, <5s response
→   - FORMAT: Web chat widget + Slack integration
→   - TIMELINE: 4 weeks for MVP
→   - DATA: FAQ database, order API, product catalog
```

### Example 3: Skipping a Question

```
/plan skip mnnl3h25 5
→ Question 5 (TIMELINE) marked as Nox / Skipped
→ Session continues with remaining unknowns

/plan status mnnl3h25
→ 5 resolved, 1 skipped, 0 remaining
→ readyForImplementation: true (with caveats)
```

## Implementation

Core engine: `clarity-engine.js`

```typescript
interface ClaritySession {
  sessionId: string;
  request: string;
  startedAt: ISO8601;
  unknowns: Unknown[];
  knowns: Known[];
  skipped: Skipped[];
  status: 'in_progress' | 'complete' | 'abandoned';
  iterations: number;
  readyForImplementation: boolean;
}

interface Unknown {
  id: number;
  category: 'GOAL' | 'SUCCESS' | 'AUDIENCE' | 'FORMAT' | 'TIMELINE' | 'DATA';
  question: string;
  leverage: 1-5;
  status: 'unknown' | 'resolved' | 'skipped';
}

interface Known {
  category: string;
  question: string;
  answer: string;
  epistemicLabel: 'Sol' | 'Nox';
  confidenceLabel: 'Confident' | 'Uncertain';
  source: 'User' | 'Derived';
}
```

## When to Use Plan

**Use Plan when:**
- Request is vague ("Build me something", "Make it better")
- Multiple stakeholders with different expectations
- High-stakes implementation (expensive, time-consuming)
- Past projects failed due to miscommunication
- You need a clear spec before coding begins

**Skip Plan when:**
- Request is already crystal-clear
- Quick prototype / throwaway code
- You're exploring and don't need commitment
- The cost of being wrong is negligible

---

**Plan is forethought made systematic.** It ensures Abraxas never charges into implementation blind.
