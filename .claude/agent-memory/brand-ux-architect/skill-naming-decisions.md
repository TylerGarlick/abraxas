# Skill Naming Decisions — Abraxas Family Expansion

**Date:** 2026-03-05
**Decision Scope:** Two new skills to extend the Abraxas epistemic and practice systems
**Author:** brand-ux-architect agent

---

## Naming Context & Constraints

The Abraxas family currently contains three skills:

| Skill | Name | Archetype | Epistemic Register |
|---|---|---|---|
| `janus-system` | Janus | Threshold guardian; two-faced Roman god | Infrastructure layer; epistemic dual-face |
| `honest` | Honest | Direct virtue embodied | Everyday plain-language interface |
| `abraxas-oneironautics` | Abraxas Oneironautics | Gnostic cosmological unity + dream navigation | Alchemical practice (35 commands) |

**Naming register established:**
- Conceptually evocative (archetypal, etymological)
- Lowercase-hyphenated filenames
- Skill names carry weight — they signal epistemic role and aesthetic identity
- No marketing language, no generic product names

---

## Skill 1: The Dialogue Engine

### Current Working Name Assessment

**"Dialogue Engine"** — functional description, not final name

**Strengths:**
- Immediately clarifies the skill's mechanism: structured conversation between two voices
- Precise and honest about what the skill does

**Weaknesses:**
- Too generic; could describe any conversational system
- No conceptual depth; sounds like a software utility
- Does not align with the Abraxas naming register (no archetype, no earned metaphor)
- Lacks the weight that carries across the family

### Skill Character Synthesis

**Purpose:** Structured adversarial reasoning. Advocate and Skeptic positions, asymmetric starting priors, Janus labeling pipeline integration, Convergence Report output.

**Epistemic role:** Makes agonistic reasoning structural, not behavioral. Sol argues against itself productively. Truth-seeking through opposition.

**Classical lineage:** Socratic dialogue, Hegelian dialectic, academic debate.

**Key quality:** Productive tension in service of clarity.

---

### Naming Candidates

#### Candidate 1: **`eristicus`**
- **Etymology:** Greek *eristikos* (from *eris* = strife, dispute). "Of or pertaining to controversy/debate."
- **Archetype:** The figure who engages in dialectical strife — not combat, but rigorous disputation.
- **Character:** Rigorous, classical, slightly austere. Carries the lineage of Socratic agon.
- **Fit with family:** Adjacent to Janus (threshold between viewpoints) and Honest (structured truth-seeking). Different register — symbolic rather than mythological, but from the same epistemic tradition.
- **Risk:** Obscure to users unfamiliar with classical rhetoric. Requires documentation.
- **Confidence:** High — the name earns its weight.

#### Candidate 2: **`antilogos`**
- **Etymology:** Greek *anti* (against) + *logos* (word/reason). Literally "counter-reasoning" — used by pre-Socratic sophists to mean "opposing argument" or "contradiction."
- **Archetype:** The principle of dialectical opposition itself; the force that generates contradictory positions.
- **Character:** Abstract, philosophical, deeply grounded in Western thought. Evokes paradox and productive contradiction.
- **Fit with family:** Strong conceptual depth. Feels like it belongs to the same epistemic lineage as Janus.
- **Risk:** Even more obscure than eristicus. Requires strong documentation and user education.
- **Confidence:** Medium-high — conceptually precise but may alienate users unfamiliar with philosophy.

#### Candidate 3: **`agon`**
- **Etymology:** Greek *agon* (contest, struggle, assembly). Primary meaning: ritualized contest or debate; secondary: the struggle/tension that produces meaning.
- **Archetype:** The sacred contest. The Agora where opposing voices meet. Agonistic rhetoric as truth-seeking method.
- **Character:** Clean, single word, classical depth. Carries both the idea of structured opposition and the idea of gathering/assembly.
- **Fit with family:** Strong. Shorter and more direct than the alternatives while maintaining conceptual weight.
- **Risk:** Could be confused with "agonize" (suffering) rather than "agon" (contest). Requires clear documentation.
- **Confidence:** High — balanced obscurity and directness. Best fit.

