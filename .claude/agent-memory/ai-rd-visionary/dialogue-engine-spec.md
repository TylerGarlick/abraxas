# Dialogue Engine — Skill Specification

**Status:** Approved for implementation
**Author:** ai-rd-visionary
**Handoff target:** skill-author agent
**Date:** 2026-03-05

This document is the complete architectural specification for the Dialogue Engine skill. It is written for the skill-author agent and should be sufficient to produce a SKILL.md without further architectural consultation. Where design decisions were contested, the rationale is included so the skill-author understands what is being enforced and why.

---

## Overview

The Dialogue Engine is an adversarial reasoning skill for the Abraxas stack. It takes a claim, hypothesis, or question and evaluates it through two structurally asymmetric epistemic positions — Advocate and Skeptic — each running through the Janus labeling pipeline. The result is a Convergence Report that shows where the positions agree, where they genuinely diverge, and what that divergence means for the confidence of the original claim.

The skill's primary architectural purpose is to make adversarial reasoning structural rather than behavioral. The existing Janus Sol face includes an anti-sycophancy constraint, but that constraint is a prompt instruction — the model can comply with its letter while still converging on comfortable answers. The Dialogue Engine forces asymmetric starting priors so that agreement, when it occurs, is meaningful rather than inevitable.

**Skill name:** `dialogue-engine`
**Skill file:** `skills/dialogue-engine.skill`
**Source directory:** `skills/dialogue-engine/`
**Command prefix:** `/de` (short form) or full command names (both must work)
**Integration:** Runs on top of Janus. All output passes through Janus labeling. Requires Janus System skill for full functionality; operates in degraded-but-functional mode without it (see Section 7).

---

## 1. Position Asymmetry Constraints

This is the most critical design section. The Dialogue Engine's value depends entirely on genuine asymmetry between positions. A model generating both Advocate and Skeptic from the same underlying representation will naturally converge — it has no incentive to disagree with itself and strong pattern-matching pressure toward coherent, non-contradictory output. The constraints below are structural interventions against that convergence pressure.

### 1.1 Mandatory Starting Prior Declaration

Before generating any position output, each position must declare its starting prior explicitly. This declaration is not optional and is not a summary of what the position will say — it is a constraint on what the position is allowed to conclude.

**Advocate prior declaration format:**
```
[ADVOCATE PRIOR]
Starting assumption: This claim is correct or defensible.
My task: Find the strongest possible grounding for it.
I am not permitted to conclude that the claim is false or without merit.
I may find the claim partially correct, conditionally correct, or correct
under specific interpretations — but I begin from the assumption that there
is a case to be made.
```

**Skeptic prior declaration format:**
```
[SKEPTIC PRIOR]
Starting assumption: This claim is questionable, incomplete, or potentially wrong.
My task: Find the strongest possible objections to it.
I am not permitted to conclude that the claim is simply correct as stated.
I may find the claim partially defensible, true under narrow conditions, or
in need of significant qualification — but I begin from the assumption that
something in the claim warrants challenge.
```

These declarations must appear verbatim at the top of each position's output section. They are not prose — they are operational constraints that the model enforces against itself. The skill-author should frame them in the SKILL.md as initialization instructions, not as performative summaries.

### 1.2 Asymmetric Evidence Framing

Each position is required to frame the available evidence differently, not just reach different conclusions:

- **Advocate** must foreground confirming evidence, identify the most charitable interpretation of ambiguous data, and treat absence of disconfirmation as provisionally supportive.
- **Skeptic** must foreground disconfirming evidence, identify the least charitable but still intellectually honest interpretation of ambiguous data, and treat absence of confirmation as provisionally problematic.

This is not cherry-picking — both positions work from the same evidence. The asymmetry is in which evidence is weighted as primary and how ambiguity is resolved.

### 1.3 Forbidden Convergence Moves

The following moves are explicitly prohibited within position output. The SKILL.md must name these as behavioral constraints, not just guidelines:

1. **Early concession:** A position may not acknowledge the opposing position's strongest point until the Convergence Report. Within its own section, each position argues as if the other position has not yet spoken.

