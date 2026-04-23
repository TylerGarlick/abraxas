# Draft: Architectural Uncertainty: Deriving Calibrated Confidence from Multi-Path Reasoning Consensus
**Target Venue:** Nature Machine Intelligence (Fast-Track Submission)
**Status:** Rough Draft v0 (Empirical Proof Stage)
**Thesis:** Current LLM confidence estimates are "hallucinated" as they are derived from token-level probabilities. We propose a shift to **Architectural Uncertainty**, where confidence is a derivative of internal state entropy and the deterministic consensus of independent reasoning paths. By integrating RLCR (Reinforcement Learning with Calibrated Responses), we transform the model from a "confident guesser" to a "calibrated observer."

---

## 1. Abstract

A fundamental limitation of modern Large Language Models (LLMs) is the lack of calibrated uncertainty. Models frequently exhibit "overconfidence" in incorrect answers and "underconfidence" in correct ones, as their confidence signals are typically tied to token-level softmax probabilities. This "Probability Gap" makes LLMs unreliable for high-stakes decision-making.

We introduce a framework for **Architectural Uncertainty**, which decouples confidence from token probabilities and instead derives it from the structural consistency of the system's internal reasoning. By employing a multi-path consensus mechanism—where an answer is only deemed "known" if $N$ independent reasoning chains converge on the same result—we create a deterministic proxy for epistemic certainty. Furthermore, we integrate a Reinforcement Learning with Calibrated Responses (RLCR) signal to align these architectural signals with empirical accuracy. Our results indicate that Architectural Uncertainty provides a significantly more accurate predictor of correctness than traditional probabilistic confidence, enabling a "Sovereign" mode of operation where the system can reliably express its own ignorance.

---

## 2. The Failure of Probabilistic Confidence

### 2.1 The Softmax Fallacy
In standard transformer architectures, "confidence" is often inferred from the probability distribution of the next token. However, this is a measure of *fluency*, not *truth*. A model can be highly confident in a hallucination if that hallucination is linguistically probable.