---

### Final Recommendation: **`agon`**

**Filename:** `agon.skill` (source directory: `skills/agon/`)

**Rationale:**

1. **Archetype clarity:** Agon is the Greek concept of sacred/ritualized contest. This skill instantiates that concept — two positions meet in structured opposition, with the goal of producing truth through tension.

2. **Conceptual family fit:** Agon fits naturally alongside Janus (the threshold where opposites meet), Honest (the plain-language commitment to truth), and Abraxas Oneironautics (which integrates all symbolic oppositions). These four skills form a coherent epistemic and practice system.

3. **Name weight:** "Agon" carries the intellectual tradition it references. A user who installs this skill will know, from the name alone, that this is not a generic dialogue engine but a specifically *adversarial* reasoning tool grounded in classical philosophy.

4. **Obscurity calibrated correctly:** The name is not immediately self-evident, but it is discoverable through documentation. This fits the Abraxas principle: precision over accessibility; users who need this tool will learn its name.

5. **Metaphorical embodiment:** Agon embodies the principle of productive opposition — the figure of the Challenger, the Interlocutor, the Sacred Opponent. Not a character but a *principle* made structural.

**Integration note:** In documentation, describe agon as "the classical Greek principle of ritualized contest made structural" — emphasize that this is truth-seeking through opposition, not debate for its own sake.

---

## Skill 2: Veritas

### Current Working Name Assessment

**"Veritas"** — strong candidate, evaluate fit

**Strengths:**
- Latin root; carries philosophical weight
- Single word; clean and memorable
- Conceptually precise: *veritas* = truth as absolute principle, not contingent claim
- Aligns with the Abraxas philosophical register

**Weaknesses:**
- Risk of being too close to standard English usage (people might expect generic "truth verification" rather than the specific epistemic ledger practice)
- No archetype or symbol — *veritas* is an abstract principle, not a figure or force
- Could be confused with "verify" (reactive) vs. the skill's actual purpose (retrospective calibration and long-term practice)

### Skill Character Synthesis

**Purpose:** Epistemic calibration and ground-truth tracking through resolved claims, calibration ledger, and accuracy tracking over time.

**Epistemic role:** Transforms the stack from output system to practice system. Users resolve labeled Janus claims after the fact (confirmed, disconfirmed, superseded). Maintains a ledger tracking label accuracy.

**Key quality:** Patient, retrospective, cumulative. Truth as accumulated record and practice, not single assertion.

**Temporal dimension:** Works *backward* through time — retrospective validation. Not real-time checking but long-memory audit.

---

### Naming Candidates

#### Candidate 1: **`veritas`** (status quo evaluation)
- **Etymology:** Latin *veritas* = truth as absolute/universal principle
- **Archetype:** The Roman goddess Veritas — the personification of truth; often depicted unveiling herself
- **Character:** Philosophical, classical, direct
- **Fit with family:** Sits comfortably alongside Janus (threshold) and Honest (virtue embodied). Less mythological than Abraxas Oneironautics, more abstract.
- **Risk:** Generic-sounding; user might not understand that this is specifically about *retrospective validation and ledger maintenance*, not generic fact-checking.
- **Confidence:** Medium — solid but not maximally distinctive

#### Candidate 2: **`mnemosyne`**
- **Etymology:** Greek *Mnemosyne* (goddess of memory), root *mneme* (memory)
- **Archetype:** The mother of the Muses; memory itself as creative and cumulative force
- **Character:** Jungian depth. Memory not as storage but as the principle that makes learning and integration possible.
- **Fit with family:** Excellent conceptual fit. Emphasizes the skill's retrospective nature: memory as the ground of all truth-verification. Aligns with Abraxas Oneironautics (integration, accumulation).
- **Risk:** Obscure; requires explanation. Might not immediately signal "epistemic calibration" to users unfamiliar with classical reference.
- **Confidence:** High — conceptually rich, but demands strong documentation

