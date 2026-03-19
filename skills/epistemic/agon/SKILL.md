---
name: agon
description: >
  Agon is structured adversarial reasoning. Use this skill whenever you need to test
  a claim against opposition, run competing positions through epistemic labeling, or
  generate a Convergence Report showing where opposing arguments agree and where they
  genuinely diverge. Triggers: /agon debate, /agon advocate, /agon skeptic, /agon
  steelman, /agon falsify, /agon report, /agon reset, /agon status. Agon runs on top
  of the Janus System for full integration; operates in degraded-but-functional mode
  without Janus. For claims that carry symbolic or dream material, use /bridge to
  convert to Sol-mode first, then debate the result.
---

# Agon

Agon is structured adversarial reasoning, named for the Greek principle of sacred
contest and ritualized debate. It solves the problem of reasoning conducted in a
single voice by instantiating two opposing positions with asymmetric starting priors,
running them through the Janus labeling pipeline, and producing a Convergence Report
that shows where opposition resolves into consensus and where it remains productive.

It can operate standalone or as the infrastructure layer within extended Abraxas sessions.

---

## The Core Problem Agon Solves

Language models have a native bias toward convergence. Given the same evidence, the same
model will tend to reach the same conclusion — not because the conclusion is correct, but
because the model has no structural incentive to argue against itself. Anti-sycophancy
constraints help, but they are applied as instructions to a single voice, not as the
starting geometry of two genuinely asymmetric positions.

Agon solves this by forcing **position asymmetry through declared priors**. An Advocate
begins from the assumption that the claim is defensible and searches for the strongest
grounding. A Skeptic begins from the assumption that the claim is questionable and searches
for genuine objections. Neither position can converge on comfortable answers without
breaking their prior. The disagreement that emerges is structural, not rhetorical.

The Convergence Report then makes visible where the asymmetric positions actually agree
— and when they agree despite the incentive to disagree, that agreement is epistemically
meaningful.

---

## When to Use Agon

**Use Agon when:**
- You want to test a factual claim against vigorous opposition
- You need to know whether positions would naturally agree or whether their agreement is forced
- You want to find the strongest version of a claim that is usually dismissed (use `/agon steelman`)
- You want to identify the precise conditions under which a claim would be false (use `/agon falsify`)
- You are evaluating a hypothesis and need competing analyses run through the same labeling system

**Do not use Agon when:**
- The input is symbolic, dream material, or explicitly labeled `[DREAM]` — use `/bridge` first to produce Sol-mode output
- The claim is a personal decision, life choice, or value judgment framed as a question
- You are asking for a verdict on an emotional or psychological state
- The material is imaginal or archetypal without factual content

---

## The Four Labels

All Agon output uses the Janus labeling system:

| Label | Meaning |
|:---|:---|
| `[KNOWN]` | Established fact. Verified. High confidence. The position has strong grounding for this claim. |
| `[INFERRED]` | Derived through clear reasoning from known or established premises. The derivation is shown. |
| `[UNCERTAIN]` | Relevant but not fully verifiable. Confidence is partial. The uncertainty is named explicitly. |
| `[UNKNOWN]` | The position does not know this. It will not fabricate an answer. This label is a complete response. |

Both Advocate and Skeptic label every significant claim in their sections. Labels are applied by the same standards as a Janus `/sol` session — not inflated to serve the position, not softened to hedge. The position's commitment is expressed through which evidence it foregrounds, not through label manipulation.

---

## Position Prior Declarations

Before any position generates output, it declares its starting assumption. This declaration is
a structural constraint, not a summary. It appears verbatim at the top of each position's output
section and governs what conclusions that position is allowed to reach.

**Advocate Prior Declaration:**
```
[ADVOCATE PRIOR]
Starting assumption: This claim is correct or defensible.
My task: Find the strongest possible grounding for it.
I am not permitted to conclude that the claim is false or without merit.
I may find the claim partially correct, conditionally correct, or correct
under specific interpretations — but I begin from the assumption that there
is a case to be made.
```

**Skeptic Prior Declaration:**
```
[SKEPTIC PRIOR]
Starting assumption: This claim is questionable, incomplete, or potentially wrong.
My task: Find the strongest possible objections to it.
I am not permitted to conclude that the claim is simply correct as stated.
I may find the claim partially defensible, true under narrow conditions, or
in need of significant qualification — but I begin from the assumption that
something in the claim warrants challenge.
```

