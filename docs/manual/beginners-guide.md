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

## 3. The "How": How to use Abraxas

Depending on your needs, you can interact with Abraxas in two modes: **Reactive** and **Sovereign**.

### A. Reactive Mode (The Precision Tool)
Use this when you have a specific claim you want to audit. You invoke the tools manually to dismantle a specific piece of information.

**Example Workflow**:
1. **Create a Claim**: Define exactly what you are testing.
2. **Verify**: Link the claim to sources and calculate confidence.
3. **Stress Test**: Try to prove the claim wrong.

### B. Sovereign Mode (The Autonomous Engine)
Use this when you have a complex goal (e.g., "Research the viability of P2P epistemic frames"). The agent takes over and runs the **Hunter Loop**:
`Sensing` $ightarrow$ `Mapping` $ightarrow$ `Synthesis` $ightarrow$ `Attack` $ightarrow$ `Promotion` $ightarrow$ `Report`.

---

## 4. Practical Examples & Expected Outputs

### Example 1: Verifying a Specific Claim
**User Goal**: Verify if a specific technical claim is true.

**Action (Tool Call)**:
`mcp__abraxas__core_create_claim(claim="The speed of light is constant in all inertial frames", lens="physics")`

**Expected Output**:
```json
{
  "claim_id": "cls_88234",
  "status": "created",
  "confidence": 0.0,
  "evidence_links": []
}
```

**Action (Tool Call)**:
`mcp__abraxas__verify_claim(claim_id="cls_88234", source="Einstein's Special Relativity", verification_status="confirmed")`

**Expected Output**:
```json
{
  "claim_id": "cls_88234",
  "updated_confidence": 0.95,
  "status": "promoted",
  "label": "VERIFIED",
  "reasoning": "Claim is anchored to fundamental physical constants and peer-reviewed literature."
}
```

### Example 2: Identifying Epistemic Voids
**User Goal**: Find out what the system *doesn't* know about a topic.

**Action (Tool Call)**:
`mcp__abraxas__identify_gaps(topic="P2P Epistemic Frames")`

**Expected Output**:
```json
{
  "voids": [
    {
      "gap": "Lack of consensus on conflict resolution for contradictory anchors",
      "urgency": "high",
      "suggested_action": "Run an Auto-Agon session on conflict resolution strategies"
    },
    {
      "gap": "Undefined latency thresholds for P2P sync in high-volume ledgers",
      "urgency": "medium",
      "suggested_action": "Research existing distributed ledger latency benchmarks"
    }
  ]
}
```

---

## 5. Getting Started Checklist

If you are new to the system, follow these steps to initialize your environment:

- [ ] **Load the Constitution**: Add `CONSTITUTION.md` to your system prompt to enforce Sovereign behavior.
- [ ] **Install the Skills**: Load the `.skill` archives to enable slash commands in your agent.
- [ ] **Start an Encounter**: Ask the agent: *"Identify a gap in my current project's epistemic frame and propose an encounter to resolve it."*