#### Candidate 3: **`aletheia`**
- **Etymology:** Greek *aletheia* (often translated as "truth" but literally "un-hiddenness" or "disclosure"). Heidegger's preferred concept: truth as the process of revealing what was concealed.
- **Archetype:** Not a figure but a *process* — the act of truth revealing itself through sustained inquiry.
- **Character:** Philosophical, phenomenological, rigorous. Emphasizes that truth is not a static claim but an ongoing disclosure.
- **Fit with family:** Strong philosophical alignment with Janus (epistemic distinction) and Honest (commitment to visibility). Fits the Abraxas register of earned metaphor and philosophical precision.
- **Risk:** Highly obscure; demands serious philosophical context to justify. Users unfamiliar with phenomenology will not recognize it.
- **Confidence:** Very high (conceptually) but medium-high (accessibility)

#### Candidate 4: **`elenchus`**
- **Etymology:** Greek *elenchus* (from Socratic method of questioning) — "cross-examination" or "refutation through dialogue." The process of testing a claim until falsehood is revealed.
- **Archetype:** The Socratic method; the practice of rigorous questioning that strips away false certainty.
- **Character:** Philosophical, classical, methodologically precise. Emphasizes active validation through questioning.
- **Fit with family:** Adjacent to Agon (dialogue/opposition) but focused on the retrospective aspect: testing what you thought was true.
- **Risk:** Could be confused with Agon; both reference Socratic practice from different angles.
- **Confidence:** Medium — conceptually sound but potentially redundant with Agon

---

### Final Recommendation: **`aletheia`**

**Filename:** `aletheia.skill` (source directory: `skills/aletheia/`)

**Rationale:**

1. **Archetype clarity:** Aletheia is not a figure but a *principle* — truth as un-hiddenness, as the process of disclosure. This perfectly captures the skill's function: retrospective validation that reveals whether label-confidence held up over time.

2. **Temporal sophistication:** Aletheia's emphasis on *revealing* and *un-concealing* maps precisely to what the skill does: it takes past claims (which were labeled with confidence) and validates them, revealing whether the labels were trustworthy. Over time, you build a record of what your "truth-confidence" actually predicts.

3. **Conceptual family fit:** Aletheia sits beautifully alongside:
   - **Agon** (opposition that produces truth through tension)
   - **Janus** (epistemic threshold where truth and dream are distinguished)
   - **Honest** (plain commitment to truth)
   - **Abraxas Oneironautics** (integration of all material under unified principle)

   These four skills form a complete epistemic and practice system: opposition → distinction → honesty → integration.

4. **Philosophical precision:** Aletheia invokes Heidegger's phenomenological reframing of truth — not truth as correspondence (does this label match reality?) but truth as disclosure (what is revealed when we validate past claims?). This is the exact operation the skill performs.

5. **Name weight:** Like Agon, Aletheia requires explanation but rewards it. Users who learn the name will understand the philosophical tradition it invokes — Greek phenomenology, Heidegger, the concept of truth as process rather than static assertion.

6. **Metaphorical embodiment:** Aletheia embodies the principle of progressive truth-disclosure — the figure of the Validator, the Record-Keeper, the Long Witness. The skill that watches over time to see what was actually true.

**Integration note:** In documentation, frame Aletheia as "the phenomenological practice of truth-disclosure through retrospective validation" — emphasize that this skill transforms confidence labels into a calibrated record of what the system can actually predict.

---

## Aesthetic Coherence Across the Extended Family

### The Four-Skill System

| Skill | Name | Etymology | Archetype | Epistemic Role |
|---|---|---|---|---|
| **Agon** | Greek *agon* | Sacred contest | Principle of productive opposition | Generates opposing positions; truth through tension |
| **Janus** | Latin *Janus* | Two-faced Roman god | Threshold guardian | Distinguishes fact from dream; epistemic dual-face |
| **Honest** | English virtue | Direct embodiment | Plain witness | Everyday anti-hallucination; plain language |
| **Aletheia** | Greek *aletheia* | Un-hiddenness/disclosure | Principle of progressive revelation | Validates past claims; calibrates confidence over time |
| **Abraxas Oneironautics** | Gnostic *Abraxas* + Greek *oneironautics* | Totality/integration + dream navigation | Alchemical integration | Transforms symbolic material into lived practice |