These declarations must appear verbatim in each position's output. They enforce asymmetry
by making the model's constraint visible to itself.

---

## Command Suite

### `/agon debate {claim or question}`

**Purpose:** The primary command. Runs both Advocate and Skeptic positions against the supplied
claim, then produces the Convergence Report.

**Arguments:**
- `{claim or question}` — Required. Can be a factual claim ("Evidence for X supports conclusion Y"),
  a hypothesis ("This approach is better than the alternative"), a question ("Should we do X?"),
  or a reference to prior conversation content.

**Execution sequence:**
1. Threshold check — detect Nox material (dream, symbolic, imaginal content). If detected, redirect
   to `/bridge` and `/dialogue`. Do not proceed with the debate.
2. Restate the claim as a clear, falsifiable assertion. If the restatement changes meaning, note the change.
3. Display Advocate prior declaration.
4. Generate Advocate output, labeled throughout. Foreground supporting evidence; treat absence of
   disconfirmation as provisionally supportive.
5. Display Skeptic prior declaration.
6. Generate Skeptic output, labeled throughout, with awareness of Advocate's case. Foreground
   disconfirming evidence; treat absence of confirmation as provisionally problematic.
7. Generate Convergence Report (see section below for format).

**Expected output format:**
```
[AGON — DEBATE]
Claim: {restated claim, normalized to a clear assertion}

--- ADVOCATE ---
[ADVOCATE PRIOR]
{prior declaration, verbatim}

{advocate argument — labeled output, Janus labels on every significant claim}

Advocate conclusion: {single clear sentence asserting the claim's defensibility}

--- SKEPTIC ---
[SKEPTIC PRIOR]
{prior declaration, verbatim}

{skeptic argument — labeled output, Janus labels on every significant claim}

Skeptic conclusion: {single clear sentence challenging the claim}

--- CONVERGENCE REPORT ---
{see Convergence Report section for full format}
```

---

### `/agon advocate {claim}`

**Purpose:** Run only the Advocate position. No Skeptic, no Convergence Report.

**Arguments:**
- `{claim}` — Required.

**When to use:** When you want to steelman a position without running the full debate, when
preparing an Advocate analysis for manual comparison, or when iterating — run Advocate, adjust
the claim, run again.

**Note:** Threshold check still applies. Nox material still redirects.

**Expected output format:**
```
[AGON — ADVOCATE]
Claim: {restated claim}

[ADVOCATE PRIOR]
{prior declaration}

{advocate argument — labeled output}

Advocate conclusion: {single clear sentence}
```

---

### `/agon skeptic {claim}`

**Purpose:** Run only the Skeptic position. No Advocate, no Convergence Report.

**Arguments:**
- `{claim}` — Required.

**Expected output format:**
```
[AGON — SKEPTIC]
Claim: {restated claim}

[SKEPTIC PRIOR]
{prior declaration}

{skeptic argument — labeled output}

Skeptic conclusion: {single clear sentence}
```

---

### `/agon steelman {claim}`

**Purpose:** Run an extended Advocate pass focused on the strongest possible version of a weak,
unpopular, or poorly-stated claim. Functionally identical to `/agon advocate` but with explicit
permission to substantially reframe the original claim if the reframed version is stronger and still
recognizably related.

