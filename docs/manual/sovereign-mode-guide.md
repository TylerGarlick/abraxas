# Using Sovereign Mode: The Guide to Epistemic Missions

This guide transforms the theoretical "Sovereign Stack" into a practical operating manual. It describes the transition from **Reactive Interaction** to **Sovereign Missions**.

---

## 1. Reactive vs. Sovereign Mode

Most users interact with AI in **Reactive Mode**. In this mode, you provide an input and the AI provides a response. Even when using specific skills (e.g., calling `/honest`), the AI is simply applying a filter to a single turn of conversation.

**Sovereign Mode** is fundamentally different. It is a **Mission-Oriented State**. When you trigger a Sovereign Mission, Abraxas ceases to be a chatbot and becomes an autonomous epistemic engine. It employs the **Hunter Loop**:

`Sensing` $\rightarrow$ `Mapping` $\rightarrow$ `Synthesis` $\rightarrow$ `Attack` $\rightarrow$ `Promotion` $\rightarrow$ `Delivery`

### When to use Sovereign Mode?
Use this mode when the cost of being wrong is high, the subject is complex, or the input is symbolic. If you need a "definitive answer" rather than a "helpful summary," you are in Sovereign territory.

---

## 2. The Hunter Loop in Practice

Below are three archetypal missions that demonstrate why the Sovereign process is superior to standard prompting.

### Example A: The Rigorous Truth Claim
**The Goal:** Determine the validity of a complex technical or scientific claim.
**User Input:** *"Analyze the current viability of room-temperature superconductors based on the latest pre-prints."*

| Phase | Sovereign Action | Why This Matters |
| :--- | :--- | :--- |
| **Sensing** | **Sieve** filters the noise; **Scribe** grounds every claim in a source. | Prevents "hallucinated" citations or outdated papers from entering the logic stream. |
| **Mapping** | **Aporia** identifies "Epistemic Voids"—what we *don't* know yet. | Forces the agent to admit gaps instead of smoothing over them with plausible-sounding prose. |
| **Synthesis** | **Logos** maps the structural argument of the pre-prints. | Uncovers hidden assumptions and logical leaps in the authors' reasoning. |
| **Attack** | **Auto-Agon** launches an adversarial attack on the synthesized conclusion. | Breaks "confirmation bias." The system actively tries to prove the superconductors *don't* work. |
| **Promotion** | Claim is only promoted if $\ge 80\%$ confidence threshold is met. | Replaces "I think" with a deterministic epistemic label. |

**Result:** Instead of a summary, you receive a **Sovereign Report**: a high-density artifact that explicitly lists what is proven, what is suspected, and where the evidence fails.

---

### Example B: Symbolic & Psychological Integration
**The Goal:** Integrate a recurring symbol or dream state into a waking psychological framework.
**User Input:** *"I'm seeing a recurring image of a glass clock shattering in my dreams; integrate this with my current professional burnout."*

| Phase | Sovereign Action | Why This Matters |
| :--- | :--- | :--- |
| **Sensing** | **Janus (Nox Face)** activates the symbolic/dreaming register. | Prevents the AI from treating a dream as a "factual event" (which would be a category error). |
| **Mapping** | **Mnemosyne** recalls previous symbols and "figure genealogies" from the ledger. | Identifies if the "shattering clock" is a new symbol or a mutation of a previous one. |
| **Synthesis** | **Oneironautics** bridges the symbolic image to the felt sense of burnout. | Uses the Qualia Bridge to map a visual image to an emotional state. |
| **Attack** | **Janus (Sol Face)** audits the interpretation for over-reach or "psycho-babble." | Ensures the symbolic interpretation doesn't drift into unfounded speculation. |

**Result:** A **Symbolic Integration Map** that respects the boundary between the waking and dreaming mind.

---

### Example C: High-Stakes Strategic Pivot
**The Goal:** Make a critical decision based on multi-variate risk.
**User Input:** *"Should I pivot my company's core architecture to a decentralized peer-to-peer model?"*

| Phase | Sovereign Action | Why This Matters |
| :--- | :--- | :--- |
| **Sensing** | **Soter** scans the request for "sycophantic triggers" (e.g., the user wanting a "yes"). | Neutralizes the AI's tendency to agree with the user just to be helpful. |
| **Mapping** | **Logos** breaks the pivot into atomic propositions and dependencies. | Exposes the "hidden" costs and technical debts of a P2P shift. |
| **Attack** | **Agon** simulates the worst-case failure scenarios for each dependency. | Moves the analysis from "best case" to "survivable case." |
| **Promotion** | Confidence thresholding against the internal "Success Metric" config. | Provides a "Go/No-Go" recommendation based on mathematical confidence, not a vibe. |

**Result:** A **Sovereign Decision Matrix** that prioritizes risk-mitigation over optimism.

---

## 3. Operationalizing the Brain

To successfully run a Sovereign Mission, start with the following sequence:

### Step 1: The Power-On
Invoke the `sovereign-boot` skill. This ensures all MCP servers (`soter`, `mnemosyne`, `janus`) are online.
> **Command:** `Abraxas, activate.` (or call the boot script)

### Step 2: The Health Check
Verify the environment is stable and the constitution is loaded using `sovereign-core`.
> **Command:** `/health_check detailed`

### Step 3: The Mission Trigger
Present your complex query. If the agent stays in "Reactive Mode," explicitly command it to enter the Hunter Loop.
> **Prompt:** *"Initialize Sovereign Mission: [Your Query]. Execute the full Hunter Loop from Sensing to Delivery."*

---

## 4. The Sovereign Report (The Output Standard)

A Sovereign output is not a chat message. It is a **Sovereign Report** containing:
1. **Epistemic Status**: (e.g., `[VERIFIED]`, `[HYPOTHESIS]`, `[VOID]`)
2. **Confidence Score**: A percentage based on the 80% threshold.
3. **Provenance Chain**: A deterministic link back to the original source.
4. **Adversarial Note**: A summary of what the `Agon` system tried to use to disprove the claim.
