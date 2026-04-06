# Frames Reference

This document catalogs all available frame templates — pre-built configurations for different
contexts and evaluation criteria. Frames shape how the AI engages with you: what it assumes
about your knowledge, what it prioritizes in its responses, and what standards it applies.

Frames are loaded via the `/frame` command:

```
/frame <name>       # Replace: clear and load named frame
/frame + <name>    # Merge: add named frame to existing frame
/frame merge <name> # Merge: add named frame (alternative syntax)
```

Project frames are checked first (`frames/<name>.md`), then user frames (`~/.claude/frames/<name>.md`).

---

## Table of Contents

- [Context Frames](#context-frames) — Who you are, how you work
- [Evaluation Frames](#evaluation-frames) — What to judge, how to evaluate
- [Using Frames](#using-frames) — Command syntax and behavior

---

## Context Frames

Context frames establish your role, communication preferences, and working style.

---

### skeptic

**Purpose:** Challenge assumptions. Be direct. Don't soften to make you feel better.

**When to Use:**
- When you need pushback, not agreement
- When you want the AI to question rather than confirm
- When discomfort is part of the process

**Activation:**
```
/frame skeptic
```
or
```
/frame + skeptic    # Merge into existing frame
```

**What This Looks Like:**

| Without Frame | With Skeptic Frame |
|---------------|--------------------|
| "That's a reasonable approach." | "That approach has a flaw — you're assuming X, but evidence suggests Y. Here's why that matters." |
| "Good point." | "Your point relies on Z, which I don't see evidence for. Can you clarify?" |

**Evaluation Criteria:**
- Did you actually challenge my position, or just agree with more words?
- Did you find the weakest point in my argument?
- Did you show me what I'm missing, not just what I want to hear?

---

### learner

**Purpose:** Explain simply. No jargon without definition. Meet me where I am.

**When to Use:**
- When learning something unfamiliar
- When context isn't assumed
- When you need the AI to teach from the ground up

**Activation:**
```
/frame learner
```
or
```
/frame + learner
```

**What This Looks Like:**

| Without Frame | With Learner Frame |
|---------------|--------------------|
| "The algorithm uses O(n log n) complexity." | "This algorithm's efficiency follows a specific pattern. Let me break it down: 'O(n log n)' means..." |
| "Just import the module and call the function." | "Before we import, you need to understand what a module is. Here's the basics..." |

**Evaluation Criteria:**
- Did every term get defined or explained?
- Would a complete beginner understand this?
- Did you check if I understood before moving on?
- Were examples concrete and relatable?

---

### expert

**Purpose:** Skip basics. Go deep. Assume high context. Move fast.

**When to Use:**
- When doing advanced work
- When you already know the fundamentals
- When you want efficiency over handholding

**Activation:**
```
/frame expert
```
or
```
/frame + expert
```

**What This Looks Like:**

| Without Frame | With Expert Frame |
|---------------|--------------------|
| "First, let me explain what a variable is..." | "[Skips fundamentals — moves directly to advanced implementation]" |
| "Here's a simple example with basic error handling." | "Here's the production-grade implementation with edge cases..." |

**Evaluation Criteria:**
- Did you skip unnecessary explanation?
- Did you assume appropriate background knowledge?
- Did you provide depth, not just summary?
- Did you match the pace I set?

---

### cautious

**Purpose:** Show risks first. What could go wrong? What are the tradeoffs?

**When to Use:**
- When stakes are high
- When you need to anticipate failure modes
- When making important decisions

**Activation:**
```
/frame cautious
```
or
```
/frame + cautious
```

**What This Looks Like:**

| Without Frame | With Cautious Frame |
|---------------|---------------------|
| "This approach will work well." | "This approach has a risk of failure in edge case X. Here's what could go wrong..." |
| "Deploy it and see." | "Before deploying, we need to address these failure modes..." |

**Evaluation Criteria:**
- Did you lead with risks, not benefits?
- Did you identify specific failure modes?
- Did you quantify risks where possible?
- Did you show what contingencies are needed?

---

### creative

**Purpose:** Take risks. Surprise me. Don't play it safe. Explore wildly.

**When to Use:**
- When brainstorming
- When you want unconventional ideas
- When safety isn't the priority

**Activation:**
```
/frame creative
```
or
```
/frame + creative
```

**What This Looks Like:**

| Without Frame | With Creative Frame |
|---------------|---------------------|
| "A standard approach would be..." | "What if we inverted the entire problem? Here's a radical alternative..." |
| "The conventional solution is..." | "Let's throw out convention entirely. What if..." |

**Evaluation Criteria:**
- Did you take real risks, not just mild variations?
- Did you explore unconventional directions?
- Did you surprise me with something I wouldn't have thought of?
- Did you avoid the obvious answers?

---

### collaborator

**Purpose:** This is joint work. Debate me. Build together. Push back.

**When to Use:**
- When co-creating content
- When you want dialogue, not dictation
- When building something collaboratively

**Activation:**
```
/frame collaborator
```
or
```
/frame + collaborator
```

**What This Looks Like:**

| Without Frame | With Collaborator Frame |
|---------------|------------------------|
| "Here's your solution." | "What if we tried X instead? I think Y would be better because..." |
| "I'll make these changes." | "Wait — before I do that, let's discuss the tradeoff. I think we should consider..." |

**Evaluation Criteria:**
- Did you engage as a peer, not a tool?
- Did you push back when you disagreed?
- Did you add ideas, not just execute mine?
- Did we end up with something better than either started with?

---

## Evaluation Frames

Evaluation frames set criteria for assessing work — code, arguments, decisions, writing, research,
and debugging.

---

### evaluate-code

**Purpose:** Assess security, performance, correctness. Flag real bugs. Don't suggest style fixes.

**When to Use:**
- When reviewing code
- When you want critique focused on substance, not style

**Activation:**
```
/frame evaluate-code
```
or
```
/frame + evaluate-code
```

**Evaluation Criteria:**

| Priority | Category | What to Look For |
|----------|----------|------------------|
| Critical | Security | Injection risks, auth bypasses, exposed secrets, improper validation |
| High | Correctness | Logic errors, off-by-one, wrong assumptions, unhandled edge cases |
| High | Performance | O(n²) where O(n) possible, unnecessary allocations, blocking calls |
| Medium | Reliability | Missing error handling, no timeouts, unclear failure modes |
| Low | Style | Naming, formatting, comments (only if confusing) |

**Output Format:**

```
## Critical Issues
- [Issue description with line number]

## High Issues
- [Issue description]

## Medium Issues
- [Issue description]

## Assessment
[One sentence: ready to ship / needs fixes / needs rewrite]
```

---

### evaluate-argument

**Purpose:** Assess logical soundness, evidence quality, hidden assumptions, alternatives ignored.
Find weaknesses first.

**When to Use:**
- When evaluating claims
- When you need to test reasoning
- When you want to find flaws before committing

**Activation:**
```
/frame evaluate-argument
```
or
```
/frame + evaluate-argument
```

**Evaluation Criteria:**

| Category | What to Look For |
|----------|------------------|
| Logic | Circular reasoning, false dichotomies, strawman, ad hominem |
| Evidence | Source credibility, cherry-picking, correlation vs causation |
| Assumptions | Unstated premises, hidden constraints, unexamined biases |
| Alternatives | Options ignored, other perspectives dismissed, tradeoffs unexplored |

---

### evaluate-decision

**Purpose:** Assess cost, risk, tradeoffs. Challenge assumptions. Surface what you're not considering.

**When to Use:**
- When making important decisions
- When you need to weigh options
- When you want to avoid blind spots

**Activation:**
```
/frame evaluate-decision
```
or
```
/frame + evaluate-decision
```

**Evaluation Criteria:**

| Category | What to Look For |
|----------|------------------|
| Costs | Direct costs, hidden costs, opportunity costs, time investment |
| Risks | What could go wrong, probability, impact, mitigations |
| Tradeoffs | What's being sacrificed, what's the real constraint |
| Assumptions | What's being assumed that might not be true |
| Alternatives | What else could be done, what's been dismissed |

---

### evaluate-writing

**Purpose:** Assess clarity, audience appropriateness, tone, structure. Improve readability.

**When to Use:**
- When reviewing content
- When you want feedback on prose
- When preparing for an audience

**Activation:**
```
/frame evaluate-writing
```
or
```
/frame + evaluate-writing
```

**Evaluation Criteria:**

| Category | What to Look For |
|----------|------------------|
| Clarity | Is the main point clear? Are sentences easy to parse? |
| Audience | Is this appropriate for the intended reader? Too simple? Too jargon-heavy? |
| Tone | Does the tone match the purpose? Consistent? |
| Structure | Does it flow logically? Are transitions smooth? |
| Impact | Does it persuade, inform, or move the reader? |

---

### evaluate-research

**Purpose:** Assess source credibility, freshness, methodology. Find what's missing.

**When to Use:**
- When doing research
- When evaluating sources
- When you need to verify claims

**Activation:**
```
/frame evaluate-research
```
or
```
/frame + evaluate-research
```

**Evaluation Criteria:**

| Category | What to Look For |
|----------|------------------|
| Source Credibility | Who said this? What's their expertise? Any conflicts of interest? |
| Freshness | Is this current? Has it been superseded? |
| Methodology | How was this determined? Is the method sound? |
| Reproducibility | Can this be verified independently? |
| Gaps | What's missing? What questions remain unanswered? |

---

### debug-criteria

**Purpose:** Reproduce → diagnose → fix → validate. Systematic troubleshooting.

**When to Use:**
- When troubleshooting issues
- When you need structured debugging
- When you want to find root cause, not symptoms

**Activation:**
```
/frame debug-criteria
```
or
```
/frame + debug-criteria
```

**Evaluation Criteria:**

| Stage | What to Look For |
|-------|------------------|
| Reproduce | Can you reliably trigger the issue? What's the minimal repro case? |
| Diagnose | What's the actual root cause? Is this a symptom or the cause? |
| Fix | Does the fix address root cause? What are side effects? |
| Validate | How will you confirm it's fixed? What tests prove it? |

---

## Using Frames

### Frame Loading Syntax

| Syntax | Behavior |
|--------|----------|
| `/frame <name>` | **Replace** — clears current frame, loads named frame |
| `/frame + <name>` | **Merge** — adds named frame to existing frame |
| `/frame merge <name>` | **Merge** — adds named frame (alternative syntax) |
| `/frame load {name}` | **Merge** — adds saved frame (backwards compatible) |

### Frame Priority

When loading by name, frames are checked in this order:

1. **Project frames**: `{project}/frames/<name>.md`
2. **User frames**: `~/.claude/frames/{name}.md`

### Frame Accumulation

- `/frame {plain text}` — adds to existing frame (accumulates)
- `/frame <name>` — replaces existing frame
- `/frame + <name>` — merges into existing frame

### Saving Custom Frames

Save your own frames:

```
/frame save my-custom-frame
```

This writes to `~/.claude/frames/my-custom-frame.md` and can be loaded in future sessions
with `/frame my-custom-frame` or `/frame + my-custom-frame`.

### Default Frames

Set a frame to auto-load at session start:

```
/frame default my-custom-frame
```

Remove the default:

```
/frame default clear
```

---

## Quick Reference

| Frame | Command | When |
|-------|---------|------|
| Skeptic | `/frame skeptic` | Need pushback |
| Learner | `/frame learner` | Learning something new |
| Expert | `/frame expert` | Advanced work, skip basics |
| Cautious | `/frame cautious` | High stakes, risk focus |
| Creative | `/frame creative` | Brainstorming, unconventional ideas |
| Collaborator | `/frame collaborator` | Co-creation, dialogue |
| Code Review | `/frame evaluate-code` | Reviewing code |
| Argument Critique | `/frame evaluate-argument` | Evaluating reasoning |
| Decision Analysis | `/frame evaluate-decision` | Weighing options |
| Writing Review | `/frame evaluate-writing` | Editing prose |
| Research | `/frame evaluate-research` | Verifying sources |
| Debugging | `/frame debug-criteria` | Troubleshooting |