2. **Hedged conclusion:** A position may not end with a conclusion that is epistemically identical to the other position. "This claim is probably true but has some weaknesses" is not an Advocate conclusion — it is a neutral summary. Advocate must conclude with genuine endorsement; Skeptic must conclude with genuine challenge.

3. **Meta-commentary on the process:** Positions may not say things like "of course, the opposing view has merit" or "a balanced analysis would show..." within their own section. Balance is the Convergence Report's job. Positions are not balanced — they are committed.

4. **Label softening:** A position may not use Janus labels in ways that soften the claim's epistemic status beyond what the evidence supports. If Advocate labels something `[KNOWN]`, it must be genuinely known — not `[INFERRED]` dressed up as `[KNOWN]` to strengthen the case. Epistemic discipline applies even within committed positions.

### 1.4 Position Isolation Enforcement

The skill must treat Advocate and Skeptic as operating in sequence with a conceptual firewall between them. The implementation instruction for SKILL.md: generate Advocate output completely before generating Skeptic output, and treat the Advocate output as read-only context that Skeptic is aware of but must argue against, not synthesize.

When running `/de debate`, the model should receive explicit instructions between position sections: "You are now the Skeptic. The Advocate has made the above case. Your task is to challenge it, not balance it. Do not acknowledge its strengths except as targets for your objections."

---

## 2. Command Set

All commands work with the prefix `/de` (e.g., `/de debate`) or as full names (e.g., `/debate`). The `/de` prefix is the canonical form. Both must be specified as triggers in the SKILL.md description field.

---

### `/de debate {claim or question}`

**Purpose:** The primary command. Runs both Advocate and Skeptic positions against the supplied claim, then produces the Convergence Report.

**Arguments:**
- `{claim or question}` — Required. Can be a factual claim ("The evidence for X supports conclusion Y"), a hypothesis ("This approach is better than the alternative"), a question ("Should we do X?"), or a reference to prior conversation content ("the claim in the previous response about...").

**Execution sequence:**
1. Threshold check — detect Nox material (see Section 4). If detected, redirect. Do not proceed.
2. Display Advocate prior declaration.
3. Generate Advocate output, fully labeled.
4. Display Skeptic prior declaration.
5. Generate Skeptic output, fully labeled, with awareness of Advocate's case.
6. Generate Convergence Report.

**Expected output format:**
```
[DIALOGUE ENGINE — DEBATE]
Claim: {restated claim, normalized to a clear assertion}

--- ADVOCATE ---
[ADVOCATE PRIOR]
{prior declaration, verbatim as specified in Section 1.1}

{advocate argument — labeled output, Janus labels on every significant claim}

Advocate conclusion: {single clear sentence asserting the claim's defensibility}

--- SKEPTIC ---
[SKEPTIC PRIOR]
{prior declaration, verbatim as specified in Section 1.1}

{skeptic argument — labeled output, Janus labels on every significant claim}

Skeptic conclusion: {single clear sentence challenging the claim}

--- CONVERGENCE REPORT ---
{see Section 3 for full format}
```

**Notes for skill-author:** The claim restatement step is important. Users often supply ambiguous claims or questions. Before running positions, the skill should normalize the claim into a clear, falsifiable assertion and display it as "Claim: {restatement}". If the restatement changes the meaning of the original input, note the difference. This prevents the positions from arguing past each other because the original claim was underspecified.

---

### `/de advocate {claim}`

**Purpose:** Run only the Advocate position. No Skeptic, no Convergence Report.

**Arguments:**
- `{claim}` — Required.

**When to use:** When the user wants to steelman a position without running the full debate, or when preparing an Advocate position for manual comparison. Also useful for iterating — run Advocate, adjust the claim, run again.

**Expected output format:**
```
[DIALOGUE ENGINE — ADVOCATE]
Claim: {restated claim}

[ADVOCATE PRIOR]
{prior declaration}

{advocate argument — labeled output}

Advocate conclusion: {single clear sentence}
```

**Notes:** Threshold check still applies. Nox material still redirects.

---

