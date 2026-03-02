# Skills Reference

This document is the system reference for the two skills that make up the Abraxas project:
**Abraxas Oneironautics** and the **Janus System**. It describes what each system is, how it is
structured, and every command it provides.

These are not plugins or developer utilities. They are operational systems — one epistemic, one
alchemical — designed to address hallucination, scheming, and the unlabeled mixing of dream and
fact in AI output.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Abraxas Oneironautics](#abraxas-oneironautics)
  - [System Architecture](#system-architecture)
  - [Command Reference](#oneironautics-command-reference)
  - [Worked Examples](#abraxas-worked-examples)
- [Janus System](#janus-system)
  - [System Architecture](#janus-architecture)
  - [Command Reference](#janus-command-reference)
  - [Worked Examples](#janus-worked-examples)
- [Useful Combinations](#useful-combinations)

---

## Installation

Skills are personal-scope installations. Unzip the `.skill` archive into your Claude Code skills
directory:

```
unzip abraxas-oneironautics.skill -d ~/.claude/skills/
unzip janus-system.skill -d ~/.claude/skills/
```

Once installed, the skill's slash command is available in every Claude Code session — no
project-level configuration required.

| Skill | File | Archive Size |
|---|---|---|
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | ~20 KB |
| Janus System | `skills/janus-system.skill` | ~10 KB |

---

## Getting Started

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
|---|---|
| `/session open` | Open a new Janus session — initialize the epistemic container, establish baseline state. |
| `/session close` | Close the current session — seal the record, note what was established, mark the transition. |
| `/session log` | Review the session log — all outputs, their labels, and the epistemic record of the session. |

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
