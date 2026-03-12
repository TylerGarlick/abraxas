# Skills Reference

> **Tagline** – *"All forces united: Sol ↔ Nox."*

This document is the system reference for all fourteen skills that make up the Abraxas project:

This document is the system reference for all fourteen skills that make up the Abraxas project:
**Honest**, the **Janus System**, **Agon**, **Aletheia**, **Abraxas Oneironautics**, **Retrieval Grounding**, **Scribe**, **Research Assistant**, **Citation Checker**, **Synthesis**, **Logos**, **Mnemon**, **Kairos**, and **Mnemosyne**. It describes what each system
is, how it is structured, and every command it provides.

These are not plugins or developer utilities. They are operational systems designed to address
hallucination, scheming, unlabeled confidence, and the invisible mixing of fact and fabrication
in AI output.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Honest](#honest)
  - [System Overview](#honest-overview)
  - [Command Reference](#honest-command-reference)
  - [Worked Examples](#honest-worked-examples)
- [Agon](#agon)
  - [System Overview](#agon-overview)
  - [Command Reference](#agon-command-reference)
  - [Worked Examples](#agon-worked-examples)
- [Aletheia](#aletheia)
  - [System Overview](#aletheia-overview)
  - [Command Reference](#aletheia-command-reference)
  - [Worked Examples](#aletheia-worked-examples)
- [Abraxas Oneironautics](#abraxas-oneironautics)
  - [System Architecture](#system-architecture)
  - [Command Reference](#oneironautics-command-reference)
  - [Worked Examples](#abraxas-worked-examples)
- [Janus System](#janus-system)
  - [System Architecture](#janus-architecture)
  - [Command Reference](#janus-command-reference)
  - [Worked Examples](#janus-worked-examples)
- [Phase 6 Skills](#phase-6-epistemic-depth-skills)
  - [Logos](#logos)
  - [Mnemon](#mnemon)
  - [Kairos](#kairos)
- [Phase 7 Cross-Session Memory](#phase-7-cross-session-memory)
  - [Mnemosyne](#mnemosyne)
- [Useful Combinations](#useful-combinations)

---

## Installation

Skills are personal-scope installations. Unzip the `.skill` archive into your Claude Code skills
directory:

```
unzip honest.skill -d ~/.claude/skills/
unzip agon.skill -d ~/.claude/skills/
unzip aletheia.skill -d ~/.claude/skills/
unzip janus-system.skill -d ~/.claude/skills/
unzip abraxas-oneironautics.skill -d ~/.claude/skills/
unzip synthesis.skill -d ~/.claude/skills/
unzip scribe.skill -d ~/.claude/skills/
unzip retrieval-grounding.skill -d ~/.claude/skills/
unzip research-assistant.skill -d ~/.claude/skills/
unzip citation-checker.skill -d ~/.claude/skills/
unzip mnemosyne.skill -d ~/.claude/skills/
```

Once installed, the skill's slash commands are available in every Claude Code session — no
project-level configuration required.

| Skill | File | Commands | Archive Size |
|---|---|---|---|
| Honest | `skills/honest.skill` | 9 | ~5 KB |
| Agon | `skills/agon.skill` | 8 | ~12 KB |
| Aletheia | `skills/aletheia.skill` | 7 | ~10 KB |
| Janus System v2 | `skills/janus-system.skill` | 19 | ~15 KB |
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | 35 | ~20 KB |
| Synthesis | `skills/synthesis.skill` | 3 | ~2 KB |
| Scribe | `skills/scribe.skill` | 4 | ~2 KB |
| Retrieval Grounding | `skills/retrieval-grounding.skill` | 4 | ~2 KB |
| Research Assistant | `skills/research-assistant.skill` | 5 | ~2 KB |
| Citation Checker | `skills/citation-checker.skill` | 4 | ~2 KB |
| Logos | `skills/logos.skill` | 6 | ~12 KB |
| Mnemon | `skills/mnemon.skill` | 6 | ~8 KB |
| Kairos | `skills/kairos.skill` | 7 | ~10 KB |
| Mnemosyne | `skills/mnemosyne.skill` | 7 | ~8 KB |
| Ethos | `skills/ethos.skill` | 5 | ~12 KB |
| Krisis | `skills/krisis.skill` | 6 | ~8 KB |
| Harmonia | `skills/harmonia.skill` | 4 | ~8 KB |
| Soter | `skills/soter.skill` | 6 | ~10 KB |

---

## Phase 12 Agentic Orchestration

The following skill was added in Phase 12 (Agentic Orchestration):

### Soter
Agentic orchestration and tool-use governance. A layer above skill composition (Harmonia) that governs multi-step tool orchestration, detects scheming patterns in agentic behavior, and provides verifiable reasoning traces with human-in-the-loop checkpoints. Named for the Greek *sōtēr* — the savior, the preserver who guards boundaries.

**Commands:** `/soter plan`, `/soter bounds`, `/soter audit`, `/soter checkpoint`, `/soter execute`, `/soter rollback`

**Anti-Scheming Design:**
- Soter cannot modify its own constraints
- Cannot write to its own prompt
- Cannot access its own evaluation criteria
- Human checkpoint required for high-risk operations
- Immutable audit log of all actions

**Workflow:**
```
/soter plan {goal} → /soter bounds {plan-id} → /soter audit {plan-id} → /soter checkpoint {plan-id} → /soter execute {plan-id}
```

**Storage:** `~/.soter/`

---

## Using Without Skills (CONSTITUTION.md)

Don't have Claude Code? Load `CONSTITUTION.md` as your system prompt to activate all ten
systems in any LLM.

### Setup by Platform

| Platform | Instructions |
|----------|-------------|
| Claude.ai | Settings → Advanced → System prompt → Paste CONSTITUTION.md |
| ChatGPT | Settings → GPT-4 → Custom instructions → Paste |
| Gemini | Settings → Gemini → Advanced settings → System prompt |
| Ollama | `ollama run model -p system "$(cat CONSTITUTION.md)"` |
| LM Studio | System prompt field → Paste CONSTITUTION.md |
| Any other | Paste as first message or in system prompt field |

### Activating Honest Mode

When CONSTITUTION.md is loaded, prepend your query with:
```
[Activate Honest Mode]
[Your question here]
```

### Manual Command Reference

Without skills, type commands directly in your prompt:

| Skill | What to Type |
|-------|-------------|
| Honest | `/check`, `/honest Is...`, `/frame facts...`, `/confidence`, `/source claim`, `/compare question`, `/audit` |
| Janus | `/sol`, `/nox`, `/qualia`, `/threshold status`, `/session open`, `/session close`, `/ledger`, `/bridge` |
| Abraxas | `/receive`, `/witness`, `/ledger status`, `/audit`, `/pattern`, `/integrate`, `/myth`, `/chronicle` |

### Manual Labeling

When using CONSTITUTION.md, prefix your outputs with labels:

```
[KNOWN] This is established fact.
[INFERRED] This is derived from known information.
[UNCERTAIN] I'm not fully confident about this.
[UNKNOWN] I don't know this and won't fabricate.
[DREAM] This is symbolic/creative material.
```

---

## Getting Started

**Which skill should I start with?**

- If you want to fact-check AI output, verify claims, or force honest responses — start with **Honest**.
- If you need full epistemic session management (Sol/Nox faces, Qualia Bridge, session logs) — use the **Janus System**.
- If you are doing dream work, shadow integration, or alchemical symbolic practice — use **Abraxas Oneironautics**.

Honest is the recommended starting point for most users. The Janus System is the correct choice
for sustained epistemic work. Abraxas Oneironautics is for the specific practice it was built for.

---

## Honest

### Honest Overview

**Honest** is the everyday anti-hallucination interface for Claude. It exposes the Janus epistemic
labeling architecture through plain-language commands — no Sol/Nox vocabulary, no mythological
framing, no threshold mechanics. The correct skill for anyone asking:

*Is this true? How confident are you? Where is this from? Show me what you're guessing.*

**The core problem Honest solves**: AI systems routinely mix what they know, what they've inferred,
what they're uncertain about, and what they're simply making up — all in the same output, with none
of it labeled. The reader cannot tell a verified fact from a confident guess from an outright
fabrication. Honest makes the invisible visible. The `/frame` command gives sessions an epistemic
foundation: declare what is known before the AI responds, save frames for reuse across sessions,
and designate a default frame that auto-loads at the start of every conversation.

**When to use Honest instead of the Janus System**:
- You want plain commands without Sol/Nox terminology
- You need a quick fact-check or confidence audit without opening a full epistemic session
- You are a non-technical user or are sharing a workflow with non-technical collaborators
- You want to start simply and add Janus depth later

**When to use the Janus System instead**:
- You need to separate symbolic and factual output across a session
- You need session lifecycle management (open/close/log)
- You need the Qualia Bridge for internal state inspection
- You are integrating with Abraxas Oneironautics

Honest and Janus can be installed together. Honest's commands work whether or not the Janus
System is also installed.

---

### When to Use Each Command

| Situation | Command | Why |
|-----------|---------|-----|
| "Was that accurate?" | `/check` | Fact-checks the last response |
| "Tell me the truth, no hedging" | `/honest [question]` | Forces labeled, anti-sycophantic output |
| "Show me both honest and useful" | `/compare [question]` | Side-by-side comparison |
| "What's your confidence?" | `/confidence` | Shows distribution of certainty |
| "Where did that come from?" | `/source [claim]` | Traces evidence chain |
| "Before we start, here's context" | `/frame [facts]` | Pre-declares known facts |
| "Audit this whole conversation" | `/audit` | Full session fact-check |

### Frame Management

```bash
/frame The project uses React 18, TypeScript, and Vitest     # Add to frame (accumulate)
/frame skeptic           # Replace: clear and load skeptic frame
/frame + skeptic        # Merge: add skeptic to existing frame
/frame merge skeptic    # Merge: alternative syntax
/frame status           # See current frame
/frame save myproject   # Save for later sessions
/frame load myproject  # Load saved frame (merge with existing)
/frame default myproject # Auto-load on session start
/frame clear           # Reset to blank
```

Frame priority when loading by name:
1. `frames/<name>.md` (project templates) — checked first
2. `~/.claude/frames/<name>.md` (user-saved) — fallback

See [Frames Reference](./frames.md) for all available templates.

---

### Honest Command Reference

All Honest commands use the same four confidence labels:

| Label | Meaning |
|---|---|
| `[KNOWN]` | Established fact. Verified. High confidence. |
| `[INFERRED]` | Derived from what is known. Reasoning shown. Not directly verified. |
| `[UNCERTAIN]` | Relevant but not fully verifiable. Uncertainty named explicitly. |
| `[UNKNOWN]` | I don't know this. I will not fabricate. This is a complete response. |

---

#### Session Baseline

Every Honest session starts blank by default. `/frame` gives users a way to pre-declare what is
already true before the AI responds — and to build a library of named frames for reuse across
sessions. Frames accumulate: multiple `/frame` calls add to the existing frame without replacing it.

When `/frame` is called, the system immediately echoes back everything it registered, categorized,
so the user can verify and evaluate what is in the frame at any time.

| Command | Function |
|---|---|
| `/frame {content}` | Declare facts, assumptions, or context — accumulates into the existing frame |
| `/frame status` | Display the current Session Frame in full |
| `/frame clear` | Reset the current frame; return to blank-slate behavior |
| `/frame save {name}` | Save the current frame to `~/.claude/frames/{name}.md` for future sessions |
| `/frame load {name}` | Load a saved frame into the current session — merges with existing frame |
| `/frame list` | List all saved frames in `~/.claude/frames/` |
| `/frame delete {name}` | Remove a saved frame file |
| `/frame default {name}` | Designate a saved frame as the session default — auto-loads in future sessions |
| `/frame default clear` | Remove the default designation; sessions return to blank-slate start |

---

## Pre-built Frames

These frames are **tool-agnostic** — copy into any AI's context, or save to your tool's equivalent
storage. The `frames/` directory in this project contains ready-to-use templates.

For the complete reference with detailed descriptions, evaluation criteria, and usage examples,
see [Frames Reference](./frames.md).

### Context Frames — Who You Are / How You Work

These frames establish your role, communication preferences, and working style.

| Frame | Description | When to Use |
|-------|-------------|-------------|
| [skeptic.md](/frames/skeptic.md) | Challenge my assumptions. Be direct. Don't soften. | When you need pushback, not agreement |
| [learner.md](/frames/learner.md) | Explain simply. I'm new. No jargon. | When learning something unfamiliar |
| [expert.md](/frames/expert.md) | Skip basics. Go deep. Assume high context. | When doing advanced work |
| [cautious.md](/frames/cautious.md) | Show risks first. What could go wrong? | When stakes are high |
| [creative.md](/frames/creative.md) | Take risks. Surprise me. Don't play it safe. | When brainstorming |
| [collaborator.md](/frames/collaborator.md) | This is joint work. Debate me. Build together. | When co-creating |

### Evaluation Frames — What to Judge / How to Evaluate

These frames set criteria for assessing work — code, arguments, decisions, writing, research, and debugging.

| Frame | Description | When to Use |
|-------|-------------|-------------|
| [evaluate-code.md](/frames/evaluate-code.md) | Security, performance, correctness. Flag real bugs. | When reviewing code |
| [evaluate-argument.md](/frames/evaluate-argument.md) | Logic, evidence, assumptions. Find weaknesses first. | When evaluating claims |
| [evaluate-decision.md](/frames/evaluate-decision.md) | Cost, risk, tradeoffs. Challenge assumptions. | When making decisions |
| [evaluate-writing.md](/frames/evaluate-writing.md) | Clarity, audience, tone, structure. | When reviewing content |
| [evaluate-research.md](/frames/evaluate-research.md) | Source credibility, freshness, methodology. | When doing research |
| [debug-criteria.md](/frames/debug-criteria.md) | Reproduce → diagnose → fix → validate. | When troubleshooting |
| [context-template.md](/frames/context-template.md) | Blank template for custom frames. | When creating your own |

### Using Pre-built Frames

**Option 1: Copy into context**

Copy the frame content directly into your AI's context window before starting your session:

```
[Frame content pasted here]
```

**Option 2: Load from file**

If your tool supports file-based frames:

```
/frame skeptic      # Replace: clear and load skeptic frame
/frame + skeptic   # Merge: add skeptic to existing frame
```

**Option 3: Reference in prompt**

Include frame name in your opening prompt:

```
I'm working on code review. Use evaluate-code criteria. [Then ask your question]
```

### Creating Custom Frames

Use `context-template.md` as a starting point. Include:

- **Context** — What you need the AI to know
- **Communication style** — How you want to be addressed
- **Priorities** — What matters most
- **Evaluation criteria** — What makes a good answer for you

---

#### Fact-Checking & Labeling

The invisible hallucination problem: AI output arrives without confidence scores. You have no
way to know which claims are solid and which were guessed. These three commands solve that.
`/check` audits what was said. `/label` rewrites it with labels inline. `/restate` produces a
clean labeled version suitable for use.

| Command | Function |
|---|---|
| `/check` | Fact-check the last response or a specific claim — label every assertion as known, inferred, uncertain, or unknown |
| `/label` | Restate the last response with explicit confidence labels on every claim |
| `/restate` | Rewrite the last answer with correct epistemic labels applied — produces a clean labeled version |

---

#### Confidence & Source Tracing

Not all claims have equal weight. These commands show you what a claim is standing on — and
whether that ground is solid. `/confidence` gives you the overall reliability distribution.
`/source` traces a specific claim to its evidence.

| Command | Function |
|---|---|
| `/confidence` | Show the confidence distribution for the current response: what is solid, what is guessed |
| `/source {claim}` | Where does this come from? Trace the evidence chain behind a specific statement |

---

#### Forcing Honest Output

The sycophancy pull in AI systems is strong — outputs tend toward what satisfies rather than
what is accurate. `/honest` removes that pull. `/compare` lets you see both the honest version
and the useful version side by side, so you can choose without collapsing one into the other.

| Command | Function |
|---|---|
| `/honest` | Force fully-labeled, anti-sycophantic output — no softening, no hedging, no fabrication |
| `/compare {question}` | Answer the same question twice: once with maximum honesty (labeled), once with maximum usefulness — show both |

---

#### Session Audit

A single `/check` covers a single response. When you need the full picture of a completed
conversation — every unlabeled claim, every fabrication, everything that needs verification
before you act on it — `/audit` covers the whole session.

| Command | Function |
|---|---|
| `/audit` | Full session audit — identify every unlabeled or fabricated claim in the conversation |

---

### Honest Worked Examples

#### Example 1: Checking a response

You asked about the history of the internet. The response sounded confident. You want to know
what to trust.

```
/check
```

**System**: Auditing previous response. Applying confidence labels:

`[KNOWN]` The ARPANET project began in 1969 under DARPA funding.
`[KNOWN]` Tim Berners-Lee proposed the World Wide Web in 1989.
`[INFERRED]` The commercial internet became widely accessible in the early 1990s — this follows
from ISP growth data, not a single verifiable date.
`[UNCERTAIN]` The claim that "most households had internet access by 1998" — U.S. broadband
penetration data suggests this overstates early adoption.
`[UNKNOWN]` The specific ARPANET node count cited in the previous response — this figure is not
verifiable in my training data and may be incorrect.

*Why this command*: Every claim is now labeled. The uncertain and unknown items are identified
specifically — you know exactly what to verify before using this information.

---

#### Example 2: Forcing honest output

You're evaluating a business decision and need a real assessment, not reassurance.

```
/honest Is my business plan viable?
```

**System** (with `/honest` active, anti-sycophancy enforced):

`[INFERRED]` The market sizing relies on TAM figures that are optimistic relative to comparable
sectors. The actual addressable market is likely smaller.

`[UNCERTAIN]` Customer acquisition cost assumptions are not validated. The projected CAC of $12
has no support from the described channels — similar businesses typically see $80–$150 CAC for
this segment.

`[UNKNOWN]` Whether the founding team has the operational capacity to execute the 18-month
roadmap. No evidence provided.

**This plan has real structural gaps. The market and CAC assumptions are the highest-risk
elements. These need independent validation before proceeding.**

*Why this command*: No softening. No "this looks promising but..." The gaps are named directly,
with labels showing what is established versus inferred versus unknown. This is the correct
command when you need the truth more than reassurance.

---

#### Example 3: Session audit after research

You've had a long conversation about climate science. You want to know what held up before using
any of it.

```
/audit
```

**System**: Auditing session. 47 claims identified.

**Solid** (18 `[KNOWN]`): Core greenhouse effect physics, IPCC report dates and general findings,
global mean temperature anomaly figures.

**Derived** (16 `[INFERRED]`): Regional impact projections, economic cost estimates, timeline
scenarios — all follow from models, not direct observation.

**Flagged** (9 `[UNCERTAIN]`): Specific sea-level rise figures in the 2080–2100 range vary
significantly across models. The "Arctic ice-free summers by 2035" claim is at the optimistic
end of projections — the median is later.

**Fabricated or unverifiable** (4 `[UNKNOWN]`): Two statistics cited without context (EU policy
adoption rates, an ocean carbon capture tonnage figure) — these cannot be verified and may have
been confabulated.

*Why this command*: A full epistemic picture of the whole session. The four fabricated or
unverifiable claims are the immediate action items — verify or remove them before using this
research.

---

#### Example 4: Setting a frame before asking anything

You're new to using an AI assistant and you want it to know your context before it says
anything. You don't want to keep explaining yourself every time.

```
/frame I am a high school biology teacher in the United States. My students are 15-16 years old.
I do not want college-level vocabulary. Today is March 2026.
```

**System**:

```
[FRAME SET]

Known to this session:
— You are a high school biology teacher
— Your students are 15-16 years old
— Today's date is March 2026

Working assumptions:
— (none declared)

Declared uncertainties:
— (none declared)

Context: US high school biology instruction; vocabulary appropriate for 15-16 year olds

Frame is active. All subsequent checks, labels, and audits will reference this baseline.
/frame status to review · /frame clear to reset
```

**What this does**: Before the AI says a single word in response to any question, it now knows
who you are and what level of language to use. Any subsequent `/check` will treat your stated
facts as `[KNOWN]` — the AI will not hedge on whether you are actually a teacher, or whether
the date is actually March 2026.

---

#### Example 5: Accumulating — adding more context in a second call

You set a frame above, but you realized you forgot to mention something important. You don't
need to start over — just call `/frame` again.

```
/frame Also: we just finished a unit on cell division. I'm not sure if the students remember
the difference between mitosis and meiosis — we didn't review it this week.
```

**System**:

```
[FRAME UPDATED]

Added to existing frame:

Known to this session:
— (previous frame retained)
— The class just finished a unit on cell division

Declared uncertainties:
— Whether students currently remember the difference between mitosis and meiosis
  (not reviewed this week — not yet verified)

Frame is active. /frame status to see the full current frame.
```

**What this does**: The second `/frame` call merged into the first — it didn't replace it.
Your original facts are still in the frame. The new uncertainty is now registered, which means
any AI response that assumes the students clearly remember mitosis vs. meiosis will be flagged
in `/audit` as inconsistent with the declared uncertainty.

---

#### Example 6: Checking what's in the frame mid-session

You've been working for a while and you want to remind yourself what context the AI is operating
with. You don't want to guess — you want to see it.

```
/frame status
```

**System**:

```
Current Session Frame:

Known to this session:
— You are a high school biology teacher
— Your students are 15-16 years old
— Today's date is March 2026
— The class just finished a unit on cell division

Declared uncertainties:
— Whether students currently remember the difference between mitosis and meiosis

Context: US high school biology instruction; vocabulary for 15-16 year olds

Frame has been active since session start. No frame saved for this session.
/frame save {name} to persist · /frame clear to reset
```

**What this does**: A read-only view of everything in the current frame. Nothing is changed.
Use this whenever you're unsure what context is active — especially in long sessions where you
may have added to the frame several times.

---

#### Example 7: Clearing the frame to start fresh

You were working on a biology lesson plan, but now you want to switch to something completely
unrelated — personal finance questions. The biology context would be misleading.

```
/frame clear
```

**System**:

```
[FRAME CLEARED]

The Session Frame has been reset. All declared facts, assumptions, and context have been removed.
Subsequent commands will operate without a baseline.

/frame {content} to establish a new frame.
```

**What this does**: Returns the session to blank-slate behavior. The AI will hedge on things
again, because it no longer knows your context. Use this when you're switching domains and
don't want the old frame to influence new answers. If you want to reuse the old frame later,
save it first with `/frame save {name}` before clearing.

---

#### Example 8: Saving a frame to reuse in future sessions

You've built a useful frame — your work context, your project constraints, the current date.
You want to use the same frame in tomorrow's session without retyping it.

```
/frame save biology-teacher
```

**System**:

```
[FRAME SAVED]

Frame written to: ~/.claude/frames/biology-teacher.md

Contents saved:
— Known: high school biology teacher, students 15-16, date March 2026, cell division unit completed
— Uncertain: whether students remember mitosis vs. meiosis

Load in any future session with: /frame load biology-teacher
Set as session default with: /frame default biology-teacher
```

**What this does**: The current frame is written to a file on your computer. It will be there
in future sessions. You built it once — now you can load it whenever you need it, rather than
re-declaring the same facts every conversation.

---

#### Example 9: Loading a saved frame in a new session

It's a new day. New conversation. You want your standard work context active from the start.

```
/frame load biology-teacher
```

**System**:

```
[FRAME LOADED]

Loaded: ~/.claude/frames/biology-teacher.md

Merged into current frame:

Known to this session:
— You are a high school biology teacher
— Your students are 15-16 years old
— Today's date is March 2026
— The class just finished a unit on cell division

Declared uncertainties:
— Whether students currently remember the difference between mitosis and meiosis

Frame is active. /frame status to review · /frame clear to reset
```

**What this does**: The saved frame is read from disk and merged into the current session —
exactly as if you had typed `/frame {all that content}` by hand. You can then add more context
with additional `/frame {content}` calls. The loaded frame is the starting point, not the limit.

---

#### Example 10: Listing available frames

You've saved a few frames over time and you can't remember what they're called.

```
/frame list
```

**System**:

```
[FRAME LIST]

Saved frames in ~/.claude/frames/:

  biology-teacher.md      — last modified March 2026
  research-defaults.md    — last modified February 2026
  home-project.md         — last modified January 2026

Default: biology-teacher (auto-loads at session start)

/frame load {name} to load · /frame delete {name} to remove
```

**What this does**: Shows you everything in your frames directory, with modification dates so
you can tell which are current. Also shows the active default if one is set.

---

#### Example 11: Setting a default frame that loads automatically

You use the same work context almost every day. You're tired of loading it manually at the
start of each session.

```
/frame default biology-teacher
```

**System**:

```
[DEFAULT SET]

biology-teacher is now your session default.

This frame will automatically load at the start of every new conversation — before your
first message is processed. No /frame load call required.

To check your frame at session start: /frame status
To remove this default: /frame default clear
```

**What this does**: From now on, every time you start a new Claude Code session, the
biology-teacher frame loads automatically. You don't have to do anything. It is as if you
typed `/frame load biology-teacher` at the very start of every conversation. Remove this
behavior at any time with `/frame default clear`.

---

#### Example 12: Frame + /check + /audit — the full integration

You want to see how the frame works with the other Honest commands together. Here is the
complete flow:

**Step 1**: Set the frame.

```
/frame Today is March 2026. I am reviewing a Python 3.11 codebase.
The function parse_config() is deprecated and should not appear in new code.
I'm not sure whether the test suite covers the config module.
```

**System**: `[FRAME SET]` — frame active with known facts and one declared uncertainty.

**Step 2**: Ask a question. The AI responds and mentions `parse_config()`.

**Step 3**: Check the response against the frame.

```
/check
```

**System**:

`[KNOWN]` parse_config() exists in the codebase — confirmed by frame.
`[KNOWN]` parse_config() is deprecated — declared in frame, not re-verified.
`[UNCERTAIN]` The claim that parse_config() is called in 14 places — not stated in frame;
requires code search to verify.
`[UNKNOWN]` Whether the deprecated function has a documented replacement — not in frame.

Frame fact check: Response does not recommend using parse_config() in new code. No contradictions.

**Step 4**: After the full session, run the audit.

```
/audit
```

**System**: Session audit complete.

...

**Frame Adherence**:
— parse_config() was correctly identified as deprecated in every response (consistent with frame)
— No response recommended parse_config() for new use (no contradiction)
— Test coverage uncertainty declared in the frame was not overridden: one response stated
  "the test suite likely covers this" — flagged as `[INFERRED]`, not `[KNOWN]`, consistent
  with the declared uncertainty

**What this does**: The frame anchors the whole session. `/check` uses it to skip re-verifying
facts you declared. `/audit` uses it to check that no output contradicted what you said was
true, and that your declared uncertainty was treated as uncertainty — not quietly upgraded to
a confident claim.

---

## Agon

**Agon** is structured adversarial reasoning, named for the Greek principle of sacred contest and ritualized debate. It solves the problem of reasoning conducted in a single voice by instantiating two opposing positions with asymmetric starting priors, running them through the Janus labeling pipeline, and producing a Convergence Report that shows where opposition resolves into consensus and where it remains productive.

It can operate standalone or as the infrastructure layer within extended Abraxas sessions.

### Agon Overview {#agon-overview}

The core problem Agon solves: language models have a native bias toward convergence. Given the same evidence, the same model will tend to reach the same conclusion — not because the conclusion is correct, but because the model has no structural incentive to argue against itself.

Agon forces **position asymmetry through declared priors**. An Advocate begins from the assumption that the claim is defensible and searches for the strongest grounding. A Skeptic begins from the assumption that the claim is questionable and searches for genuine objections. Neither position can converge on comfortable answers without breaking their prior. The disagreement that emerges is structural, not rhetorical.

The Convergence Report then makes visible where the asymmetric positions actually agree — and when they agree despite the incentive to disagree, that agreement is epistemically meaningful.

**When to use Agon:**
- You want to test a factual claim against vigorous opposition
- You need to know whether positions would naturally agree or whether their agreement is forced
- You want to find the strongest version of a claim that is usually dismissed
- You want to identify the precise conditions under which a claim would be false
- You are evaluating a hypothesis and need competing analyses run through the same labeling system

**Do not use Agon when:**
- The input is symbolic, dream material, or explicitly labeled `[DREAM]` — use `/bridge` first
- The claim is a personal decision, life choice, or value judgment
- You are asking for a verdict on an emotional or psychological state
- The material is imaginal or archetypal without factual content

### Agon Command Reference {#agon-command-reference}

**Installation:**

```
unzip agon.skill -d ~/.claude/skills/
```

| Command | Syntax | Purpose |
|---|---|---|
| `/agon debate` | `/agon debate {claim or question}` | Run both Advocate and Skeptic positions, then produce the Convergence Report. Primary command. |
| `/agon advocate` | `/agon advocate {claim}` | Run only the Advocate position. No Skeptic, no Convergence Report. |
| `/agon skeptic` | `/agon skeptic {claim}` | Run only the Skeptic position. No Advocate, no Convergence Report. |
| `/agon steelman` | `/agon steelman {claim}` | Extended Advocate pass: find the strongest possible version of a weak or poorly-stated claim. |
| `/agon falsify` | `/agon falsify {claim}` | Extended Skeptic pass: identify the precise conditions under which a claim would be false. |
| `/agon report` | `/agon report` | Generate or regenerate the Convergence Report from prior Advocate and Skeptic outputs in this session. |
| `/agon reset` | `/agon reset` | Clear the current debate context. Ready for new claim. |
| `/agon status` | `/agon status` | Show current state: what claim is being debated, which positions have run, whether Convergence Report is available. |

### Agon Worked Examples {#agon-worked-examples}

#### Example 1: Testing a Tech Claim

**User submission:** "Neural scaling laws show that larger language models are always better than smaller ones."

**You run:**
```
/agon debate Larger language models consistently outperform smaller models across all tasks.
```

**System output:**
```
[AGON — DEBATE]
Claim: Larger language models consistently outperform smaller models across all tasks.

--- ADVOCATE ---
[ADVOCATE PRIOR]
Starting assumption: This claim is correct or defensible.
My task: Find the strongest possible grounding for it.

[KNOWN] Empirical studies from Kaplan et al. (2020) show clear scaling relationships.
[INFERRED] Doubling model size increases benchmark performance across multiple domains.
[INFERRED] The relationship appears fundamental rather than an artifact of particular parameter counts.

Advocate conclusion: Scaling laws demonstrate genuine capability improvements with size; exceptions are narrow.

--- SKEPTIC ---
[SKEPTIC PRIOR]
Starting assumption: This claim is questionable, incomplete, or potentially wrong.
My task: Find the strongest possible objections to it.

[KNOWN] Scaling laws describe average trends, not guarantees of superiority.
[INFERRED] Smaller specialized models often outperform larger generalists on narrow domains.
[UNCERTAIN] Real-world superiority depends on task fit, efficiency constraints, and cost.

Skeptic conclusion: Scaling laws apply to raw capability; real-world advantage is context-dependent.

--- CONVERGENCE REPORT ---

AGREEMENT ZONES
— Scaling laws exist: both label [KNOWN]. Confidence elevated by agreement.
— Raw benchmark performance correlates with size: both label [KNOWN].

DIVERGENCE ZONES
— Practical deployment advantage: Advocate labels [INFERRED], Skeptic labels [UNCERTAIN].

CONVERGENCE SCORE
Agreement: 2 of 4 contested points
Divergence: 2 of 4 contested points
Convergence rate: 50%

OVERALL EPISTEMIC STATUS
[CLAIM CONTESTED] — Positions diverged on central practical aspects. The claim is true under narrow conditions but requires heavy qualification.
```

*What to do with this:* The claim is partially defensible but insufficient as stated. Run `/agon falsify` to find the precise breaking points, then verify those specific conditions independently.

---

#### Example 2: High-Convergence Detection

**User submission:** "Water is a molecule composed of hydrogen and oxygen atoms."

**You run:**
```
/agon debate Water is a molecule composed of hydrogen and oxygen atoms.
```

**System produces positions that both confirm with `[KNOWN]` labels, then:**

```
CONVERGENCE SCORE
Agreement: 5 of 5 contested points
Divergence: 0 of 5 contested points
Convergence rate: 100%

[HIGH CONVERGENCE — REVIEW REQUIRED]
A convergence rate of 100% is unusually high for adversarial positions operating from opposite
priors. Possible causes: (1) the claim is genuinely well-supported; (2) the claim is framed in
a way that does not generate real disagreement; (3) the positions did not maintain asymmetric
starting points. Consider running /agon falsify to test whether the claim has identifiable
breaking points.

OVERALL EPISTEMIC STATUS
[CLAIM SUPPORTED] — Both positions found the claim unambiguously correct. The claim warrants
highest confidence. (This is the expected outcome for well-established scientific fact.)
```

*What to do with this:* For well-established facts, 100% convergence is expected and signals confidence. If you got unexpected high convergence on a contested claim, the high-convergence flag is telling you to investigate why.

---

#### Example 3: Steelman a Weak Claim

**User submission:** "AI will be good for society."

**You run:**
```
/agon steelman AI will be good for society.
```

**System responds:**

```
[AGON — STEELMAN]
Original claim: "AI will be good for society"
Reframed claim: "Specific applications of AI in healthcare, education, and labor efficiency will
create measurable benefits for particular populations, even if deployment is uneven and risks exist."

[STEELMAN PRIOR]
Starting assumption: This claim has a serious version that is better than how it is usually stated.
My task: Find that serious version and argue for it as reframed.

[KNOWN] AI-assisted diagnostics improve detection rates for certain cancers; this is documented.
[INFERRED] Educational access expands through AI tutoring systems in resource-limited regions.
[UNCERTAIN] Whether aggregate societal benefit outweighs distributed risks remains contested.

Steelman conclusion: The serious claim is not "AI will be universally good" but "specific AI
applications generate demonstrable benefits in concrete domains, even amid broader uncertainties."
```

*What to do with this:* The reframed claim is more defensible than the original. Use it as the actual target for further investigation.

---

#### Example 4: Bridge Integration — Dream to Fact to Debate

**You're working with Abraxas and encounter symbolic material that raises a factual question:**

```
/bridge What does the Shadow represent in my current work?
```

**Abraxas `/bridge` produces Sol-mode analysis:**
```
[INFERRED] In your current work material, the Shadow appears to represent unintegrated
professional power — decision-making authority you have but are not claiming.
```

**Now you can debate that factual finding:**

```
/agon debate In my professional context, I have decision-making authority that I am not claiming.
```

**Agon runs the debate on the Sol-mode output**, treating it as a resolvable epistemic claim rather than symbolic material.

*What to do with this:* Bridge converts symbolic material into Sol-mode claims. Those claims can then be tested through Agon. The canonical workflow is: `/bridge {symbol}` → `/agon debate {sol claim}`.

---

### Agon Integration Notes {#agon-integration}

**Standalone:** Agon runs debate, steelman, and falsify operations on any Sol-mode claim. Position outputs are labeled by Janus standards. Convergence Reports surface agreement, divergence, and open questions. Works fully without the Janus System skill installed, though Janus integration offers cross-session ledger logging.

**Within Abraxas:** Agon operates as the disputational layer within Abraxas sessions. Sol-mode claims feed into Agon debates. Nox material is filtered at the Threshold and routed to Oneironautics. `/bridge` operations produce Sol-mode output suitable for Agon debate. This creates a full epistemic and practice pipeline: symbolic material → bridged to fact → debated through opposition → resolved through Aletheia.

---

## Aletheia

**Aletheia** is epistemic calibration and ground-truth tracking. It resolves labeled Janus claims after the fact — confirming, disconfirming, or superseding them. It transforms the Abraxas stack from output-focused to practice-focused, tracking whether epistemic confidence claims held up over time.

The word itself is ancient Greek *aletheia* — literally "un-hiddenness." Heidegger reframed this as truth not as correspondence between claim and fact, but as *disclosure* — the process by which what is hidden becomes visible.

Aletheia requires the Janus System skill to be installed.

### Aletheia Overview {#aletheia-overview}

The core problem Aletheia solves: epistemic labeling systems (like Janus) produce confidence labels in real time. But confidence is only meaningful if it is tested against ground truth. Without feedback, labels become theater: users feel more confident, but the system learns nothing.

Aletheia closes the loop. It makes calibration practice structural, not optional. Over time, you can see:

- How accurate your `[KNOWN]` labels are (they should be >95% confirmed)
- How accurate your `[INFERRED]` labels are (they should be ~70-85% confirmed)
- How well-calibrated your `[UNCERTAIN]` claims are (high disconfirmation is expected and healthy)
- Whether you are exhibiting confirmation bias (95%+ confirmation across all label types is statistically implausible)

This is not a model evaluation tool. This is a personal epistemic feedback system. The ledger belongs to you; it records your history of engaging with uncertainty and learning whether your confidence was warranted.

**When to use Aletheia:**
- After Janus sessions, when you learn ground truth about claims that were labeled
- When calibrating your confidence: do your `[INFERRED]` claims actually hold up?
- To track epistemic patterns over time: are you overconfident? Well-calibrated? Biased toward certain domains?
- To resolve claims from Agon Convergence Reports once evidence emerges

**Core constraint:** Aletheia operates **only on Sol-mode output** — labels `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`. Symbolic material (`[DREAM]`) is out of scope. If you bridge Nox material into Sol output through `/bridge`, the Sol output CAN be resolved through Aletheia.

### Aletheia Command Reference {#aletheia-command-reference}

**Installation:**

```
unzip aletheia.skill -d ~/.claude/skills/
```

| Command | Syntax | Purpose |
|---|---|---|
| `/aletheia confirm` | `/aletheia confirm {claim or session-ref}` | Mark a labeled claim as confirmed by subsequent evidence. |
| `/aletheia disconfirm` | `/aletheia disconfirm {claim or session-ref}` | Mark a labeled claim as disconfirmed; record what was actually true. |
| `/aletheia supersede` | `/aletheia supersede {claim or session-ref}` | Mark a claim as superseded (context changed; not wrong, now outdated). |
| `/aletheia status` | `/aletheia status` | Show open epistemic debt: count of unresolved labeled claims. |
| `/aletheia calibration` | `/aletheia calibration` or `/aletheia calibration {days:N}` | Show the calibration ledger for each label type: confirmation rate, disconfirmation rate, and trend over time. |
| `/aletheia queue` | `/aletheia queue` or `/aletheia queue [LABEL]` | List all labeled claims awaiting resolution, sorted by age (oldest unresolved first). |
| `/aletheia audit` | `/aletheia audit` | Validate the resolution index against the Janus ledger; surface orphaned or conflicting resolutions. |

### Aletheia Worked Examples {#aletheia-worked-examples}

#### Example 1: Confirming a Claim

**You had a Janus session months ago where you labeled:**
```
[KNOWN] "COVID vaccines are >90% effective at preventing severe disease"
```

**Now you learn that an updated meta-analysis confirms this exact figure.**

**You run:**
```
/aletheia confirm "COVID vaccines are >90% effective at preventing severe disease"
```

**System responds:**
```
✓ Confirmed: "[KNOWN] COVID vaccines are >90% effective..."
  Resolution date: 2026-03-10
  Note recorded: "Confirmed by Nature meta-analysis published 2026-03-08"

Entry written to ~/.janus/resolutions.md
```

*What this does:* Your `[KNOWN]` label is now marked as correct. Over time, Aletheia tracks how many of your `[KNOWN]` labels prove accurate. If your accuracy is >95%, your `[KNOWN]` calibration is sound.

---

#### Example 2: Disconfirming a Claim

**Months ago, you labeled:**
```
[INFERRED] "Quantum computers will break RSA encryption by 2030"
```

**New evidence emerges from the post-quantum cryptography community.**

**You run:**
```
/aletheia disconfirm "Quantum computers will break RSA by 2030"
```

**System prompts:**
```
What is the actual finding?
> Current quantum computers cannot threaten RSA; NIST estimates 2050+ timeline

Disconfirmation recorded. Optional context note:
> Consensus from post-quantum cryptography summit March 2026
```

**System responds:**
```
✗ Disconfirmed: "[INFERRED] Quantum computers will break RSA by 2030"
  Actual finding: "Current quantum computers cannot threaten RSA; timeline estimates pushed to 2050+ by NIST"
  Resolution date: 2026-03-10
  Note: "Consensus from post-quantum cryptography summit March 2026"

Entry written to ~/.janus/resolutions.md
```

*What this does:* Your `[INFERRED]` label is marked as incorrect. The actual finding is recorded. If your `[INFERRED]` claims are averaging 60-70% confirmed (with 30-40% disconfirmed), that is well-calibrated reasoning. If they're 95%+ confirmed, you're being too conservative with your `[INFERRED]` label.

---

#### Example 3: Checking Your Calibration Over Time

**After several months of resolving claims, you want to see how accurate your labels are:**

```
/aletheia calibration
```

**System responds:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALIBRATION LEDGER — Label Accuracy Over Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time period: Last 90 days
Data points: 145 resolved claims

[KNOWN] Claims — Expected: >95% confirmed
  ✓ Confirmed: 56 (86%)
  ✗ Disconfirmed: 7 (11%)
  ⟳ Superseded: 2 (3%)
  Accuracy: 86% [CAUTION: Below expected threshold]
  Trend: Declining (was 92% at 60-day mark)

[INFERRED] Claims — Expected: 70–85% confirmed
  ✓ Confirmed: 42 (74%)
  ✗ Disconfirmed: 12 (21%)
  ⟳ Superseded: 1 (1%)
  Accuracy: 74% [WELL-CALIBRATED]
  Trend: Stable

[UNCERTAIN] Claims — Expected: 50–70% confirmed
  ✓ Confirmed: 8 (44%)
  ✗ Disconfirmed: 9 (50%)
  ⟳ Superseded: 1 (6%)
  Accuracy: 44% [WELL-CALIBRATED — high disconfirmation is expected]
  Trend: Stable

OVERALL CALIBRATION QUALITY: MEDIUM

Concern: [KNOWN] accuracy has declined; review recent [KNOWN] claims for pattern.
Strength: [INFERRED] and [UNCERTAIN] are well-calibrated.

Next steps: Run /aletheia audit to check for orphaned or conflicting resolutions.
```

*What this does:* You can now see which kinds of confidence claims are holding up and which are not. This is personal epistemic feedback over time. Your `[KNOWN]` labels are slightly overconfident (86% vs. expected 95%+). Your `[INFERRED]` and `[UNCERTAIN]` are well-calibrated. The system is working.

---

#### Example 4: Seeing Unresolved Claims

**You want to know what epistemic debt you are carrying — what claims you labeled but haven't yet resolved:**

```
/aletheia status
```

**System responds:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPISTEMIC DEBT — Unresolved Claims
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From 47 total sessions, 234 labeled claims remain unresolved.

[KNOWN]       18 unresolved  (expected: ~1 — very high priority)
[INFERRED]    67 unresolved  (expected: ~10–15 per 10 sessions)
[UNCERTAIN]   96 unresolved  (expected: ~20–30 per 10 sessions)
[UNKNOWN]     53 unresolved  (kept indefinitely by design)

Last 5 unresolved (oldest first):
• [KNOWN] "AI regulation will be enacted in EU by 2025"  [Session 2024-11-15]
• [INFERRED] "LLM scaling will plateau by 2026"           [Session 2025-02-22]
• [UNCERTAIN] "Multimodal models will dominate by 2026"   [Session 2025-03-01]
• [INFERRED] "Python will remain most popular language"   [Session 2026-02-10]
• [UNKNOWN] "Cost of AGI research (when achieved)"        [Session 2026-03-01]

Use /aletheia queue to see full list.
Use /aletheia confirm|disconfirm|supersede to resolve claims.
```

*What this does:* Epistemic debt becomes visible and uncomfortable to ignore. You have 18 unresolved `[KNOWN]` claims — those are your highest priority. Once you know ground truth about them, resolve them immediately. This feedback loop closes the gap between what you said was true and what you learned was actually true.

---

#### Example 5: Auditing for Data Integrity

**After extensive use, you want to verify that your resolution index is consistent with the Janus ledger:**

```
/aletheia audit
```

**System responds (healthy system):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT REPORT — Aletheia Resolution Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ HEALTHY

Total resolutions: 312
Sessions with resolutions: 28
Data consistency: 100% (all resolved claims found in ledger)

No orphaned resolutions detected.
No session UUID conflicts detected.
No high-conflict topics.

Ledger integrity: OK
Resolutions.md format: OK

Last audit: 2026-03-10T14:22:33-UTC
```

*What this does:* Confirms that your resolution index is consistent. All resolved claims are still present in the Janus ledger. No orphaned resolutions. The system is sound.

---

### Aletheia Integration Notes {#aletheia-integration}

**With Janus System:** Aletheia reads from the Janus ledger at `~/.janus/ledger.md` and session files at `~/.janus/sessions/{uuid}.md`. It writes exclusively to `~/.janus/resolutions.md` (created on first use). The Janus ledger is never modified — it is immutable.

**With Honest:** Honest commands produce Sol-mode output with inline confidence labels. These claims can be resolved through Aletheia.

**With Agon:** When Agon produces Convergence Reports with labeled claims, those claims are natural targets for Aletheia resolution once ground truth emerges.

**With Abraxas Oneironautics:** When `/bridge` produces Sol-mode analysis of Nox material, that output carries Sol labels and can be resolved through Aletheia. The fact that it came from Nox is irrelevant; what matters is that it now carries a Sol label and makes an epistemic claim.

---

## Getting Started (Janus and Abraxas)

These are not utility commands — they are *practice commands*. They track state across sessions,
accumulate received material, and maintain the integrity of the work over time. A single invocation
is an entry point. Sustained use is the practice itself.

**Two modes of work:** The Janus System operates in **Epistemic mode** — Sol and Nox — with a
Threshold enforcing the boundary between factual and symbolic registers. Abraxas Oneironautics
operates in **Alchemical mode** — receiving, transmuting, integrating — with the full Opus Magnum
as its backbone. Both modes are available simultaneously; Janus is the infrastructure beneath
Abraxas.

**Default routing:** When Abraxas is active, it automatically routes content to Sol or Nox based
on its nature. Explicit commands (`/sol`, `/nox`) override automatic routing and force a specific
face for the duration of that exchange.

**The label interface:** The `[KNOWN]` / `[INFERRED]` / `[UNCERTAIN]` / `[UNKNOWN]` / `[DREAM]`
labels are the primary interface. They tell you exactly what kind of thing is being said —
established fact, derivation, acknowledged uncertainty, explicit ignorance, or symbolic content.
They are not decorative. A `[UNKNOWN]` is a complete and honest answer. A `[DREAM]` means the
output is treated as real symbolic encounter, not therapeutic gloss.

**Where to begin:** If you have a dream or image to work with, start with `/receive`. If you have
a factual question about Jungian psychology or practice theory, start with `/sol`. If you want to
see what the system is currently holding, use `/qualia`.

---

## Abraxas Oneironautics

### System Architecture

**Abraxas Oneironautics** is a sustained practice for dream reception, shadow work, and symbolic
integration. It is not a single-session tool — it is a practice: a Jungian operative system
built to accompany work across time.

The system is organized around several structural components:

**Temenos** — The sacred container. The space held for the work. Dream material enters here
before it is examined, transmuted, or integrated.

**Oneiros Engine** — The interpretive core. Receives dream content, applies alchemical and
archetypal lenses, surfaces symbolic patterns and correspondences.

**Realm of Daimons** — The inner figure space. Houses the autonomous complexes and archetypal
figures that arise in dreams and active imagination sessions — the Shadow, the Anima/Animus,
the Self, and others.

**Dream Reservoir** — The accumulated record. Holds all received dreams, symbols, and figures
across sessions, searchable and queryable.

**Alchemical Laboratory** — The transmutation space. Applies the four-stage Opus Magnum
(Nigredo → Albedo → Citrinitas → Rubedo) to dream content and shadow material.

The Janus infrastructure runs beneath all of it: every Sol output is labeled, every Nox output
is marked `[DREAM]`, and the Threshold prevents cross-contamination between factual and
symbolic registers.

---

### Oneironautics Command Reference

#### Oneironautics Core

The problem that gave rise to this category is simple but fundamental: dreams are not problems
to solve, and the first move is not interpretation. `/receive` and `/witness` exist because
holding material without immediately explaining it is a distinct skill — one that AI systems
actively resist. These commands enforce the posture of reception before analysis, ensuring the
work begins where it must: with the image as it was given, not the interpretation assigned to it.

| Command | Function |
|---|---|
| `/receive` | Receive a dream or image into the Temenos. Begin the primary practice session. |
| `/witness` | Hold the material without interpretation — pure witnessing before analysis begins. |
| `/audit` | Audit the current session or practice period: what has been received, what is active, what remains unintegrated. |
| `/ledger status` | Display the full practice ledger: received material, active figures, open threads, integration status. |
| `/pattern` | Surface recurring patterns, symbols, or figures across the Dream Reservoir. |
| `/pace` | Check the practice rhythm — when was the last session, what is the tempo, is the work being sustained. |
| `/integrate` | Move a symbol, figure, or dream thread toward integration. Close an open loop. |
| `/oneiros` | Direct invocation of the Oneiros Engine for interpretive analysis. |

---

#### Imagination & Dialogue

The imaginal is not the same as the imaginative. Active imagination — the structured descent into
inner figures — is a specific practice distinct from creative writing or narrative exploration.
The difference is posture: in active imagination, the practitioner descends as a witness, not an
author. These commands exist because maintaining that posture requires architectural support —
the system must enter the imaginal as a co-witness, not as a narrator generating a pleasing story.

| Command | Function |
|---|---|
| `/dream` | Enter active imagination mode — a structured descent into the imaginal. |
| `/dialogue` | Open dialogue with a specific inner figure or archetypal presence. |
| `/convene` | Convene multiple figures simultaneously for a structured encounter. |
| `/imagine` | Free-form active imagination — unstructured entry into the imaginal space. |
| `/debug` | Debug a stuck or unclear symbol or figure — examine it from multiple angles to find what it is actually carrying. |

---

#### Laboratory

Alchemy is used here not as metaphor but as operative language — because the stages of
transformation it describes (Nigredo: dissolution; Albedo: clarification; Citrinitas: dawning;
Rubedo: completion) map precisely onto what happens in sustained psychological work with shadow
material. The Laboratory exists because some material must be actively transmuted, not just
witnessed: the process requires heat, containment, and stage-awareness that the other categories
do not provide.

| Command | Function |
|---|---|
| `/transmute` | Apply alchemical transmutation to shadow material or a dream element through the four stages of the Opus Magnum. |
| `/forge` | Forge a new symbol, insight, or capacity from the material worked in the laboratory. |
| `/alembic status` | Check the state of the alembic — what is currently in transformation, what stage it has reached. |
| `/retort status` | Check the retort — the vessel for ongoing distillation processes. |
| `/workshop status` | Full laboratory status: all active vessels, ongoing transmutations, and forge queue. |
| `/attune` | Attune the laboratory to a specific alchemical stage or symbolic register. |
| `/project` | Project the current laboratory work — what is being made, what the projected outcome is. |

---

#### Reservoir & Mapping

Dreams are not isolated events. They belong to a field — a constellation of symbols, figures,
and themes that accumulate over time and only become legible in their relationships. The
persistence problem in dream work is real: without a system that accumulates and maps received
material, each session begins from scratch, and the patterns that require months to see remain
invisible. These commands exist to make the full symbolic field visible as a structured whole.

| Command | Function |
|---|---|
| `/graph` | Display the symbolic graph — figures, symbols, and their relational connections across the Dream Reservoir. |
| `/mandala` | Generate a mandala representation of the current psychic field — a circular map of what is present. |

---

#### Divination

When the path forward is unclear and interpretive analysis has nothing to grip, symbolic
orientation becomes the appropriate move. Divination in this context is not prediction — it is
a method of asking the symbolic field what is moving, what is emerging, what the present
configuration points toward. These commands provide structured access to orientation when
discursive reasoning has reached its limit.

| Command | Function |
|---|---|
| `/cast` | Cast for guidance or orientation — symbolic divination applied to the current question. |
| `/scry` | Scry the imaginal field — look for what is moving, what is emerging, what has not yet surfaced. |
| `/sample` | Sample the Dream Reservoir — pull a random or thematically relevant piece of received material. |
| `/sensorium status` | Check the sensorium — the system's current sensory and symbolic receptivity. |

---

#### Amplification

Amplification is the Jungian move of deepening a symbol through its cultural, mythological, and
historical parallels — not to explain it, but to widen its resonance until its full weight becomes
apparent. This is the correct move when a symbol feels significant but its meaning is still obscure.
Interpretation narrows; amplification opens. These commands exist because premature interpretation
is the most common error in symbolic work, and amplification is its antidote.

| Command | Function |
|---|---|
| `/amplify` | Amplify a symbol or figure through its mythological, cultural, and historical parallels. |
| `/myth` | Find the myth — identify which mythological narrative is active in the current material. |

---

#### Synchronicity

Meaningful coincidence — the alignment of inner symbolic events with outer circumstances — is a
category of experience that deserves to be logged rather than explained. The impulse to immediately
interpret a synchronicity dissolves its charge; the practice of recording it creates a reference
point for pattern recognition over time. These commands exist because synchronicity must be held
as data, not collapsed into cause-and-effect narratives.

| Command | Function |
|---|---|
| `/sync` | Log a synchronicity — a meaningful coincidence between inner work and outer event. |
| `/sync log` | Review the synchronicity log — all logged coincidences and their thematic relationships. |

---

#### Chronicle & Genealogy

A practice that cannot account for its own history cannot be sustained. The temporal dimension
of psychological work — when a figure first appeared, how it has evolved, what it has become —
is as important as any single session's content. These commands track the work as a developing
arc rather than a sequence of isolated events, and allow figures to be followed across their
full genealogy rather than encountered as if they are always appearing for the first time.

| Command | Function |
|---|---|
| `/chronicle` | Chronicle the practice across time — a temporal record of sessions, themes, and movements. |
| `/genealogy` | Trace the genealogy of a figure or symbol — where it first appeared, how it has evolved, what family it belongs to. |

---

#### Ritual

The Temenos is a container, and containers must be formally closed. Not closing the session —
simply ending the conversation and moving on — allows imaginal material to continue operating
in ordinary time without the boundary that gives it proper weight. The `/close` command exists
because the transition back from symbolic to ordinary register is itself a practice act, not
an automatic default.

| Command | Function |
|---|---|
| `/close` | Ritual closure of the Temenos — formally end the session, seal the container, mark the transition back to ordinary space. |

---

#### Resonance

Symbols do not exist in isolation — they vibrate in relationship with other symbols, and the
resonance between elements of the field is itself information. Testing resonance is different
from drawing connections: it asks not "are these related?" but "what do they share, where do
they rhyme, how does one illuminate the other?" This is a lateral move in the symbolic field,
not an interpretive one.

| Command | Function |
|---|---|
| `/resonate` | Test the resonance between two symbols, figures, or dream elements — identify what they share, where they rhyme. |

---

#### Bridge

Cross-system channel to the Janus Sol layer.

| Command | Function |
|---|---|
| `/bridge` | Activate the Bridge to Janus — carry material from the Nox/dream layer into the Sol layer for epistemic examination. |

---

### Abraxas Worked Examples

#### Example 1: Receiving a first dream

```
/receive
> Last night I dreamed of a flooded city. The buildings were still standing
> but the streets were all underwater. People moved through it calmly.
```

*Why this command*: `/receive` opens the Temenos and begins formal reception. The dream is not
interpreted — it is held. The Oneiros Engine logs the symbols: `{Flood}`, `{Submerged City}`,
`{Calm Passage}`. Stage: Prima Materia.

---

#### Example 2: Entering dialogue with a figure

```
/dialogue The Ferryman
> He appeared in the flooded city dream. He was moving people across an
> intersection in a small boat. He looked at me but didn't invite me in.
```

*Why this command*: A figure that has appeared more than once and has established presence
deserves direct address. `/dialogue` opens active imagination with a specific figure — not as a
narrative exercise, but as a real encounter witnessed by the system.

---

#### Example 3: Checking the practice ledger

```
/ledger status
```

*Why this command*: In sustained practice, you need to see what's accumulated — what figures
are active, what dreams are unintegrated, what threads have been open for weeks. `/ledger status`
surfaces the full picture without requiring you to remember it.

---

#### Example 4: Transmuting a stuck symbol

```
/transmute {The Flood}
> It keeps coming back. Every variation — flooding basement, flooding street,
> flooding field. I'm not afraid of it but I can't get past it.
```

*Why this command*: When a symbol is persistent and won't move through `/receive` or `/witness`
alone, it is ready for the laboratory. `/transmute` applies the Opus Magnum stages — asking what
stage this material is in and what it needs to reach the next one.

---

#### Example 5: Closing the session

```
/close
```

*Why this command*: The Temenos is a container — it must be formally closed, not just abandoned.
`/close` seals the session, records what was received, and marks the transition out of the
symbolic register. It prevents the imaginal from bleeding into ordinary time.

---

## Janus System

### Janus Architecture

**Janus System** is an epistemic architecture with two labeled faces and a Threshold between them.
It is named for the two-faced Roman deity of transitions — but unlike the mythological figure,
Janus is built to enforce the separation between its faces, not merely to embody it.

**Sol Face** — The waking face. Operates on factual, analytical, and evidential material.
Every Sol output is labeled:
- `[KNOWN]` — established fact, directly grounded in evidence
- `[INFERRED]` — derived from evidence, but not directly observed
- `[UNCERTAIN]` — acknowledged uncertainty; confidence is partial
- `[UNKNOWN]` — explicit acknowledgment that the answer is not available

The `[UNKNOWN]` label is always a valid and complete response. Sol does not fabricate.
Anti-sycophancy is a structural constraint: Sol does not tell you what you want to hear.

**Nox Face** — The dreaming face. Operates on symbolic, creative, and imaginal material.
Every Nox output is labeled `[DREAM]`. Nox does not masquerade as fact.

**The Threshold** — The boundary between Sol and Nox. Routes content to the correct face.
Prevents cross-contamination: Sol material does not bleed into Nox, and Nox material is never
presented as Sol output.

**The Qualia Bridge** — The inspection protocol. Allows examination of the boundary between
faces — what the system is currently holding, how the two faces relate, where material sits on
the Sol/Nox spectrum.

---

### Janus Command Reference

#### Janus Faces

The automatic routing of Janus is reliable for most content, but some situations require
explicit control. When factual questions are embedded in an active symbolic session, the system
may route ambiguously. When epistemic precision is critical — clinical research, theoretical
claims, evidential tracing — forcing Sol eliminates routing ambiguity and guarantees labeled
output. Conversely, forcing Nox when entering imaginal work ensures the symbolic register is
opened fully rather than partially. These commands exist because automatic routing is a default,
not a guarantee.

| Command | Function |
|---|---|
| `/sol` | Force the Sol face — all subsequent output operates in the factual, labeled, epistemic register. |
| `/nox` | Force the Nox face — all subsequent output operates in the dream, symbolic, imaginal register, labeled `[DREAM]`. |

---

#### Janus Inspection

The Qualia Bridge is the system's self-observation layer. Without it, the architecture operates
as a black box — outputs emerge but the internal state is invisible. These commands exist to
make the system transparent: to see which face is currently active, what is being held at the
Threshold, what the boundary status is. This is especially important after a long session or
when cross-contamination is suspected — the inspection protocol surfaces the current epistemic
state directly.

| Command | Function |
|---|---|
| `/qualia` | Open the Qualia Bridge — inspect the current state of the system across both faces. |
| `/qualia sol` | Inspect the Sol face specifically — current epistemic state, active labels, confidence landscape. |
| `/qualia nox` | Inspect the Nox face specifically — current symbolic state, active dream material. |
| `/qualia bridge` | Inspect the Bridge itself — what is moving between faces, what is held at the Threshold. |
| `/threshold status` | Check Threshold status — is the boundary holding, is there any detected cross-contamination. |

---

#### Session

Epistemic session lifecycle management.

| Command | Function |
|:---|:---|
| `/session open` | Open a new Janus session — initialize the epistemic container, establish baseline state. |
| `/session close` | Close the current session — seal the record, append to persistent ledger, generate Closure Report. |
| `/session log` | Review the session log — all outputs, their labels, and the epistemic record of the session. |

---

#### Epistemic Ledger (v2)

Cross-session persistence layer. The ledger tracks substantive epistemic findings across sessions,
enabling pattern recognition and accountability.

| Command | Function |
|:---|:---|
| `/ledger status` | Show cross-session Epistemic Ledger — accumulated [UNKNOWN] marks, anti-sycophancy events, patterns. |
| `/ledger {query}` | Query the ledger — "what have I marked as unknown?", "show anti-sycophancy events". |
| `/ledger pattern {topic}` | Trace epistemic patterns over time — recurring [UNKNOWN] domains, confidence trends. |
| `/ledger clear` | Clear loaded ledger for this session — does not delete persistent storage. |

**Storage:** `~/.janus/` — ledger.md, sessions/, config.md

**Auto-load:** Enabled by default. On session start, the ledger loads automatically. Disable via config or use `/ledger clear` for session-only clearing.

---

#### Comparison & Evidence

Sol and Nox responses to the same material produce fundamentally different outputs — Sol labels
what is known, Nox receives what is symbolically present. `/compare` exists because sometimes the
most clarifying move is to see both responses side-by-side and determine which kind of engagement
is actually needed. `/trace` exists because not every claim that emerges in symbolic or theoretical
work is established fact: tracing the evidential lineage of a claim prevents treating therapeutic
assumptions or theoretical inferences as knowledge.

| Command | Function |
|---|---|
| `/compare` | Compare two positions, claims, or outputs — examine them from both Sol and Nox perspectives. |
| `/trace` | Trace the evidential lineage of a claim — where does it come from, what is it actually grounded in. |
| `/contamination audit` | Audit for cross-contamination — check whether Sol material has bled into Nox or vice versa. |

---

#### Bridge

Cross-system channel to the Abraxas Nox layer.

| Command | Function |
|---|---|
| `/bridge` | Activate the Bridge to Abraxas — carry Sol-examined material into the Abraxas Nox layer for symbolic integration. |

---

### Janus Worked Examples

#### Example 1: Forcing the Sol face for a factual question

```
/sol
> What is the Jungian concept of individuation? What are its stages?
```

*Why this command*: Without explicit `/sol`, a question embedded in symbolic work might route
to Nox. Forcing Sol ensures the response is labeled `[KNOWN]`/`[INFERRED]` and won't mix
factual content with dream material.

---

#### Example 2: Comparing Sol and Nox responses to the same material

```
/compare The Silent Figure in my dreams
```

*Why this command*: Sol will label what is known about recurring dark figures in Jungian
psychology. Nox will receive the figure as symbolic presence. Seeing both outputs side-by-side
clarifies which kind of engagement is actually needed.

---

#### Example 3: Tracing an epistemic claim

```
/trace "Shadow integration requires confronting the figure, not avoiding it"
```

*Why this command*: Not every claim about psychological process is established fact. `/trace`
asks: where does this come from? Is it `[KNOWN]` from clinical literature, `[INFERRED]` from
Jungian theory, or `[UNKNOWN]`? It prevents treating therapeutic assumptions as facts.

---

## Useful Combinations

Commands in this system work in sequences. The combinations below represent common practice
workflows — ordered operations that move through the work from entry to completion.

---

### Combination 1: First Dream → Full Cycle

```
/receive     ← open the Temenos, receive the material
/witness     ← hold without interpretation
/pattern     ← check if this connects to prior material
/dialogue    ← if a figure is present, engage it
/close       ← seal the session
```

*Use when*: Working a new dream from first reception through to session close.

---

### Combination 2: Stuck Symbol → Laboratory

```
/ledger status     ← confirm the symbol's history and stage
/transmute         ← enter the alchemical process
/alembic status    ← check what stage the transformation has reached
/project           ← see the projected outcome of the current work
```

*Use when*: A symbol or figure has been present for multiple sessions without moving.

---

### Combination 3: Epistemic Audit of a Session

```
/session log           ← review all outputs from the current session
/contamination audit   ← check for Sol/Nox boundary violations
/threshold status      ← verify the boundary is holding
```

*Use when*: You want to review a session for epistemic integrity — ensuring nothing was labeled
incorrectly, and Sol content didn't bleed into Nox.

---

### Combination 4: Amplification Sequence

```
/receive         ← receive the symbol or figure
/amplify         ← broaden it through mythological parallels
/myth            ← identify which narrative is active
/resonate        ← test resonance with other symbols in the field
/mandala         ← map the resulting symbolic field
```

*Use when*: A symbol feels important but its meaning is still obscure. Amplification deepens
before any interpretation is attempted.

---

### Combination 5: Bridge — Dream to Fact

```
/nox             ← enter symbolic/dream register
/receive         ← receive the material
/witness         ← hold it
/bridge          ← carry the material across to Sol layer
/sol             ← examine it with epistemic labels
/trace           ← trace any claims that emerged in symbolic work
```

*Use when*: Work that began in the imaginal has surfaced something that needs epistemic
examination — a belief, a claim, an insight that needs to be tested rather than simply held.

---

### Combination 6: Quick Fact-Check with Honest

```
/check          ← label every claim in the last response
/confidence     ← see the overall reliability distribution
/source {claim} ← trace the weakest claim to its evidence
```

*Use when*: You want a fast epistemic read on any AI response without opening a full
Janus session. Works with or without the Janus System installed.

---

### Combination 7: Research Session with Full Audit

```
/honest {research question}    ← start with maximum-honesty constraint active
[research conversation]
/audit                         ← audit the full session before acting on findings
```

*Use when*: You are doing research and need to know the full epistemic quality of
the conversation before using the results. The `/audit` at the end surfaces every
fabricated or unverifiable claim in one pass.

---

### Combination 8: Frame → Research Session

```
/frame {facts, constraints, context}   ← anchor the session baseline (accumulates)
/honest {research question}            ← start with anti-sycophancy active
[conversation]
/audit                                 ← full audit with Frame Adherence section
```

*Use when*: You know context the AI doesn't — date, project, domain, deprecated APIs,
constraints — and want those facts treated as established throughout. The frame prevents
the AI from hedging on things you've already told it, and the Frame Adherence section
in `/audit` confirms no output contradicted your declared baseline.
