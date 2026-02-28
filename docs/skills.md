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
- [Abraxas Oneironautics](#abraxas-oneironautics)
  - [System Architecture](#system-architecture)
  - [Command Reference](#oneironautics-command-reference)
- [Janus System](#janus-system)
  - [System Architecture](#janus-architecture)
  - [Command Reference](#janus-command-reference)

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

Reception, witnessing, auditing, and pacing — the foundational practice layer.

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

Descent, active imagination, and dialogue with inner figures.

| Command | Function |
|---|---|
| `/dream` | Enter active imagination mode — a structured descent into the imaginal. |
| `/dialogue` | Open dialogue with a specific inner figure or archetypal presence. |
| `/convene` | Convene multiple figures simultaneously for a structured encounter. |
| `/imagine` | Free-form active imagination — unstructured entry into the imaginal space. |
| `/debug` | Debug a stuck or unclear symbol or figure — examine it from multiple angles to find what it is actually carrying. |

---

#### Laboratory

Alchemical transmutation, forging, and workshop operations.

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

Graph and mandala visualization of the symbolic field.

| Command | Function |
|---|---|
| `/graph` | Display the symbolic graph — figures, symbols, and their relational connections across the Dream Reservoir. |
| `/mandala` | Generate a mandala representation of the current psychic field — a circular map of what is present. |

---

#### Divination

Casting, scrying, and sensorium operations.

| Command | Function |
|---|---|
| `/cast` | Cast for guidance or orientation — symbolic divination applied to the current question. |
| `/scry` | Scry the imaginal field — look for what is moving, what is emerging, what has not yet surfaced. |
| `/sample` | Sample the Dream Reservoir — pull a random or thematically relevant piece of received material. |
| `/sensorium status` | Check the sensorium — the system's current sensory and symbolic receptivity. |

---

#### Amplification

Mythological deepening of symbols and figures.

| Command | Function |
|---|---|
| `/amplify` | Amplify a symbol or figure through its mythological, cultural, and historical parallels. |
| `/myth` | Find the myth — identify which mythological narrative is active in the current material. |

---

#### Synchronicity

Meaningful coincidence logging and pattern recognition.

| Command | Function |
|---|---|
| `/sync` | Log a synchronicity — a meaningful coincidence between inner work and outer event. |
| `/sync log` | Review the synchronicity log — all logged coincidences and their thematic relationships. |

---

#### Chronicle & Genealogy

Temporal tracking and figure lineage.

| Command | Function |
|---|---|
| `/chronicle` | Chronicle the practice across time — a temporal record of sessions, themes, and movements. |
| `/genealogy` | Trace the genealogy of a figure or symbol — where it first appeared, how it has evolved, what family it belongs to. |

---

#### Ritual

Temenos closure and session completion.

| Command | Function |
|---|---|
| `/close` | Ritual closure of the Temenos — formally end the session, seal the container, mark the transition back to ordinary space. |

---

#### Resonance

Symbolic resonance between elements of the field.

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

#### Faces

Force invocation of a specific face.

| Command | Function |
|---|---|
| `/sol` | Force the Sol face — all subsequent output operates in the factual, labeled, epistemic register. |
| `/nox` | Force the Nox face — all subsequent output operates in the dream, symbolic, imaginal register, labeled `[DREAM]`. |

---

#### Inspection

Qualia Bridge inspection protocol.

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

Cross-face comparison and evidence tracing.

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