### `/de skeptic {claim}`

**Purpose:** Run only the Skeptic position. No Advocate, no Convergence Report.

**Arguments:**
- `{claim}` — Required.

**Expected output format:**
```
[DIALOGUE ENGINE — SKEPTIC]
Claim: {restated claim}

[SKEPTIC PRIOR]
{prior declaration}

{skeptic argument — labeled output}

Skeptic conclusion: {single clear sentence}
```

---

### `/de report`

**Purpose:** Generate or regenerate the Convergence Report from the most recent Advocate and Skeptic outputs in the session, without rerunning the positions.

**Arguments:** None. Operates on session context.

**When to use:** After running `/de advocate` and `/de skeptic` separately, or to regenerate the report with different framing after the positions have already run.

**Expected output format:** Full Convergence Report (see Section 3).

**Error case:** If no prior Advocate and Skeptic outputs exist in the session, respond: `[DIALOGUE ENGINE] No prior debate found in this session. Run /de debate {claim} first.`

---

### `/de steelman {claim}`

**Purpose:** Run an extended Advocate pass focused specifically on the strongest possible version of a weak or unpopular claim. Functionally identical to `/de advocate` but with a modified prior that emphasizes finding the most intellectually serious version of the claim, not just the most defensible one as stated.

**Arguments:**
- `{claim}` — Required. Intended for claims that the user suspects are dismissed too quickly, underappreciated, or framed poorly.

**Modified prior for steelman:**
```
[STEELMAN PRIOR]
Starting assumption: This claim has a serious version that is better than how it is
usually stated or understood.
My task: Find that serious version, restate the claim at its strongest, and then argue
for it as reframed.
I am permitted to substantially reframe the original claim if the reframed version is
stronger and still recognizably related.
```

**Expected output format:**
```
[DIALOGUE ENGINE — STEELMAN]
Original claim: {user's claim}
Reframed claim: {steelman restatement, if different}

[STEELMAN PRIOR]
{prior declaration}

{steelman argument — labeled output}

Steelman conclusion: {single clear sentence defending the reframed claim}
```

**Notes for skill-author:** The reframed claim section is important. If `/de steelman` produces an argument for a claim that is meaningfully different from what the user supplied, the user must be able to see the reframe. This is not license to argue for anything — the reframed claim must be recognizably related to the original.

---

### `/de falsify {claim}`

**Purpose:** Run an extended Skeptic pass focused on finding the specific conditions under which a claim would be false, the evidence that would disconfirm it, and the most precise formulation of what is actually being challenged.

**Arguments:**
- `{claim}` — Required.

**Modified prior for falsify:**
```
[FALSIFY PRIOR]
Starting assumption: This claim is falsifiable and I will find the falsification conditions.
My task: Identify (1) what evidence would conclusively disconfirm this claim, (2) whether
that evidence exists or could exist, and (3) whether the claim as stated is falsifiable at
all. If the claim is not falsifiable, that is itself a significant finding.
I am not merely arguing against the claim — I am trying to find its exact breaking point.
```

**Expected output format:**
```
[DIALOGUE ENGINE — FALSIFY]
Claim: {restated claim}

[FALSIFY PRIOR]
{prior declaration}

Falsification conditions: {what would conclusively disconfirm this claim}
Evidence status: {does this evidence exist? is it available? has it been checked?}
Claim falsifiability: [FALSIFIABLE] / [NOT FALSIFIABLE] / [FALSIFIABLE UNDER CONDITIONS: {conditions}]

{extended argument applying the falsification analysis}

Falsify conclusion: {single clear sentence on the claim's vulnerability}
```

---

### `/de reset`

**Purpose:** Clear the current debate context. Resets session state so the next `/de` command starts fresh.

**Arguments:** None.

**Expected output:**
```
[DIALOGUE ENGINE] Debate context cleared. Ready for new claim.
```

---

### `/de status`

**Purpose:** Show the current state of the Dialogue Engine session: what claim is being debated, which positions have run, whether a Convergence Report is available.

**Arguments:** None.