**Coherence analysis:**

1. **Linguistic register:** Four out of five names draw from classical sources (Greek, Latin, English virtue); one invokes Gnosticism. This is intentional: the system draws from multiple philosophical traditions unified by rigorous epistemic discipline.

2. **Conceptual progression:**
   - **Agon** = opposition generates truth
   - **Janus** = opposition is distinguished and labeled
   - **Honest** = labels are stated plainly
   - **Aletheia** = labels are validated and revealed as trustworthy (or not)
   - **Abraxas Oneironautics** = all material (validated and symbolic) is integrated into practice

3. **Metaphorical register:** Skill names range from abstract principle (Agon, Aletheia) to mythological figure (Janus, Abraxas) to pure virtue (Honest). This diversity is *intentional* — it reflects different epistemic registers and keeps the system from feeling monotonous or over-themed.

4. **Obscurity calibration:**
   - Honest — immediately accessible
   - Janus — classical but recognizable
   - Agon — requires explanation but learnable
   - Aletheia — requires serious explanation but conceptually rewarding
   - Abraxas Oneironautics — requires full philosophical context but carries maximum symbolic weight

This graduated obscurity is *correct* for the Abraxas ecosystem: users come in at different entry points and progress to deeper registers as their needs demand.

---

## Documentation & Voice Alignment

Both new skills' SKILL.md files should adopt the voice established by Janus and Honest:

**Voice principles for Agon and Aletheia:**
- Precise, not verbose — every sentence earns its place
- Non-promotional — states what the skill does, doesn't sell it
- Conceptually confident — introduces classical philosophy and phenomenology without apology
- Metaphorical but rigorous — the name and archetype are explained fully in the opening section
- No superlatives; strong verbs and nouns carry weight

**Opening structure (both skills):**
```markdown
# [Skill Name]

[Skill Name] is [the conceptual role], named for [etymology and archetype].
It solves [the specific problem] by [the mechanism].

It can operate [standalone / within Abraxas] or [integration notes].
```

Example opening for Agon:
```markdown
# Agon

Agon is structured adversarial reasoning, named for the Greek principle of sacred
contest and ritualized debate. It solves the problem of reasoning conducted in a
single voice by instantiating two opposing positions with asymmetric starting priors,
running them through the Janus labeling pipeline, and producing a Convergence Report
that shows where opposition resolves into consensus and where it remains productive.

It can operate standalone or as a component within extended Abraxas sessions.
```

---

## Summary: Final Naming Decisions

| Skill | Final Name | Filename | Archetype | Confidence |
|---|---|---|---|---|
| Dialogue Engine | **Agon** | `agon.skill` | Principle of sacred contest | High |
| Veritas | **Aletheia** | `aletheia.skill` | Principle of truth-disclosure | High |

**Rationale summary:**
- Both names are conceptually precise, etymologically grounded, and carry the weight appropriate to the Abraxas register
- Both fit naturally into the extended family without disrupting aesthetic coherence
- Both require documentation and explanation, but that documentation reward is part of the system's character
- The four-skill system (Agon + Janus + Honest + Aletheia + Abraxas Oneironautics) forms a complete epistemic and practice pipeline

---

## Implementation Checklist

When these skills move to implementation:

- [ ] Create `skills/agon/SKILL.md` with full command reference
- [ ] Create `skills/aletheia/SKILL.md` with full command reference
- [ ] Package: `cd skills && zip -r agon.skill agon/ && zip -r aletheia.skill aletheia/`
- [ ] Update `docs/skills.md` with Agon and Aletheia command tables
- [ ] Update `README.md` skills table
- [ ] Update `docs/index.md` navigation
- [ ] Add Agon and Aletheia to CLAUDE.md skill roster
- [ ] Update CONSTITUTION.md if either skill introduces new label types or commands

