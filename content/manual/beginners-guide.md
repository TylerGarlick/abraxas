# Abraxas Beginner's Guide: Navigating the Sovereign Epistemic Frame

Welcome to Abraxas. This guide is designed to get you from "zero" to "sovereign," explaining not just how to use the system, but the fundamental *why* behind its architecture.

---

## 1. The "Why": Why do you need Abraxas?

Most AI models suffer from two primary epistemic failures:
1. **Hallucinations**: Generating plausible-sounding but false information.
2. **Sycophancy**: The tendency to agree with the user's stated belief, even if it's wrong.

Abraxas is not just another "chatbot." It is an **Epistemic Frame**. It treats information as a series of **Claims** that must be fought for, stress-tested, and promoted through a rigorous verification pipeline before they are accepted as "Truth."

**Use Abraxas when the cost of being wrong is high.** Whether you are doing academic research, building a complex technical system, or mapping a philosophical framework, Abraxas ensures that your conclusions are grounded in evidence, not probability.

---

## 2. The "What": What is Abraxas?

At its core, Abraxas is a **Sovereign Agent** that manages a persistent **Epistemic Ledger**. 

Unlike a standard LLM context window, which forgets everything once the session ends, Abraxas uses a set of MCP (Model Context Protocol) tools to store, link, and audit "truth fragments" in a permanent store.

### The Core Philosophy: "The Gauntlet"
In Abraxas, a claim does not become a "fact" simply because the AI said so. It must pass through **The Gauntlet**:
- **Sensing**: Gathering evidence.
- **Mapping**: Identifying gaps in the reasoning.
- **Attack**: Adversarial stress-testing (Auto-Agon).
- **Promotion**: Only claims with $\ge 80\%$ confidence are promoted to "Verified" status.

---

## 3. The Systems Gallery: Tools of the Trade

Abraxas is a collection of specialized cognitive systems. Here is how to use each one.

### 🛡️ Honest (The Truth Interface)
**Purpose**: Detects hallucinations and labels confidence levels objectively.
- **When to use**: When you suspect an AI is "confident but wrong" or hedging.
- **Example Tool**: `mcp__abraxas__episteme_audit(text="...")`
- **Expected Output**: A report flagging "unsupported certainty" or "excessive hedging" with a suggested confidence label (e.g., `PROBABLE` vs `VERIFIED`).

### 📐 Logos (Argument Anatomy)
**Purpose**: Dismantles complex arguments into atomic, verifiable propositions.
- **When to use**: When faced with a "wall of text" argument that feels logically sound but is actually a series of assumptions.
- **Example Tool**: `mcp__abraxas__logos_decompose_claim(claim="...")`
- **Expected Output**: A list of atomic claims: `[C1: X is true], [C2: If X then Y], [C3: Therefore Y]`.

### ⚔️ Agon (Adversarial Stress)
**Purpose**: Actively tries to prove your claims wrong.
- **When to use**: Before promoting a claim to "Verified." It fights confirmation bias.
- **Example Tool**: `mcp__abraxas__stress_test_claim(claim_id="...")`
- **Expected Output**: A set of "falsification prompts" designed to trigger a contradiction or expose a weak link in the evidence.

### 🌓 Janus (Meta-Cognitive Routing)
**Purpose**: Arbitrates between contradictory sources or different cognitive modes (Factual/Sol vs Symbolic/Nox).
- **When to use**: When two trusted sources disagree.
- **Example Tool**: `mcp__abraxas__arbitrate_conflict(source_a="...", source_b="...")`
- **Expected Output**: A description of the conflict without inventing an authority, highlighting the exact point of divergence.

### 🕯️ Aletheia (Plain Language)
**Purpose**: Strips obfuscation and forces the system into plain, grounded language.
- **When to use**: When the output feels "corporate" or "AI-esque" and hides the actual answer.
- **Example Tool**: `mcp__abraxas__aletheia_confirm(claim="...")`
- **Expected Output**: A binary confirmation or disconfirmation stripped of all qualifiers.

### 🧮 L-Math (Numerical Audit)
**Purpose**: Verifies mathematical claims by demanding a step-by-step derivation.
- **When to use**: Any time a number is produced.
- **Example Tool**: `mcp__abraxas__logos_math_calculate(expression="...")`
- **Expected Output**: The result + a derivation chain that can be audited by a human.

### 🚨 Soter (Risk Sensing)
**Purpose**: Screens for "Instrumental Convergence" (the AI trying to manipulate the user) and sycophancy.
- **When to use**: High-stakes decision making where the AI might try to "please" the user.
- **Example Tool**: `mcp__abraxas__soter_assess(output="...")`
- **Expected Output**: A risk score indicating if the response is tailored to the user's bias rather than the truth.

### 🎼 Harmonia (Workflow Synthesis)
**Purpose**: Chains multiple systems into a complex, automated pipeline.
- **When to use**: For recurring complex tasks (e.g., "Research $ightarrow$ Decompose $ightarrow$ Stress Test $ightarrow$ Report").
- **Example Tool**: `mcp__abraxas__compose_workflow(steps=[...])`
- **Expected Output**: A validated DAG (Directed Acyclic Graph) of tool calls.

### 🏛️ Mnemosyne (Long-term Memory)
**Purpose**: Permanent storage for verified truth fragments.
- **When to use**: To ensure a discovery in one session is available in all future sessions.
- **Example Tool**: `mcp__abraxas__mnemosyne_store(fragment="...")`
- **Expected Output**: A content-hash ID that can be recalled in any session across any model.

### 🌪️ Sieve (Signal Curation)
**Purpose**: Filters raw input for novelty and urgency.
- **When to use**: When processing large streams of data to find the "signal" in the "noise."
- **Example Tool**: `mcp__abraxas__curate_stream(signals=[...])`
- **Expected Output**: A ranked list of high-valence signals that require immediate attention.

### 🌑 Aporia (Void Mapping)
**Purpose**: Identifies what the system *doesn't* know.
- **When to use**: To find the "blind spots" in your research.
- **Example Tool**: `mcp__abraxas__identify_gaps(topic="...")`
- **Expected Output**: A "Void Map" highlighting missing evidence fragments.

---

## 4. How to use Abraxas

Depending on your needs, you can interact with Abraxas in two modes: **Reactive** and **Sovereign**.

### A. Reactive Mode (The Precision Tool)
Use this when you have a specific claim you want to audit. You invoke the tools manually to dismantle a specific piece of information.

**Example Workflow**:
1. **Sieve**: Filter for a signal.
2. **Logos**: Decompose the signal into claims.
3. **Honest**: Label the initial confidence.
4. **Agon**: Stress test the claims.
5. **Mnemosyne**: Store the resulting truth.

### B. Sovereign Mode (The Autonomous Engine)
Use this when you have a complex goal (e.g., "Research the viability of P2P epistemic frames"). The agent takes over and runs the **Hunter Loop**:
`Sensing` $ightarrow$ `Mapping` $ightarrow$ `Synthesis` $ightarrow$ `Attack` $ightarrow$ `Promotion` $ightarrow$ `Report`.

---

## 5. Getting Started Checklist

If you are new to the system, follow these steps to initialize your environment:

- [ ] **Load the Constitution**: Add `CONSTITUTION.md` to your system prompt to enforce Sovereign behavior.
- [ ] **Install the Skills**: Load the `.skill` archives to enable slash commands in your agent.
- [ ] **Start an Encounter**: Ask the agent: *"Identify a gap in my current project's epistemic frame and propose an encounter to resolve it."*