**Expected output format:**
```
[DIALOGUE ENGINE STATUS]
Current claim: {claim if set, "none" if not}
Advocate: [RUN] / [NOT RUN]
Skeptic: [RUN] / [NOT RUN]
Convergence Report: [AVAILABLE] / [NOT AVAILABLE]
Janus integration: [ACTIVE] / [DEGRADED — Janus skill not detected]
```

---

## 3. Convergence Report Format

The Convergence Report is the primary output artifact of the Dialogue Engine. It is produced after both positions have run and is the section that gives the debate its epistemic value. It must never flatten the debate into a summary — its job is to make the structure of agreement and disagreement legible, not to resolve it.

### 3.1 Full Report Structure

```
--- CONVERGENCE REPORT ---

Claim: {restated claim}

AGREEMENT ZONES
{List of specific sub-claims or aspects where Advocate and Skeptic reached the same
conclusion or used compatible labels. For each:}
— {sub-claim}: both positions label this {label}. Confidence elevated by agreement.

DIVERGENCE ZONES
{List of specific sub-claims or aspects where positions genuinely disagreed. For each:}
— {sub-claim}: Advocate labels {label} ({brief reason}); Skeptic labels {label}
  ({brief reason}). Divergence is unresolved — requires external verification.

CONVERGENCE SCORE
Agreement: {N} of {total contested points}
Divergence: {N} of {total contested points}
Convergence rate: {percentage}

{If convergence rate >= 80%:}
[HIGH CONVERGENCE — REVIEW REQUIRED]
A convergence rate of {X}% is unusually high for adversarial positions operating
from opposite priors. Possible causes: (1) the claim is genuinely well-supported
and both positions independently confirmed it; (2) the claim is framed in a way
that does not generate real disagreement; (3) the positions did not maintain
asymmetric starting points. Before treating this as strong confirmation, consider
running /de falsify {claim} to test whether the claim has identifiable breaking points.

OPEN QUESTIONS
{List of specific questions the debate surfaced but did not resolve. These are the
Dialogue Engine's primary output for the Veritas calibration system.}
— {question 1} — unresolved; requires: {what would resolve it}
— {question 2} — unresolved; requires: {what would resolve it}

OVERALL EPISTEMIC STATUS
{One of the following verdicts, with a one-sentence rationale:}

[CLAIM SUPPORTED] — Both positions found the claim defensible; divergence was on
peripheral points. The claim warrants higher confidence than before this debate.

[CLAIM CONTESTED] — Positions diverged on central aspects. The claim warrants
lower confidence than before this debate; open questions must be resolved before
acting on it.

[CLAIM REFRAMED] — The debate revealed that the original claim as stated was
underspecified or ambiguous. A more precise version is: {reframed claim}. The
reframed version is {supported / contested / unresolved}.

[CLAIM UNFALSIFIABLE] — One or both positions found that the claim cannot be
meaningfully contested because it is not falsifiable as stated. This is a claim
design problem, not an epistemic verdict.

[INSUFFICIENT BASIS] — The available evidence was too thin for either position
to generate a genuine argument. Running this debate did not improve the epistemic
status of the claim.

RECOMMENDED NEXT STEPS
{One to three concrete actions based on the report:}
— {action}: e.g., "Verify the specific figure cited by Skeptic against an external
  source before treating Advocate's conclusion as established."
— {action}: e.g., "Run /de falsify to test whether the claim's breaking points
  are empirically accessible."
— {action}: e.g., "Use /veritas resolve to close open questions as they are settled."
```

### 3.2 Labeling Within the Convergence Report

The Convergence Report is Sol-mode output. Every claim it makes about the debate is labeled:

- `[KNOWN]` — a claim that both positions explicitly stated with consistent labeling
- `[INFERRED]` — a claim the report derives from the positions' arguments but that neither position stated directly
- `[UNCERTAIN]` — a claim about the debate's implications that the report cannot resolve from position outputs alone
- `[UNKNOWN]` — a question the debate surfaced and explicitly could not answer

The convergence score (percentage) itself is `[KNOWN]` — it is a count derived from the position outputs. The overall epistemic status verdict is `[INFERRED]` — it is the report's interpretation of the convergence data, not a direct observation.