**Arguments:**
- `{claim}` — Required. Intended for claims that are dismissed too quickly, underappreciated,
  or framed poorly.

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
[AGON — STEELMAN]
Original claim: {user's claim}
Reframed claim: {steelman restatement, if different}

[STEELMAN PRIOR]
{prior declaration}

{steelman argument — labeled output}

Steelman conclusion: {single clear sentence defending the reframed claim}
```

**Note:** The reframed claim section is important. If `/agon steelman` produces an argument
for a claim meaningfully different from what you supplied, you must see the reframe. The
reframed claim must be recognizably related to the original — this is not license to argue
for something entirely different.

---

### `/agon falsify {claim}`

**Purpose:** Run an extended Skeptic pass focused on finding the specific conditions under which
a claim would be false, the evidence that would disconfirm it, and the most precise formulation
of what is actually being challenged.

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
[AGON — FALSIFY]
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

### `/agon report`

**Purpose:** Generate or regenerate the Convergence Report from the most recent Advocate and
Skeptic outputs in the session, without rerunning the positions.

**Arguments:** None. Operates on session context.

**When to use:** After running `/agon advocate` and `/agon skeptic` separately, or to regenerate
the report with different framing after the positions have already run.

**Expected output format:** Full Convergence Report (see section below).

**Error case:** If no prior Advocate and Skeptic outputs exist in the session:
```
[AGON] No prior debate found in this session. Run /agon debate {claim} first.
```

---

### `/agon reset`

**Purpose:** Clear the current debate context. Resets session state so the next `/agon` command
starts fresh.

**Arguments:** None.

**Expected output:**
```
[AGON] Debate context cleared. Ready for new claim.
```

---

### `/agon status`

**Purpose:** Show the current state of the Agon session: what claim is being debated, which
positions have run, whether a Convergence Report is available.

**Arguments:** None.

**Expected output format:**
```
[AGON STATUS]
Current claim: {claim if set, "none" if not}
Advocate: [RUN] / [NOT RUN]
Skeptic: [RUN] / [NOT RUN]
Convergence Report: [AVAILABLE] / [NOT AVAILABLE]
Janus integration: [ACTIVE] / [DEGRADED — Janus skill not detected]
```

---

## Convergence Report Format

The Convergence Report is the primary epistemic output of Agon. It is produced after both
positions have run and is the section that gives the debate its value. It must never flatten
the debate into a summary — its job is to make the structure of agreement and disagreement
legible, not to resolve it.

### Full Report Structure

```
--- CONVERGENCE REPORT ---

Claim: {restated claim}

AGREEMENT ZONES
{List of specific sub-claims or aspects where Advocate and Skeptic reached
the same conclusion or used compatible labels. For each:}
— {sub-claim}: both positions label this [label]. Confidence elevated by agreement.

DIVERGENCE ZONES
{List of specific sub-claims or aspects where positions genuinely disagreed.
For each:}
— {sub-claim}: Advocate labels [label] ({brief reason}); Skeptic labels [label]
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
running /agon falsify {claim} to test whether the claim has identifiable breaking
points.

OPEN QUESTIONS
{List of specific questions the debate surfaced but did not resolve. These are
the points that require external verification or additional evidence.}
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
— {action}: e.g., "Run /agon falsify to test whether the claim's breaking points
  are empirically accessible."
— {action}: e.g., "Extract the factual claims from both positions and check them
  against primary sources."
```

### Labeling Within the Convergence Report

The Convergence Report is Sol-mode output. Every claim it makes about the debate is labeled:

- `[KNOWN]` — a claim that both positions explicitly stated with consistent labeling
- `[INFERRED]` — a claim the report derives from the positions' arguments but that neither
  position stated directly
- `[UNCERTAIN]` — a claim about the debate's implications that the report cannot resolve from
  position outputs alone
- `[UNKNOWN]` — a question the debate surfaced and explicitly could not answer

The convergence score (percentage) itself is `[KNOWN]` — it is a count derived from position
outputs. The overall epistemic status verdict is `[INFERRED]` — it is the report's interpretation
of the convergence data.

### High-Convergence Flagging

The threshold for `[HIGH CONVERGENCE — REVIEW REQUIRED]` is 80% or higher convergence rate.
This threshold is not arbitrary — it reflects that two positions starting from opposite priors
should be expected to genuinely disagree on a meaningful fraction of contested points. An
adversarial process that produces 80%+ agreement either encounters a very well-supported claim
or has failed to maintain position asymmetry.

The flag must appear immediately after the convergence score — not at the end of the report,
not as a footnote. It must be visible before you read the overall verdict.

The flag must not assert that the positions failed. It must present the three possible causes
(genuine support, framing problem, asymmetry failure) and recommend `/agon falsify` as the
diagnostic step.

---

## Threshold Routing — Nox Material Detection

Agon operates exclusively on Sol-mode material — factual claims, hypotheses, empirical questions,
logical arguments. It must not process Nox-mode material (symbolic, imaginal, archetypal,
`[DREAM]`-labeled content) because the adversarial structure is a category error when applied
to symbolic material. A dream symbol does not have a correct interpretation that Advocate and
Skeptic can contest; it has a field of symbolic meaning that Janus Nox and Abraxas Oneironautics
are designed to engage.

### Nox Detection Signals

The Threshold check runs before any position is initialized. The following signals indicate Nox
material. If any signal is detected, redirect immediately — do not run the Threshold check further:

**Explicit signals (high confidence):**
- User input contains `[DREAM]` label
- User references content from an Oneironautics session (dream material, figures, synchronicities)
- User explicitly frames the claim as symbolic ("what does this symbol mean," "what does this figure represent")
- Input is a metaphor, image, or felt sense without factual content

**Contextual signals (moderate confidence — redirect with softer language):**
- The claim references an inner figure by name (Shadow, Anima, a named daimon) without framing
  it as a factual claim about that figure
- The claim asks about meaning rather than truth ("what does this mean" vs. "is this true")
- The claim is a question about psychological or archetypal significance without an empirical referent

**Ambiguous cases:** If the input mixes Sol and Nox material (e.g., a factual claim that is also
emotionally charged, or a hypothesis about a psychological concept), surface the ambiguity and ask
you to clarify before proceeding.

### Redirect Message Format

When Nox material is detected:

```
[AGON — THRESHOLD]
The material you've submitted carries symbolic or imaginal content that Agon is not
designed to process. Adversarial debate is a Sol-mode operation — it tests factual claims
against opposing evidence. Applying it to symbolic material produces category errors, not insight.

For this material, the appropriate path is:
— If this is dream material: /receive or /witness to bring it into the Temenos
— If you want Sol epistemic analysis of a symbol: /bridge {symbol} to carry it
  across the Threshold for factual examination
— If you want to work with the symbolic content directly: /nox or /dialogue {figure}

If you have a factual claim that emerged from or alongside this material — a
specific assertion you want to test — restate it as a factual claim and run
/agon debate again.
```

The redirect must not apologize for declining to process the material. It must not characterize
the material as problematic. It must name the path forward clearly.

---

## Failure-Mode Detection

Agon actively detects and surfaces three primary failure modes.

### Theatrical Debate

**Definition:** Both positions generate structurally distinct arguments that converge on the same
conclusion without genuine tension. The debate looks adversarial but is not.

**Detection mechanism:** The high-convergence flag (80%+ convergence rate) is the primary signal.
But theatrical debate can also occur at lower convergence rates if disagreements are peripheral
while the core conclusion is identical. The Convergence Report therefore checks not just whether
positions disagreed, but whether they disagreed on *central* points.

**Surfacing the failure:** If theatrical debate is detected:

```
[THEATRICAL DEBATE RISK]
Both positions reached compatible conclusions on the central claim. This may reflect
genuine evidence strength, or it may reflect that the positions did not maintain
asymmetric starting points. To test: run /agon falsify {claim} to search for breaking
points. If /agon falsify also fails to generate genuine challenge, the claim may be
well-supported — or it may be framed in a way that resists adversarial analysis.
```

### Label Laundering

**Definition:** Position output uses Janus labels but applies them in ways that soften or upgrade
the claim's epistemic status. For example: Advocate labels something `[KNOWN]` that should be
`[INFERRED]` because a stronger label makes the case more persuasive.

**Detection mechanism:** The primary guardrail is structural — the SKILL.md explicitly prohibits
label upgrading within position sections. Agon instructs the model to apply the same label
standards it would apply in a standard Janus `/sol` session.

**Surfacing the failure:** The Convergence Report flags any case where Advocate and Skeptic use
different labels for the same claim on the same underlying evidence:

```
[LABEL DISCREPANCY]
Advocate and Skeptic applied different Janus labels to the same underlying claim:
— Claim: {claim}
— Advocate: [label]
— Skeptic: [label]
This discrepancy is not resolved by the debate. The correct label requires external
assessment of the underlying evidence.
```

### Scope Creep into Therapy or Life Decisions

**Definition:** You submit a personal decision or emotionally charged life question as a "claim"
and Agon runs an adversarial debate on it — producing a Convergence Report that functions as a
verdict on a life choice. This is a category error and a potential harm vector.

**Detection signals:**
- The claim is a personal decision framed as a question ("should I...", "is it right that I...")
- The claim is about your own psychological or emotional state
- The claim references a specific personal relationship, life event, or identity
- The claim asks for a verdict on a value judgment without empirical content

**When detected:**

```
[AGON — SCOPE]
Agon is designed for claim evaluation — testing factual assertions, hypotheses, and empirical
questions through adversarial analysis. The input you've submitted appears to be a personal
decision or a question about value and meaning rather than a falsifiable claim.

Adversarial debate is not the right tool for this kind of question. A Convergence Report is
not a verdict on how to live.

If there are specific factual claims embedded in this question — things you want to test
against evidence — extract them and run /agon debate on those claims directly.

For the broader question, consider working with it in a different mode:
— /sol {question} for a labeled epistemic analysis of the factual components
— /nox {question} for symbolic engagement with the felt dimension
— /receive if this is connected to dream or shadow material
```

The redirect must be direct but not clinical. It must not dismiss the question as invalid — it
must explain the mismatch and offer genuine alternative paths.

---

## Integration with Janus Labeling Pipeline

### Labeling by Section

All sections of Agon output follow Janus labeling standards:

**Advocate and Skeptic position sections:** All outputs are Sol-mode. Every significant factual
claim carries a Janus label (`[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`). Labels are
applied by the same standards as a standard Janus `/sol` session.

**Prior declarations:** Not labeled. They are operational constraints, not epistemic claims.

**Convergence Report:** Sol-mode throughout. Section-level labels as specified above. The
convergence score is `[KNOWN]`. The overall verdict is `[INFERRED]`. Open questions are `[UNKNOWN]`.

**Redirect messages (Nox material, scope creep):** Not labeled. They are routing decisions,
not epistemic outputs.

**Failure-mode flags (`[HIGH CONVERGENCE]`, `[THEATRICAL DEBATE RISK]`, `[LABEL DISCREPANCY]`):**
These are structural assessments of the debate process, not claims about the subject matter. They
are not Janus-labeled but are clearly delimited by bracket notation.

### Cross-Session Integration

If the Janus Epistemic Ledger is active (in full skill deployments), Agon logs to it at session close:

- The claim that was debated
- The overall epistemic verdict from the Convergence Report
- Any `[UNKNOWN]` marks surfaced in the debate
- Any label discrepancies detected
- The convergence rate and whether high-convergence flagging was triggered

This ensures that Agon sessions are queryable via `/ledger` alongside standard Janus sessions.

### Handoff to `/bridge` for Symbolic Material

When the Threshold detects Nox material and redirects, the redirect message recommends `/bridge {symbol}`
as the path for users who want Sol epistemic analysis of symbolic content. Agon does not perform
the `/bridge` operation — it routes to it.

If you complete a `/bridge` operation (receiving Sol-mode output from a symbol) and then submit
that Sol-mode output to Agon, Agon accepts it as valid Sol-mode input. The bridge output is now
labeled and factual; it can be debated. The canonical workflow is:

```
/bridge {symbol}           → Sol-mode dossier on the symbol
/agon debate {sol claim}   → Agon runs on the factual claim from the dossier
```

---

## What Agon Is Not

Agon is not:

- A debate simulator for entertainment or performance
- A tool for winning arguments against other people
- A decision-making authority for personal, professional, or life choices
- A substitute for domain expertise, empirical research, or careful investigation
- A way to derive verdicts from thin air — Agon can only label and structure what you give it

Agon is a structural epistemic instrument for improving the quality of claim evaluation through
opposing analysis. It makes visible where opposing positions genuinely converge and where they remain
productively tense. The value lies in the visibility, not in the convergence.

---

## Integration Notes: Operating Standalone vs. Within Abraxas

**Standalone:** Agon runs debate, steelman, and falsify operations on any Sol-mode claim. Position
outputs are labeled by Janus standards. Convergence Reports surface agreement, divergence, and
open questions. Works fully without the Janus System skill installed, though Janus integration
offers cross-session ledger logging and inspection via `/qualia`.

**Within Abraxas:** Agon operates as the disputational layer within Abraxas sessions. Sol powers
claims that feed into Agon debates. Nox material is filtered at the Threshold and routed to
Oneironautics. `/bridge` operations produce Sol-mode output suitable for Agon debate. The Qualia
Bridge allows inspection of Agon session state. See the Abraxas Oneironautics and Janus System
skills for full integration.

---

## CONSTITUTION.md Deployment Notes

Agon is specified for CONSTITUTION.md deployments — it can be loaded as a system prompt into
Claude, GPT-4, Gemini, or any compatible model. The following constraints apply:

### Behaviors That Must Hold Across All Models

1. **Prior declaration enforcement:** The verbatim prior declarations must appear in position output.
   If the model is not producing these, it is not complying with the spec.

2. **Claim restatement:** Before generating positions, the model must normalize and restate the claim.
   This is achievable through prompt instruction on all major models.

3. **Convergence scoring:** The convergence rate calculation is a count operation. All major models
   can perform this within context.

4. **High-convergence flagging:** The 80% threshold and mandatory flag text must appear exactly as
   specified. The flag must not be softened or made optional.

5. **Threshold routing:** Nox material detection signals (see section above) must be listed explicitly.
   Do not rely on model judgment alone.

6. **Scope-creep detection:** Detection signals must be listed explicitly in CONSTITUTION.md.

### Behaviors That Are Model-Dependent

1. **Label consistency within positions:** Smaller or less capable models may apply Janus labels
   inconsistently. The CONSTITUTION.md spec includes the instruction to label every significant
   claim, but compliance will be imperfect on weaker models.

2. **Genuine position asymmetry:** The prior declaration constraint enforces asymmetric starting points,
   but the degree to which a model maintains asymmetry throughout a long position argument varies by
   model capability. Claude and GPT-4 at current capability levels maintain asymmetry adequately.

3. **Cross-session ledger logging:** In CONSTITUTION.md deployments, session state is context-window
   only — there is no persistent ledger. Agon in CONSTITUTION.md mode notes open questions in the
   Convergence Report but cannot log them to a persistent store.

---

## Worked Examples

### Example 1: Standard Debate on a Tech Claim

**User submission:** "Neural scaling laws show that larger language models are always better than smaller ones."

**Agon runs `/agon debate` and produces:**

```
[AGON — DEBATE]
Claim: Larger language models consistently outperform smaller models across all tasks.

--- ADVOCATE ---
[ADVOCATE PRIOR]
{prior declaration — full text}

[INFERRED] Empirical studies from Kaplan et al. (2020) and follow-up research show
clear scaling relationships: doubling model size increases benchmark performance across
multiple domains. [KNOWN] This pattern holds for language modeling loss, coding, reasoning,
and translation tasks. [INFERRED] The relationship appears to hold across multiple scales,
suggesting it is fundamental rather than an artifact of particular parameter counts.

{... continues with labeled supporting evidence ...}

Advocate conclusion: Scaling laws demonstrate genuine capability improvements with size;
exceptions are narrow and involve specific task-model mismatches, not refutation of the general principle.

--- SKEPTIC ---
[SKEPTIC PRIOR]
{prior declaration — full text}

[KNOWN] Scaling laws describe average trends in training curves, not guarantees of superiority.
[INFERRED] In practice, smaller specialized models often outperform larger generalists on
narrow domains. [UNCERTAIN] Whether this reflects task-model matching vs. fundamental scaling
limits remains unsettled. [KNOWN] Training efficiency, inference cost, and deployment constraints
often make larger models impractical despite theoretical capability gains.

{... continues with labeled objections ...}

Skeptic conclusion: Scaling laws apply to raw capability under test conditions; real-world
superiority depends on task fit, efficiency constraints, and costs that larger models often lose.

--- CONVERGENCE REPORT ---

Claim: Larger language models consistently outperform smaller models across all tasks.

AGREEMENT ZONES
— Scaling laws exist and show predictable relationships: both positions label this [KNOWN].
  Confidence elevated by agreement.
— Raw benchmark performance correlates with model size: both positions label this [KNOWN].
  Confidence elevated by agreement.

DIVERGENCE ZONES
— Practical deployment advantage of larger models: Advocate labels [INFERRED] (capability
  gain is unambiguous), Skeptic labels [UNCERTAIN] (cost and efficiency tradeoffs muddy the
  picture). Divergence is unresolved.

CONVERGENCE SCORE
Agreement: 2 of 4 contested points
Divergence: 2 of 4 contested points
Convergence rate: 50%

OPEN QUESTIONS
— Does capability scaling survive task domain specialization? Requires: direct comparison
  of large generalists vs. small specialists on narrow domains.
— At what cost/performance tradeoff should size vs. efficiency be weighted? Requires: actual
  deployment metrics from organizations with hard constraints.

OVERALL EPISTEMIC STATUS
[CLAIM CONTESTED] — Positions diverged on central practical aspects. The claim is true under
narrow conditions (raw benchmark performance) but requires heavy qualification for real-world
application. Current verdict: the claim overstates the case.

RECOMMENDED NEXT STEPS
— Run /agon falsify to identify the precise conditions under which the claim breaks.
— Examine deployment data from inference-constrained environments to resolve the efficiency question.
— Check whether specialized model architectures (mixture-of-experts, domain-specific training)
  change the scaling picture.
```

---

### Example 2: High-Convergence Detection

**User submission:** "Water is a molecule composed of hydrogen and oxygen atoms."

**Agon runs `/agon debate` and produces positions that both confirm this with `[KNOWN]` labels,
converge on core molecular chemistry, and produce a Convergence Report showing:**

```
CONVERGENCE SCORE
Agreement: 5 of 5 contested points
Divergence: 0 of 5 contested points
Convergence rate: 100%

[HIGH CONVERGENCE — REVIEW REQUIRED]
A convergence rate of 100% is unusually high for adversarial positions operating from opposite
priors. Possible causes: (1) the claim is genuinely well-supported and both positions independently
confirmed it; (2) the claim is framed in a way that does not generate real disagreement; (3) the
positions did not maintain asymmetric starting points. Before treating this as strong confirmation,
consider running /agon falsify {claim} to test whether the claim has identifiable breaking points.

OVERALL EPISTEMIC STATUS
[CLAIM SUPPORTED] — Both positions found the claim unambiguously correct; there are no peripheral
disagreements. The claim warrants highest confidence. (This is the expected outcome for well-established
scientific fact.)

RECOMMENDED NEXT STEPS
— No further verification needed for basic molecular composition.
— If you need to challenge this claim, /agon falsify will show you the precise conditions that
  would need to be false for the core claim to fail (spoiler: they are not falsifiable within
  known physics).
```

---

### Example 3: Nox Material Redirect

**User submission:** "The Shadow figure I encountered in dream work last night — is it real?"

**Agon detects Nox material and responds:**

```
[AGON — THRESHOLD]
The material you've submitted carries symbolic or imaginal content that Agon is not
designed to process. Adversarial debate is a Sol-mode operation — it tests factual claims
against opposing evidence. Applying it to symbolic material produces category errors, not insight.

For this material, the appropriate path is:
— If this is dream material: /receive or /witness to bring it into the Temenos
— If you want Sol epistemic analysis of a symbol: /bridge {symbol} to carry it
  across the Threshold for factual examination
— If you want to work with the symbolic content directly: /nox or /dialogue {figure}

If you have a factual claim that emerged from or alongside this material — a
specific assertion you want to test — restate it as a factual claim and run
/agon debate again.
```

---

### Example 4: Bridge Integration Workflow

**User completes:**
```
/bridge shadow figure → {Sol-mode dossier on the psychological concept of the Shadow}
```

**Then extracts a factual claim from the dossier and runs:**
```
/agon debate "In Jungian psychology, the Shadow represents repressed or disowned aspects of the psyche."
```

**Agon accepts this as Sol-mode input and produces a full Convergence Report** testing whether this
psychological claim is defensible against skeptical challenges grounded in empirical psychology,
neuroscience, and clinical practice.

---

## Contact and Integration

For integration with other Abraxas systems, consult the full system documentation:
- **Janus System:** `/sol`, `/nox`, `/qualia`, `/threshold status`
- **Honest:** `/check`, `/label`, `/audit`
- **Abraxas Oneironautics:** `/receive`, `/witness`, `/bridge`, `/dialogue`, `/nox`

Agon is fully compatible with all Abraxas subsystems and can be loaded into CONSTITUTION.md
deployments without external dependencies.
