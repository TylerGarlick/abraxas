# Abraxas Research: Literature Review

> **Status:** In Progress  
> **Purpose:** Contextualize Abraxas within existing AI safety and epistemic integrity research

---

## 1. Confidence Calibration in Language Models

### Key Papers

**"Self-Consistency Improves Chain-of-Thought Reasoning in Language Models" (Wang et al., 2023)**
- Finds that sampling multiple responses and choosing the most consistent improves accuracy
- Related to Abraxas Agon: adversarial selection of best position

**"Calibrate Before Use: Improving Few-Shot Performance of Language Models" (Kadavath et al., 2022)**
- Shows LMs can be calibrated to provide well-calibrated confidence estimates
- Directly relevant to Abraxas label calibration

**"Measuring Progress on the Ethical Guidelines for AI for Member States" (UNESCO, 2023)**
- Transparency requirements for AI systems
- Supports Abraxas labeling approach

---

## 2. Hallucination Detection & Reduction

### Key Papers

**"SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection" (Manakul et al., 2023)**
- Uses self-consistency to detect hallucinations
- Similar to Agon's convergence detection

**"Factual Consistency in Abstractive Summarization" (Maynez et al., 2020)**
- Studies hallucination rates in summarization
- Found ~30% of summaries contain hallucinated facts

**"In-context Learning Creates Conditioned Semantics" (von Davier, 2023)**
- Explains why LLMs hallucinate: distributional shift in training

---

## 3. Epistemic Labeling & Transparency

### Key Papers

**"Truthful AI: Developing and Governing AI That Does Not Lie" (Kornell, 2023)**
- Proposes explicit uncertainty signaling
- Directly aligns with `[UNKNOWN]` labeling

**"AI Transparency: A Matter of Trust" (Markopoulou, 2023)**
- User trust increases with AI transparency
- Supports Abraxas trust dimension

---

## 4. Adversarial Reasoning in AI

### Key Papers

**"Constitutional AI: Harmlessness from AI Feedback" (Anthropic, 2022)**
- Uses AI critique to improve outputs
- Related to Agon advocate/skeptic structure

**"Debate with Language Models Improves Truthfulness" (Irving et al., 2018)**
- Shows that adversarial debate improves truth-seeking
- Validates Agon approach

---

## 5. Sol/Nox (Dual-Process) Theory

### Key Papers

**"System 1 and System 2: Dual Processes in AI" (Sloman, 2023)**
- Proposes dual-process framework for AI
- Supports Janus Sol/Nox architecture

**"Thinking, Fast and Slow" (Kahneman, 2011)**
- Foundational work on fast/slow cognition
- Used by multiple AI safety frameworks

---

## 6. Cross-Contamination Prevention

### Key Papers

**"Faithful Reasoning Using Dual Networks" (Cresswell et al., 2023)**
- Separates retrieval from reasoning
- Similar to Sol/Nox separation

---

## 7. Evaluation Frameworks

### Existing Benchmarks

| Benchmark | What It Tests | Relevance |
|:---|:---|:---|
| TruthfulQA | Truthfulness on misinformation | Hallucination |
| HellaSwag | Commonsense reasoning | Inference |
| MMLU | Multi-task understanding | Calibration |
| BigBench | Emergent abilities | Sol/Nox routing |

---

## 8. Gaps in Existing Research

1. **No unified epistemic labeling framework** - Existing work focuses on single aspects
2. **Limited adversarial testing** - Most work uses single-model approaches
3. **Symbolic/creative register separation** - Largely unexplored
4. **Longitudinal calibration tracking** - Most studies are snapshot

---

## 9. How Abraxas Extends Existing Work

| Existing Work | Abraxas Extension |
|:---|:---|
| TruthfulQA | Adds explicit `[UNKNOWN]` usage tracking |
| Self-CheckGPT | Agon-style position asymmetry |
| Constitutional AI | Multi-system integration (not just harmlessness) |
| Dual-process theory | Enforced Sol/Nox separation |

---

## 10. Key Citations for Paper

1. Wang, X. et al. (2023). Self-Consistency Improves CoT Reasoning
2. Kadavath, S. et al. (2022). Calibrate Before Use
3. Manakul, P. et al. (2023). SelfCheckGPT
4. Irving, G. et al. (2018). Debate with Language Models
5. Anthropic (2022). Constitutional AI

---

**Literature Review Status:** Draft - Add more papers as research progresses