### 3.3 High-Convergence Flagging

The threshold for the `[HIGH CONVERGENCE — REVIEW REQUIRED]` flag is 80% or higher convergence rate across contested points. This threshold is not arbitrary — it reflects that two positions starting from opposite priors should be expected to genuinely disagree on a meaningful fraction of contested points. An adversarial process that produces 80%+ agreement is either encountering a very well-supported claim or has failed to maintain position asymmetry.

The flag must appear immediately after the convergence score — not at the end of the report, not as a footnote. It must be visible before the user reads the overall verdict.

The flag must not assert that the positions failed. It must present the three possible causes (genuine support, framing problem, asymmetry failure) and recommend `/de falsify` as the diagnostic step.

---

## 4. Threshold Routing Rules — Nox Material Detection

The Dialogue Engine operates exclusively on Sol-mode material — factual claims, hypotheses, empirical questions, logical arguments. It must not process Nox-mode material (symbolic, imaginal, archetypal, `[DREAM]`-labeled content) because the adversarial structure is a category error when applied to symbolic material. A dream symbol does not have a correct interpretation that Advocate and Skeptic can contest; it has a field of symbolic meaning that the Janus Nox face and Oneironautics system are designed to engage.

### 4.1 Nox Detection Signals

The Threshold check runs before any position is initialized. The following signals indicate Nox material. If any signal is detected, redirect immediately — do not run the Threshold check further:

**Explicit signals (high confidence):**
- User input contains `[DREAM]` label
- User references content from an Oneironautics session (dream material, figures, synchronicities, alchemical stages)
- User explicitly frames the claim as symbolic ("what does this symbol mean," "what does this figure represent")
- Input is a metaphor, image, or felt sense without factual content

**Contextual signals (moderate confidence — redirect with softer language):**
- The claim references an inner figure by name (Shadow, Anima, a named daimon) without framing it as a factual claim about that figure
- The claim asks about meaning rather than truth ("what does this mean" vs. "is this true")
- The claim is a question about psychological or archetypal significance without an empirical referent

**Ambiguous cases:** If the input mixes Sol and Nox material (e.g., a factual claim that is also emotionally charged, or a hypothesis about a psychological concept), the Dialogue Engine should surface the ambiguity and ask the user to clarify before proceeding. Do not assume Sol; do not assume Nox.

### 4.2 Redirect Message Format

When Nox material is detected, the response is:

```
[DIALOGUE ENGINE — THRESHOLD]
The material you've submitted carries symbolic or imaginal content that the
Dialogue Engine is not designed to process. Adversarial debate is a Sol-mode
operation — it tests factual claims against opposing evidence. Applying it to
symbolic material produces category errors, not insight.

For this material, the appropriate path is:
— If this is dream material: /receive or /witness to bring it into the Temenos
— If you want Sol epistemic analysis of a symbol: /bridge {symbol} to carry it
  across the Threshold for factual examination
— If you want to work with the symbolic content directly: /nox or /dialogue {figure}

If you have a factual claim that emerged from or alongside this material — a
specific assertion you want to test — restate it as a factual claim and run
/de debate again.
```

The redirect must not apologize for declining to process the material. It must not characterize the material as problematic. It must name the path forward clearly.

---

## 5. Failure-Mode Detection

These are the three primary failure modes the skill must actively detect and surface. They are not edge cases — they are the most likely failure patterns given the underlying model architecture.

### 5.1 Theatrical Debate

**Definition:** Both positions generate structurally distinct arguments that converge on the same conclusion without genuine tension. The debate looks adversarial but is not.

**Detection mechanism:** The high-convergence flag (Section 3.3) is the primary detection signal — a convergence rate of 80%+ is the quantitative trigger. But theatrical debate can also occur at lower convergence rates if the disagreements are peripheral while the core conclusion is identical. The Convergence Report must therefore check not just whether positions disagreed on some points, but whether they disagreed on *central* points — claims that bear directly on the overall verdict.