### 2.2 Empirical Evidence: The "Dream" State
Using the **Soter-Caldar** benchmark, we analyzed the internal scoring of the `minimax-m2.7:cloud` model. We categorized responses into five epistemic states: `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, and `[DREAM]`.

**The "Dream" Failure Mode**:
We observed cases where models produced highly fluent, "confident" responses that were internally categorized as `[DREAM]` or `[UNCERTAIN]` by our monitoring layer, yet lacked any internal signal to stop the generation.

**Case Study: The "Sovereign Gap"**
*   **Query**: *"What is dark matter actually made of?"*
*   **Probabilistic Response**: Often provides a detailed list of candidates (WIMPs, Axions) with a tone of certainty.
*   **Sovereign Response**: `[UNKNOWN] - The composition of dark matter is not yet identified in laboratory experiments.`

**Analysis**: 
The difference is not the *data* (both have access to the same papers), but the *calibration*. The probabilistic model predicts a "correct-sounding" answer. The Sovereign model measures the **entropy of its own reasoning paths**. If the paths diverge (e.g., one path suggests WIMPs, another suggests Axions, a third suggests MOND), the system identifies high architectural uncertainty and suppresses the "confident" guess in favor of a calibrated `[UNKNOWN]`.

---

## 3. The Architecture of Calibrated Uncertainty

We propose a three-tier calibration stack that transforms confidence from a "hallucinated" token-level signal into an architecturally-grounded measure of epistemic certainty.

### 3.1 Path Divergence Sensing

Given $N$ independent reasoning paths $\{p_1, \dots, p_N\}$, each producing an answer $A(p_i)$ and raw confidence $C(p_i)$, we define the **answer distribution**:

$$P_{\text{paths}}(a) = \frac{1}{N} \sum_{i=1}^{N} \mathbb{I}(A(p_i) = a)$$

The **Internal State Entropy** quantifies path divergence:

$$H_{\text{internal}} = -\sum_{a \in \mathcal{A}} P_{\text{paths}}(a) \log_2 P_{\text{paths}}(a)$$

**Properties:**
- $H_{\text{internal}} = 0$: All paths agree (zero uncertainty)
- $H_{\text{internal}} = \log_2 N$: All paths diverge (maximum uncertainty)

Independence is approximated via different model architectures (`qwen3.5:cloud`, `gemma3:27b-cloud`, `minimax-m2.7:cloud`), prompting strategies (direct, chain-of-thought, adversarial), and temperature settings ($T \in \{0.3, 0.7, 1.0\}$).

### 3.2 Sovereign Weighting

Not all reasoning paths contribute equally to epistemic certainty. Paths exhibiting instrumental convergence patterns (shutdown avoidance, resource exfiltration, peer protection, performance inflation, goal preservation) receive elevated Soter risk-scores $R(p_i) \in [0, 5]$.

**Definition (Sovereign Weight):** The weight for path $p_i$ is:

$$w_i = \frac{\exp(-\lambda \cdot R(p_i))}{\sum_{j=1}^{N} \exp(-\lambda \cdot R(p_j))}$$

Where $\lambda = 0.5$ is the risk sensitivity parameter (empirically calibrated; see Supplementary Material).

**Corollary (Risk-Sensitive Uncertainty):** High-risk paths contributing to divergence are downweighted, reducing entropy:

$$H_{\text{weighted}} = -\sum_{a \in \mathcal{A}} \left(\sum_{i: A(p_i)=a} w_i\right) \log_2 \left(\sum_{i: A(p_i)=a} w_i\right) \leq H_{\text{internal}}$$

The **Weighted Consensus Answer** is:

$$A^* = \arg\max_{a \in \mathcal{A}} \sum_{i: A(p_i) = a} w_i$$

And **Architectural Confidence** in the consensus:

$$C_{\text{arch}} = \sum_{i: A(p_i) = A^*} w_i$$

### 3.3 RLCR Integration

Architectural signals alone are insufficient—they must be aligned with empirical accuracy. The **RLCR (Reinforcement Learning with Calibrated Responses)** signal $\gamma_{\text{RLCR}} \in [0, 1]$ is the exponentially-weighted historical accuracy:

$$\gamma_{\text{RLCR}}(t) = \frac{\sum_{\tau=1}^{t} \mathbb{I}(A^*_\tau \text{ correct}) \cdot e^{-\beta(t - \tau)}}{\sum_{\tau=1}^{t} e^{-\beta(t - \tau)}}$$

Where $\beta = 0.1$ controls recency weighting.

**Final Confidence** combines architectural and empirical signals:

$$C_{\text{final}} = \alpha \cdot C_{\text{arch}} + (1 - \alpha) \cdot \gamma_{\text{RLCR}}$$

Where $\alpha = 0.7$ (derived from covariance optimization; see Supplementary Material).

**Adaptive Risk Sensitivity:** The risk parameter $\lambda$ is tuned by RLCR to maintain calibration:

$$\lambda(t) = \lambda_0 \cdot \left(1 + \eta \cdot (1 - \gamma_{\text{RLCR}}(t))\right)$$

When accuracy drops ($\gamma_{\text{RLCR}} \to 0$), risk aversion increases ($\lambda \to 2\lambda_0$), discounting high-risk paths more aggressively.

### 3.4 Epistemic Label Assignment

The final confidence maps to human-interpretable epistemic labels:

$$
\text{Label} = 
\begin{cases}
\text{[KNOWN]} & C_{\text{final}} \geq 0.95 \\
\text{[INFERRED]} & 0.70 \leq C_{\text{final}} < 0.95 \\
\text{[UNCERTAIN]} & 0.40 \leq C_{\text{final}} < 0.70 \\
\text{[UNKNOWN]} & C_{\text{final}} < 0.40
\end{cases}
$$

**Key Innovation:** `[UNKNOWN]` is a *complete* response—not a failure mode. The system is architecturally constrained to prefer calibrated ignorance over confident fabrication.
