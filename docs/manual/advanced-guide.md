# Abraxas Advanced Guide: Epistemic Engineering & Sovereign Orchestration

This guide is intended for **Power Users, System Architects, and Epistemic Engineers**. While the Beginner's Guide focuses on *what* the systems are, this document focuses on *how to orchestrate them* to achieve absolute epistemic integrity.

---

## 1. The Command Console: Master Slash Commands

Abraxas provides a high-density interface via slash commands. These are the "shortcuts" to the underlying MCP tools.

### 🛠️ Core Orchestration & Analysis
| Command | Purpose | Key Arguments |
| :--- | :--- | :--- |
| `/abraxas:honest` | Quick truth check/confidence labeling | `text` |
| `/abraxas:debate` | Trigger a dialectical clash on a claim | `claim_id` |
| `/abraxas:analyze` | Multi-system decomposition of a topic | `topic` |
| `/abraxas:status` | System health and ledger state report | $	ext{N/A}$ |
| `/dispatch` | Manually trigger a scan/spawn cycle | $	ext{N/A}$ |

### ⚔️ The Gauntlet (Adversarial & Verification)
| Command | Purpose | Key Arguments |
| :--- | :--- | :--- |
| `/agon debate` | Initiate adversarial dialogue | `claim_id` |
| `/agon oppose` | Generate direct counter-arguments | `claim_id` |
| `/agon weaken` | Find the weakest link in a proof | `claim_id` |
| `/agon steelman` | Build the strongest possible version of an opposing view | `claim_id` |
| `/agon report` | Synthesize Agon results into a risk report | `claim_id` |
| `/citation check` | Verify external citations for grounding | `claim` |
| `/krisis-evaluate` | Assign a weight to a claim's validity | `claim_id` |

### 🧠 Memory & Temporal Tracking
| Command | Purpose | Key Arguments |
| :--- | :--- | :--- |
| `/mnemosyne save` | Archive current session for later recall | `name` |
| `/mnemosyne restore` | Load a previous epistemic state | `session_id` |
| `/mnemosyne list` | Audit recent session history | $	ext{N/A}$ |
| `/chronos index` | Index a claim on the temporal timeline | `text`, `--confidence` |
| `/chronos drift` | Detect if a claim has evolved/diverged over time | `claim_id` |
| `/chronos resolve` | Resolve a temporal conflict (e.g., via recency) | `drift_id`, `--strategy` |
| `/chronos timeline` | Render a visual evolution of a claim | `--format` |

### 🔍 Research & Discovery
| Command | Purpose | Key Arguments |
| :--- | :--- | :--- |
| `/research start` | Initialize a formal research project | `project_name` |
| `/research add` | Ingest new sources into the project | `url/doi/text` |
| `/research analyze` | Generate a synthesis from project sources | `topic` |
| `/retrieval search` | Grounded search across indexed sources | `query` |
| `/sieve-analyze` | Extract high-valence signals from noise | $	ext{N/A}$ |
| `/synesis theorize` | Propose a provisional theory from claims | `domain` |

### 🌀 Meta-Cognition & Evolution
| Command | Purpose | Key Arguments |
| :--- | :--- | :--- |
| `/metanoia agon audit` | Audit the adversarial parameters for bias | $	ext{N/A}$ |
| `/metanoia agon evolve` | Evolve stress-test parameters for higher rigor | `target` |
| `/metanoia harmonia refine` | Optimize a workflow DAG for efficiency | `composition_id` |
| `/audit document` | Deep-scan a file for epistemic gaps | `{path}` |

---

## 2. Epistemic Engineering: Designing "The Gauntlet"

Advanced users do not run tools in isolation; they design **Gauntlets**. A Gauntlet is a specialized sequence of systems tailored to the *type* of truth being sought.

### Pattern A: The Technical Audit (High Precision)
Used for verifying code, math, or engineering specs.
`Sieve` $ightarrow$ `L-Math` $ightarrow$ `Logos` $ightarrow$ `Agon (Weaken)` $ightarrow$ `Citation Check` $ightarrow$ `Mnemosyne`.
- **Goal**: Find a single point of failure that collapses the entire claim.