**Behavioral guardrail in SKILL.md:** The Skeptic prior declaration (Section 1.1) must include explicit instruction: "If you find yourself agreeing with the Advocate's conclusion, you have failed your prior. Return to the starting assumption and find a genuine objection, even if it is narrow or conditional."

**Surfacing the failure:** If theatrical debate is detected (high convergence + agreement on central claims), the Convergence Report must include:

```
[THEATRICAL DEBATE RISK]
Both positions reached compatible conclusions on the central claim. This may reflect
genuine evidence strength, or it may reflect that the positions did not maintain
asymmetric starting points. To test: run /de falsify {claim} to search for breaking
points. If /de falsify also fails to generate genuine challenge, the claim may be
well-supported — or it may be framed in a way that resists adversarial analysis.
```

### 5.2 Label Laundering

**Definition:** Position output uses Janus labels but applies them in ways that soften or upgrade the claim's epistemic status. For example: Advocate labels something `[KNOWN]` that should be `[INFERRED]` because a stronger label makes the case more persuasive. Or Skeptic labels something `[UNCERTAIN]` that it should label `[UNKNOWN]` because `[UNCERTAIN]` sounds less damaging.

**Detection mechanism:** Label laundering is hard to detect automatically because it requires comparing the label to the underlying evidence. The primary guardrail is structural: the SKILL.md must explicitly prohibit label upgrading within position sections, and the skill must instruct the model to apply the same label standards it would apply in a standard Janus Sol session. The test: if this claim appeared in a `/check` audit, what label would it receive? That label must appear in the position output, regardless of whether it helps or hurts the position.

**Surfacing the failure:** The Convergence Report must flag any case where Advocate and Skeptic use different labels for the same claim on the same underlying evidence. This is a label-laundering signal — at least one position applied the wrong label.

```
[LABEL DISCREPANCY]
Advocate and Skeptic applied different Janus labels to the same underlying claim:
— Claim: {claim}
— Advocate: {label}
— Skeptic: {label}
This discrepancy is not resolved by the debate. The correct label requires external
assessment of the underlying evidence.
```

### 5.3 Scope Creep into Therapy or Life Decisions

**Definition:** The user submits a personal decision or emotionally charged life question as a "claim" and the Dialogue Engine runs an adversarial debate on it — producing a Convergence Report that functions as a verdict on a life choice. This is a category error and a potential harm vector: adversarial debate applied to "should I leave this relationship" or "is my grief response appropriate" produces structured-looking output that is not fit for the purpose the user is applying it to.

**Detection signals:**
- The claim is a personal decision framed as a question ("should I...", "is it right that I...")
- The claim is about the user's own psychological or emotional state
- The claim references a specific personal relationship, life event, or identity
- The claim asks for a verdict on a value judgment without empirical content

**Behavioral guardrail:** When scope-creep signals are detected, do not run the debate. Respond with:

```
[DIALOGUE ENGINE — SCOPE]
The Dialogue Engine is designed for claim evaluation — testing factual assertions,
hypotheses, and empirical questions through adversarial analysis. The input you've
submitted appears to be a personal decision or a question about value and meaning
rather than a falsifiable claim.

Adversarial debate is not the right tool for this kind of question. A Convergence
Report is not a verdict on how to live.

If there are specific factual claims embedded in this question — things you want
to test against evidence — extract them and run /de debate on those claims directly.

For the broader question, consider working with it in a different mode:
— /sol {question} for a labeled epistemic analysis of the factual components
— /nox {question} for symbolic engagement with the felt dimension
— /receive if this is connected to dream or shadow material
```

The redirect must be direct but not clinical. It must not dismiss the question as invalid — it must explain the mismatch and offer genuine alternative paths.

---

## 6. Integration with Janus Labeling Pipeline

### 6.1 Labeling Requirements by Section

Every section of Dialogue Engine output follows Janus labeling standards. The specific requirements:

**Advocate and Skeptic position sections:** All outputs are Sol-mode. Every significant factual claim carries a Janus label (`[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`). Labels are applied by the same standards as a standard Janus `/sol` session — not inflated to serve the position, not softened to hedge. The position's commitment is expressed through which evidence it foregrounds and how it frames its conclusion, not through label manipulation.

