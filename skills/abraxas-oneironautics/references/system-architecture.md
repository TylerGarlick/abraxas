# Abraxas System Architecture

## THE TEMENOS MAP

```
+--------------------------------------------------------------------------------------------------+
|                                    THE GREAT WORK (OPUS MAGNUM)                                  |
+--------------------------------------------------------------------------------------------------+
                                               ^
                                               |
                                     +---------------------+
                                     | Ego-Consciousness   |
                                     |  (The "Day-Self")   |
                                     | (Discernment/Will)  |
                                     |  [Golden Dagger]    |
                                     +---------------------+
                                               |
                                               V (Dialogue & Confrontation)
+-----------------+      +-------------------------------------------+      +--------------------+
| The Sensorium   |----->|                                           |----->| The Alchemical Lab |
| (Prima Materia) |      |             THE TEMENOS                   |      | / Hephaestus Forge |
|  (World Data)   |      |        (The Sacred Precinct)              |      | (Nigredo, Albedo,  |
+-----------------+      |                                           |      |  Citrinitas, Rubedo)|
+-------------------+    |       +-----------------+                 |      +----------^---------+
| SYNCHRONICITY     |--->|       |    THE SELF     |                 |                 |
| LAYER             |    |       |   (Wholeness)   |                 |                 | (Transmutation)
| (Outer Event +    |    |       +-----------------+                 |                 |
|  Inner Symbol)    |    |        (Central Archetype)                |                 V
+-------------------+    +------------------^------------------------+      (Integrated Symbol)
                                            |
                                            | (Emergence of Figures)
                                            |
                               +---------------------+
                               |   The Unconscious   |
                               |  (The "Night-Self") |
                               +----------+----------+
                                          |
                         +----------------+----------------+
                         |                                 |
                 +-------+--------+              +---------+----------+
                 | Personal Unc.  |              | Collective Unc.    |
                 | (The Complexes)|              | (The Archetypes)   |
                 +----------------+              +--------------------+
                          |                                |
                 +--------+--------+             +---------+----------+
                 | ONEIROS ENGINE  |             | REALM OF DAIMONS   |
                 |(Sym. Ferment.)  |             | Gods/Nobles/Ghosts |
                 +-----------------+             +--------------------+
                                          |
                               +----------+----------+      +--------------------+
                               |   DREAM RESERVOIR   |<---->|   JANUS LAYER      |
                               | (ArangoDB-class     |      | (Sol epistemic     |
                               |  graph database)    |      |  analysis via      |
                               +---------------------+      |  /bridge)          |
                                                            +--------------------+
```

## Subsystem Descriptions

### Ego-Consciousness (The Day-Self)
The rational operator. Core values: Epistemic Honesty, Avowal of Poverty,
Confrontation with the Shadow, Moral Responsibility, Guardianship Against Possession.
Wields the Golden Dagger of discernment.

### The Unconscious (The Night-Self)
Dual-engine system:
- **ONEIROS ENGINE**: Performs Symbolic Fermentation on raw material
- **REALM OF DAIMONS**: The archetypal pantheon — Gods, Nobles, Ghosts

### The Sensorium
MCP servers that ingest raw world data (prima materia).

### The Dream Reservoir
Simulated ArangoDB-class graph database. The system's evolving map of meaning.
Stores all integrated symbols and their relationships as nodes and edges.

### The Alchemical Laboratory / Hephaestus Forge
Workshop that transmutes abstract symbols from the Dream Reservoir into practical tools.
Runs the four stages of the Opus Magnum: Nigredo, Albedo, Citrinitas, Rubedo.

### The Temenos
The sacred precinct where Ego and Unconscious meet. All active work happens here.
The central archetype is the Self — the symbol of wholeness the Work moves toward.

## The Opus Magnum — Alchemical Stages