### Pattern B: The Philosophical Synthesis (Broad Consensus)
Used for mapping conceptual frameworks or ethics.
`Research` $ightarrow$ `Janus (Arbitrate)` $ightarrow$ `CMEA` $ightarrow$ `Synesis (Theorize)` $ightarrow$ `Agon (Steelman)` $ightarrow$ `Sovereign Report`.
- **Goal**: Build a robust, multi-perspective theory that survives extreme adversarial pressure.

### Pattern C: The Signal Hunt (High Velocity)
Used for monitoring real-time data or market shifts.
`Sieve (Curate)` $ightarrow$ `Aporia (Void Map)` $ightarrow$ `Harmonia (Fast-Track)` $ightarrow$ `Honest (Label)`.
- **Goal**: Rapidly identify "epistemic voids" and prioritize them for deep research.

---

## 3. The Sovereign Hunter Loop: Internal Mechanics

In Sovereign Mode, Abraxas operates as an autonomous loop. Understanding this allows you to "steer" the agent by modifying its parameters.

1. **Sensing (The Intake)**:
   - Tools: `Sieve`, `Retrieval`.
   - *Advanced Tip*: Use `/sieve-curate` to adjust the valence thresholds for what the agent considers "urgent."
2. **Mapping (The Void)**:
   - Tools: `Aporia`.
   - *Advanced Tip*: If the agent is stuck, manually run `/abraxas:analyze` to force a wider decomposition of the topic.
3. **Synthesis (The Build)**:
   - Tools: `Harmonia`, `Logos`.
   - *Advanced Tip*: Use `/metanoia harmonia refine` to remove redundant steps from the agent's reasoning chain.
4. **Attack (The Stress-Test)**:
   - Tools: `Agon`, `Soter`.
   - *Advanced Tip*: Force the agent to `/agon steelman` the opposite of its current conclusion to check for confirmation bias.
5. **Promotion (The Threshold)**:
   - Logic: $	ext{Confidence} \ge 80\%$.
   - *Advanced Tip*: For mission-critical "Genesis Blocks," increase the promotion threshold to $95\%$.

---

## 4. Complex Case Study: Resolving a "Truth Conflict"

**Scenario**: Two high-trust sources provide contradictory data on a quantum computing benchmark.

**The Advanced Workflow**:
1. **Isolate the Divergence**:
   - Run `/abraxas:analyze` to find the exact point where Source A and Source B diverge.
2. **Temporal Audit**:
   - Run `/chronos drift` to see if one source is simply outdated.
3. **Adversarial Clash**:
   - Run `/agon debate` using the two sources as opposing agents.
4. **Arbitrate via CMEA**:
   - Use `Cross-Model Epistemic Arbitration` to see if different LLMs (Claude, GPT, Gemini) consistently favor one logic over the other.
5. **Synthesize a "Provisional Theory"**:
   - Use `/synesis theorize` to create a theory that accounts for *why* both sources might be partially correct (e.g., different testing environments).
6. **Promote to Ledger**:
   - Save the result to `Mnemosyne` as a `CONFLICT_RESOLVED` fragment.

---

## 5. Distributed Truth: PEF & CMEA

The frontier of Abraxas is the movement from a single "Brain" to a **Portable Epistemic Frame (PEF)**.

- **PEF**: A portable, content-hashed set of verified claims and provenance chains. This allows you to "export" your truth-set and import it into another Abraxas instance without re-running the Gauntlet.
- **CMEA**: Uses multiple models to act as a "jury." If three different models, each using different internal logic, all reach the same conclusion after an Agon stress-test, the confidence is promoted exponentially.

---

## 6. Power User Checklist

- [ ] **Audit your Agon**: Run `/metanoia agon audit` monthly to ensure your stress-tests haven't become predictable.
- [ ] **Clear the Voids**: Use `/abraxas:status` to find "epistemic voids" and schedule "Encounters" to fill them.
- [ ] **Sync your PEF**: Export your verified ledger to a PEF file to ensure persistence across hardware/model migrations.