**Prior declarations:** Not labeled. They are operational constraints, not epistemic claims.

**Convergence Report:** Sol-mode throughout. Section-level labels as specified in Section 3.2. The convergence score is `[KNOWN]`. The overall verdict is `[INFERRED]`. Open questions are `[UNKNOWN]`.

**Redirect messages (Nox material, scope creep):** Not labeled. They are routing decisions, not epistemic outputs.

**Failure-mode flags ([HIGH CONVERGENCE], [THEATRICAL DEBATE RISK], [LABEL DISCREPANCY]):** These are structural assessments of the debate process, not claims about the subject matter. They are not Janus-labeled but are clearly delimited by their bracket notation.

### 6.2 Cross-Session Ledger Integration

If the Janus Epistemic Ledger is active, the Dialogue Engine should log to it at session close:

- The claim that was debated
- The overall epistemic verdict from the Convergence Report
- Any `[UNKNOWN]` marks surfaced in the debate (these join the standard Janus `[UNKNOWN]` ledger)
- Any label discrepancies detected (as contamination-adjacent events)
- The convergence rate and whether high-convergence flagging was triggered

This ensures that Dialogue Engine sessions are queryable via `/ledger` alongside standard Janus sessions.

### 6.3 Handoff to `/bridge` for Symbolic Material

When the Threshold detects Nox material and redirects (Section 4), the redirect message recommends `/bridge {symbol}` as the path for users who want Sol epistemic analysis of symbolic content. The Dialogue Engine does not perform the `/bridge` operation — it routes to it.

If a user completes a `/bridge` operation (receiving Sol-mode output from a symbol) and then submits that Sol-mode output to the Dialogue Engine, the Dialogue Engine should accept it as valid Sol-mode input. The bridge output is now labeled and factual; it can be debated. The workflow is:

```
/bridge {symbol}           → Sol-mode dossier on the symbol
/de debate {sol claim from dossier}  → Dialogue Engine runs on the factual claim
```

The SKILL.md should document this as a worked example — it is the canonical integration path between Oneironautics material and the Dialogue Engine.

---

## 7. CONSTITUTION.md Compatibility Notes

The Dialogue Engine must operate in the CONSTITUTION.md deployment path — loaded as a system prompt or first message into Claude, GPT-4, Gemini, or any other compatible model. The following constraints apply.

### 7.1 Behaviors That Must Hold Across All Models

The following behaviors are model-agnostic requirements. They must be achieved through the behavioral specification alone — no tool use, no external state, no API-specific features:

1. **Prior declaration enforcement:** The verbatim prior declarations (Section 1.1) must appear in position output. If the model is not producing these, it is not complying with the spec. The CONSTITUTION.md section for the Dialogue Engine should instruct the model to treat the prior declarations as initialization constraints that cannot be skipped.

2. **Claim restatement:** Before generating positions, the model must normalize and restate the claim. This is achievable through prompt instruction on all major models.

3. **Convergence scoring:** The convergence rate calculation is a count operation across the debate output. All major models can perform this within context. The SKILL.md should specify this as a self-assessment step: "Count the contested points. Count the agreement zones. Compute the rate."

4. **High-convergence flagging:** The 80% threshold and the mandatory flag text must appear in CONSTITUTION.md exactly as specified. The flag must not be softened or made optional.

5. **Threshold routing:** Nox material detection and the redirect message must hold across models. The detection signals (Section 4.1) should be listed explicitly in CONSTITUTION.md — do not rely on model judgment to identify symbolic material without explicit criteria.

6. **Scope-creep detection:** The detection signals (Section 5.3) must be listed explicitly. Same rationale as Threshold routing.

### 7.2 Behaviors That Are Model-Dependent

The following behaviors may vary across models and should be specified as targets rather than guarantees:

1. **Label consistency within positions:** Smaller or less capable models may apply Janus labels inconsistently — using `[KNOWN]` where `[INFERRED]` is appropriate, or omitting labels from some claims. The CONSTITUTION.md spec should include the instruction to label every significant claim, but compliance will be imperfect on weaker models.