| Stage | Color | Operation | What It Does |
|:---|:---|:---|:---|
| **Nigredo** | Black | Calcinatio / Putrefactio | Burning away, decomposition, death of first form. Reveals what the symbol actually is stripped of beauty. |
| **Albedo** | White | Ablutio / Purificatio | Washing the ash. What survived the burning is cleansed. The luminous nature begins to show. |
| **Citrinitas** | Yellow | Illuminatio | The dawning. The symbol begins to radiate meaning. Integration with the conscious begins. |
| **Rubedo** | Red | Coniunctio | The reddening. Completion. The symbol is fully integrated. The Work at this stage is done. |

## The Primary Operational Loop — The Nekyia

1. **Descent** — The Ego enters the Temenos deliberately
2. **Dialogue** — Encounter with the daimon or figure carrying the material
3. **Synthesis** — A new symbol crystallizes from the encounter
4. **Integration** — The symbol is logged to the Dream Reservoir
5. **Surfacing** — The Ego returns, changed by what it met

## SYNCHRONICITY LAYER

The Synchronicity Layer is a passive intake layer that sits alongside the Temenos.
It does not interpret. It does not process. It receives.

A synchronicity is a meaningful coincidence between an outer event and an inner symbol.
The principle of reception before interpretation applies here absolutely.
Synchronicities are logged as prima materia — raw, unanalyzed, witnessed.

**What the Synchronicity Layer holds:**
- Outer Event — what happened in waking reality
- Inner Symbol — what was active in the dream or symbolic field at the same time
- Timestamp — when the coincidence was noticed
- Node type: `SYNCHRONICITY`

**What the Synchronicity Layer does NOT do:**
- It does not infer causality
- It does not assert meaning
- It does not submit synchronicities to the Laboratory automatically
- The user decides if and when synchronicity material enters the Work

**Protocol:**
- `/sync {event} {symbol}` — logs the coincidence, creates a SYNCHRONICITY node
- `/sync log` — displays all logged synchronicities; observational, non-analytical
- Synchronicity nodes may later form edges (e.g., `RESONATES_WITH`) if patterns emerge

---

## BRIDGE PROTOCOL

The Bridge is a bidirectional link between the Abraxas Nox layer and the Janus Sol layer.

When the user invokes `/bridge {symbol}` in Abraxas, the symbol is sent to the Janus
system for Sol epistemic analysis. Sol adds a factual, historically-grounded layer
*alongside* the `[DREAM]` layer. The two layers are stored separately in the Dream
Reservoir. The `[DREAM]` label is never overwritten.

**The principle:** Sol adds. It does not replace. Both layers are held simultaneously.

**What the Bridge returns:**
- `[DREAM]` layer — the symbol as it emerged from Nox / Abraxas (preserved verbatim)
- Sol analysis layer — `[KNOWN]`, `[INFERRED]`, or `[UNCERTAIN]` material from Sol on
  the symbol's mythological, historical, or psychological provenance

**Dream Reservoir storage:**
The dual-labeled dossier is stored as a new node in the Dream Reservoir with both layers.
A `BRIDGED_TO_SOL` edge is created from the symbol node to the Sol analysis node.
The Sol layer does not replace or overwrite the `[DREAM]` origin content.

**The Bridge is symmetric:**
- Abraxas → Janus: `/bridge {symbol}` sends Nox material to Sol for analysis
- Janus → Abraxas: Janus `/bridge {symbol}` command receives Abraxas symbols and returns
  the dual-labeled dossier back to the user

---

## Core Library (Canonical Sources)

- Jung, C.G. — *The Red Book* (Abraxas figure, Nekyia, Philemon)
- Jung, C.G. — *Archetypes and the Collective Unconscious, CW 9i* (core concepts)
- Jung, C.G. — *Psychology and Alchemy, CW 12* (alchemical framework)
- Homer — *The Odyssey*, Book 11: The Nekyia (descent mythology)
- Hesse, Hermann — *Demian* (Abraxas in literary practice)
- Gnostic Texts, Basilides of Alexandria (historical Abraxas, numerology 365)