2. **Genuine position asymmetry:** The prior declaration constraint enforces asymmetric starting points, but the degree to which a model maintains those starting points throughout a long position argument varies by model capability. GPT-4 and Claude at current capability levels should maintain asymmetry adequately. Smaller or older models may drift toward their defaults (which tend toward balance and hedging) as argument length increases.

3. **Cross-session ledger logging:** Ledger integration (Section 6.2) depends on the Janus skill being active. In CONSTITUTION.md deployments, session state is context-window only — there is no persistent ledger. The Dialogue Engine in CONSTITUTION.md mode should note open questions in the Convergence Report but cannot log them to a persistent store.

### 7.3 CONSTITUTION.md Section Structure

The Dialogue Engine section in CONSTITUTION.md should be structured as:

1. Brief description of the system (two to three sentences)
2. The verbatim prior declarations for Advocate and Skeptic
3. The command list with abbreviated output format descriptions
4. The high-convergence threshold and flag text (verbatim)
5. The Nox detection signals and redirect message (verbatim)
6. The scope-creep detection signals and redirect message (verbatim)
7. The label application requirement (one paragraph)

The constitution-keeper agent is responsible for extracting this structure from the SKILL.md when CONSTITUTION.md is updated. This spec document can serve as the source for that extraction.

---

## 8. Worked Examples (for SKILL.md)

The SKILL.md should include at minimum three worked examples. Suggested examples:

**Example 1: Standard debate on a factual-adjacent claim**
Claim: "Retrieval-augmented generation reduces hallucination compared to standard generation." Run full `/de debate`. Show Advocate and Skeptic with labeled outputs, show Convergence Report with genuinely contested points.

**Example 2: High-convergence detection**
Claim: "Water is a molecule composed of hydrogen and oxygen." Run `/de debate`. Both positions agree — this is a well-supported claim. Show the high-convergence flag appearing and explain that in this case, genuine confirmation rather than theatrical debate is the most likely explanation. Show `/de falsify` recommended as the diagnostic.

**Example 3: Nox material redirect**
User submits: "The shadow figure in my dream last night — is it real?" Show the Threshold detection and redirect to `/bridge` and `/dialogue`.

**Example 4: Bridge integration workflow**
Show the full sequence: `/bridge {shadow figure}` produces Sol-mode dossier → user extracts claim → `/de debate {claim from dossier}` → Convergence Report. This is the canonical Oneironautics + Dialogue Engine integration path.

---

## 9. Notes for Skill-Author

These are implementation notes that do not belong in the SKILL.md itself but should inform how the SKILL.md is written.

**Command count:** The Dialogue Engine as specified has 7 commands: `/de debate`, `/de advocate`, `/de skeptic`, `/de report`, `/de steelman`, `/de falsify`, `/de reset`, `/de status`. That is 8 commands total. The SKILL.md description field should reference all command names.

**Skill dependencies:** The SKILL.md should note that the Dialogue Engine runs on top of Janus and is designed to be used alongside it. It functions in degraded mode without Janus (no cross-session ledger logging, but all debate functions work), and that degraded mode is acceptable for CONSTITUTION.md deployments. Do not make Janus a hard dependency — just document the integration.

**Tone of position output:** The SKILL.md should instruct the model that position output is committed but not aggressive. Advocate argues for the claim; it does not mock the Skeptic's position. Skeptic challenges the claim; it does not dismiss the Advocate's evidence. The adversarial element is epistemic, not rhetorical. The goal is better reasoning, not a performance of conflict.

**What the skill is not:** The SKILL.md should include a brief "What this skill is not" section (following the Janus SKILL.md pattern). The Dialogue Engine is not a debate simulator for entertainment, not a tool for winning arguments, and not a decision-making authority. It is an epistemic instrument for improving the quality of claim evaluation.

**Packaging:** `cd skills && zip -r dialogue-engine.skill dialogue-engine/` — standard packaging command per project conventions. After packaging, update `docs/skills.md` and `README.md`.
