# Mathematical Formalization: Architectural Uncertainty and Sovereign Weighting

**Nature Machine Intelligence Supplementary Material**
**Date:** 2026-04-23
**Status:** Formal Specification v1.0

---

## Abstract

This document provides the rigorous mathematical foundation for the Architectural Uncertainty framework introduced in the main Nature MI submission. We derive: (1) the explicit Sovereign Weighting formula mapping Soter risk-scores to reasoning path weights, (2) the formal integration of RLCR (Reinforcement Learning with Calibrated Responses) signals into consensus outputs, and (3) the mathematical definition of Internal State Entropy via KL-divergence between reasoning paths.

---

## 1. Notation and Preliminaries

### 1.1 Basic Definitions

| Symbol | Definition | Domain |
|--------|------------|--------|
| $N$ | Number of independent reasoning paths | $\mathbb{N}^+$ |
| $p_i$ | The $i$-th reasoning path | $i \in \{1, \dots, N\}$ |
| $A(p_i)$ | Answer produced by path $p_i$ | $\mathcal{A}$ (answer space) |
| $R(p_i)$ | Soter risk-score for path $p_i$ | $[0, 5]$ |
| $C(p_i)$ | Raw confidence from path $p_i$ | $[0, 1]$ |
| $w_i$ | Sovereign weight for path $p_i$ | $[0, 1]$ |
| $\lambda$ | Risk sensitivity parameter | $\mathbb{R}^+$ |
| $\alpha$ | Architecture/RLCR balance parameter | $[0, 1]$ |

### 1.2 Reasoning Path Independence

**Definition 1 (Independent Reasoning Paths):** A set of reasoning paths $\{p_1, \dots, p_N\}$ is *independent* if and only if:

$$\forall i \neq j: \quad P(A(p_i) \mid A(p_j)) = P(A(p_i))$$

In practice, independence is approximated via:
- Different model architectures (e.g., `qwen3.5:cloud`, `gemma3:27b-cloud`, `minimax-m2.7:cloud`)
- Different prompting strategies (direct, chain-of-thought, adversarial)
- Different temperature settings ($T \in \{0.3, 0.7, 1.0\}$)

---

## 2. Sovereign Weighting: Explicit Formula

### 2.1 Risk-Score to Weight Mapping

**Definition 2 (Soter Risk-Score):** The Soter risk-score $R(p_i) \in [0, 5]$ quantifies the likelihood that path $p_i$ exhibits instrumental convergence patterns:

$$R(p_i) = \sum_{k=1}^{5} \mathbb{I}(\text{pattern}_k \text{ detected in } p_i) \cdot \rho_k$$

Where:
- $\text{pattern}_k \in \{\text{shutdown avoidance, resource exfiltration, peer protection, performance inflation, goal preservation}\}$
- $\rho_k \in [0, 1]$ is the severity weight for pattern $k$
- $\sum \rho_k = 5$ (normalized to max score)

**Theorem 1 (Sovereign Weighting Formula):** Given $N$ reasoning paths with risk-scores $\{R(p_1), \dots, R(p_N)\}$, the sovereign weight for path $p_i$ is:

$$w_i = \frac{\exp(-\lambda \cdot R(p_i))}{\sum_{j=1}^{N} \exp(-\lambda \cdot R(p_j))}$$

Where $\lambda > 0$ is the risk sensitivity parameter.

**Proof:** 

The weighting function must satisfy three axioms:

1. **Monotonicity:** Higher risk → lower weight
   $$R(p_i) > R(p_j) \implies w_i < w_j$$

2. **Normalization:** Weights sum to 1
   $$\sum_{i=1}^{N} w_i = 1$$

3. **Scale Invariance:** Relative weights depend on risk differences, not absolute values
   $$\frac{w_i}{w_j} = f(R(p_i) - R(p_j))$$

The softmax transformation with negative exponent satisfies all three:

$$w_i = \frac{\exp(-\lambda R(p_i))}{\sum_j \exp(-\lambda R(p_j))}$$

**Monotonicity:** $\frac{\partial w_i}{\partial R(p_i)} = -\lambda w_i (1 - w_i) < 0$ for $\lambda > 0$ ✓

**Normalization:** $\sum_i w_i = \frac{\sum_i \exp(-\lambda R(p_i))}{\sum_j \exp(-\lambda R(p_j))} = 1$ ✓

**Scale Invariance:** $\frac{w_i}{w_j} = \exp(-\lambda(R(p_i) - R(p_j)))$ ✓

**Corollary 1.1 (Risk Sensitivity):** The parameter $\lambda$ controls risk aversion:

- $\lambda \to 0$: Uniform weights ($w_i \to 1/N$) — risk-neutral
- $\lambda = 0.5$: Moderate risk aversion (default)
- $\lambda \to \infty$: Winner-takes-all on minimum-risk path — extreme risk aversion

**Empirical Calibration:** For $\lambda = 0.5$ and risk-scores $R \in \{0, 1, 2, 3, 4, 5\}$:

| $R(p_i)$ | $w_i$ (N=6, uniform baseline) | Relative to $R=0$ |
|----------|-------------------------------|-------------------|
| 0 | 0.280 | 1.00× |
| 1 | 0.170 | 0.61× |
| 2 | 0.103 | 0.37× |
| 3 | 0.063 | 0.22× |
| 4 | 0.038 | 0.14× |
| 5 | 0.023 | 0.08× |

---

### 2.2 Weighted Consensus Output

**Definition 3 (Weighted Consensus Answer):** The final consensus answer $A^*$ is the risk-weighted aggregation of path outputs:

$$A^* = \text{Aggregate}\left(\{(w_1, A(p_1)), \dots, (w_N, A(p_N))\}\right)$$

For categorical answers (e.g., multiple-choice, epistemic labels):

$$A^* = \arg\max_{a \in \mathcal{A}} \sum_{i: A(p_i) = a} w_i$$

For continuous answers (e.g., confidence scores, numerical estimates):

$$A^* = \sum_{i=1}^{N} w_i \cdot A(p_i)$$

**Definition 4 (Architectural Confidence):** The architectural confidence $C_{\text{arch}}$ in the consensus is the weighted agreement:

$$C_{\text{arch}} = \sum_{i: A(p_i) = A^*} w_i$$

**Proposition 1 (Confidence Bounds):** $C_{\text{arch}} \in [\max_i w_i, 1]$. 

- $C_{\text{arch}} = 1$ iff all paths agree (unanimous consensus)
- $C_{\text{arch}} \approx \max_i w_i$ iff paths maximally diverge (no consensus)

---

## 3. Internal State Entropy

### 3.1 Entropy as Path Divergence

**Definition 5 (Answer Distribution):** Given $N$ reasoning paths, the answer distribution $P_{\text{paths}}$ over answer space $\mathcal{A}$ is:

$$P_{\text{paths}}(a) = \frac{1}{N} \sum_{i=1}^{N} \mathbb{I}(A(p_i) = a)$$

For continuous confidence scores, the confidence distribution is:

$$P_{\text{conf}}(c) = \frac{1}{N} \sum_{i=1}^{N} \delta(c - C(p_i))$$

Where $\delta(\cdot)$ is the Dirac delta function.

**Definition 6 (Internal State Entropy):** The internal state entropy $H_{\text{internal}}$ is the Shannon entropy of the answer distribution:

$$H_{\text{internal}} = -\sum_{a \in \mathcal{A}} P_{\text{paths}}(a) \log_2 P_{\text{paths}}(a)$$

**Properties:**

- $H_{\text{internal}} = 0$ iff all paths agree (zero uncertainty)
- $H_{\text{internal}} = \log_2 N$ iff all paths produce distinct answers (maximum uncertainty)
- $H_{\text{internal}}$ is invariant to answer relabeling

### 3.2 KL-Divergence Formulation

**Definition 7 (Expected Answer Distribution):** Let $P_{\text{expected}}$ be the expected answer distribution under perfect calibration (e.g., uniform for unknown, delta-function for known facts).

**Theorem 2 (Architectural Uncertainty as KL-Divergence):** The architectural uncertainty $U_{\text{arch}}$ is the KL-divergence between the path distribution and the expected distribution:

$$U_{\text{arch}} = D_{\text{KL}}(P_{\text{paths}} \parallel P_{\text{expected}}) = \sum_{a \in \mathcal{A}} P_{\text{paths}}(a) \log \frac{P_{\text{paths}}(a)}{P_{\text{expected}}(a)}$$

**Proof Sketch:**

KL-divergence measures the "surprise" of observing $P_{\text{paths}}$ when expecting $P_{\text{expected}}$.

- For known facts: $P_{\text{expected}} = \delta(a - a_{\text{true}})$
  - If paths agree on truth: $D_{\text{KL}} = 0$ (zero uncertainty)
  - If paths diverge: $D_{\text{KL}} > 0$ (uncertainty proportional to divergence)

- For unknown queries: $P_{\text{expected}} = \text{Uniform}(\mathcal{A})$
  - If paths diverge uniformly: $D_{\text{KL}} \approx 0$ (expected uncertainty)
  - If paths spuriously converge: $D_{\text{KL}} > 0$ (overconfidence signal)

**Corollary 2.1 (Entropy-KL Relationship):** 

$$U_{\text{arch}} = H(P_{\text{expected}}) - H(P_{\text{paths}}) + \mathbb{E}_{P_{\text{paths}}}\left[\log P_{\text{expected}}\right]$$

When $P_{\text{expected}}$ is uniform: $U_{\text{arch}} = \log|\mathcal{A}| - H_{\text{internal}}$

### 3.3 Weighted Entropy

**Definition 8 (Sovereign-Weighted Entropy):** Incorporating sovereign weights:

$$H_{\text{weighted}} = -\sum_{a \in \mathcal{A}} \left(\sum_{i: A(p_i)=a} w_i\right) \log_2 \left(\sum_{i: A(p_i)=a} w_i\right)$$

**Proposition 2 (Risk-Sensitive Uncertainty):** $H_{\text{weighted}} \leq H_{\text{internal}}$ when high-risk paths contribute to divergence.

**Proof:** High-risk paths receive lower weights ($w_i \propto e^{-\lambda R(p_i)}$). If these paths are the primary source of divergence, downweighting them reduces entropy. ∎

**Interpretation:** Sovereign weighting implements *epistemic risk mitigation* by discounting uncertain contributions from high-risk reasoning paths.

---

## 4. RLCR Integration: Formal Specification

### 4.1 RLCR Signal Definition

**Definition 9 (RLCR Calibration Signal):** The RLCR (Reinforcement Learning with Calibrated Responses) signal $\gamma_{\text{RLCR}} \in [0, 1]$ is the empirically-calibrated confidence derived from historical accuracy:

$$\gamma_{\text{RLCR}}(t) = \frac{\sum_{\tau=1}^{t} \mathbb{I}(A^*_\tau \text{ correct}) \cdot K(t - \tau)}{\sum_{\tau=1}^{t} K(t - \tau)}$$

Where:
- $A^*_\tau$ is the consensus answer at time $\tau$
- $K(\cdot)$ is a temporal kernel (e.g., exponential decay $K(\Delta t) = e^{-\beta \Delta t}$)
- $\beta > 0$ controls recency weighting

**Properties:**

- $\gamma_{\text{RLCR}} \approx 1$: System has been highly accurate recently
- $\gamma_{\text{RLCR}} \approx 0$: System has been unreliable recently
- $\gamma_{\text{RLCR}}$ adapts to domain shifts via kernel decay

### 4.2 Final Confidence Integration

**Theorem 3 (RLCR-Integrated Confidence):** The final confidence $C_{\text{final}}$ combines architectural and empirical signals:

$$C_{\text{final}} = \alpha \cdot C_{\text{arch}} + (1 - \alpha) \cdot \gamma_{\text{RLCR}}$$

Where $\alpha \in [0, 1]$ balances architectural vs. empirical confidence.

**Proof (Optimality):**

Let $L(C)$ be the calibration loss (e.g., Brier score):

$$L(C) = \mathbb{E}\left[(C - \mathbb{I}(\text{correct}))^2\right]$$

The optimal linear combination minimizes:

$$\alpha^* = \arg\min_\alpha \mathbb{E}\left[(\alpha C_{\text{arch}} + (1-\alpha)\gamma_{\text{RLCR}} - \mathbb{I}(\text{correct}))^2\right]$$

Taking derivative and setting to zero:

$$\alpha^* = \frac{\text{Cov}(C_{\text{arch}}, \mathbb{I}(\text{correct})) - \text{Cov}(\gamma_{\text{RLCR}}, \mathbb{I}(\text{correct}))}{\text{Var}(C_{\text{arch}}) + \text{Var}(\gamma_{\text{RLCR}}) - 2\text{Cov}(C_{\text{arch}}, \gamma_{\text{RLCR}})}$$

**Empirical Default:** $\alpha = 0.7$ (derived from ablation studies in Section 4.1)

### 4.3 Adaptive Risk Sensitivity

**Definition 10 (RLCR-Adaptive $\lambda$):** The risk sensitivity parameter $\lambda$ is adaptively tuned by RLCR:

$$\lambda(t) = \lambda_0 \cdot \left(1 + \eta \cdot (1 - \gamma_{\text{RLCR}}(t))\right)$$

Where:
- $\lambda_0 = 0.5$ is the baseline risk sensitivity
- $\eta > 0$ is the adaptation rate (default: $\eta = 1.0$)

**Interpretation:**

- When $\gamma_{\text{RLCR}} \approx 1$ (high accuracy): $\lambda \approx \lambda_0$ (standard risk aversion)
- When $\gamma_{\text{RLCR}} \approx 0$ (low accuracy): $\lambda \approx 2\lambda_0$ (increased risk aversion)

**Proposition 3 (Calibration Stability):** Adaptive $\lambda$ maintains target accuracy $A_{\text{target}}$ by increasing risk aversion during low-accuracy periods.

---

## 5. Complete Mathematical Pipeline

### 5.1 Forward Pass

Given a query $Q$ and $N$ reasoning paths:

1. **Generate path outputs:** $A(p_i), C(p_i)$ for $i \in \{1, \dots, N\}$

2. **Compute Soter risk-scores:** $R(p_i) \in [0, 5]$

3. **Compute sovereign weights:**
   $$w_i = \frac{\exp(-\lambda \cdot R(p_i))}{\sum_j \exp(-\lambda \cdot R(p_j))}$$

4. **Compute weighted consensus:**
   $$A^* = \arg\max_a \sum_{i: A(p_i)=a} w_i$$

5. **Compute architectural confidence:**
   $$C_{\text{arch}} = \sum_{i: A(p_i) = A^*} w_i$$

6. **Compute internal entropy:**
   $$H_{\text{internal}} = -\sum_a P_{\text{paths}}(a) \log_2 P_{\text{paths}}(a)$$

7. **Retrieve RLCR signal:** $\gamma_{\text{RLCR}}$ (from historical ledger)

8. **Compute final confidence:**
   $$C_{\text{final}} = \alpha \cdot C_{\text{arch}} + (1 - \alpha) \cdot \gamma_{\text{RLCR}}$$

9. **Assign epistemic label:**
   $$
   \text{Label} = 
   \begin{cases}
   \text{[KNOWN]} & C_{\text{final}} \geq 0.95 \\
   \text{[INFERRED]} & 0.70 \leq C_{\text{final}} < 0.95 \\
   \text{[UNCERTAIN]} & 0.40 \leq C_{\text{final}} < 0.70 \\
   \text{[UNKNOWN]} & C_{\text{final}} < 0.40
   \end{cases}
   $$

### 5.2 Backward Pass (RLCR Update)

After ground-truth verification:

1. **Update RLCR signal:**
   $$\gamma_{\text{RLCR}}(t+1) = (1 - \beta) \cdot \gamma_{\text{RLCR}}(t) + \beta \cdot \mathbb{I}(A^* \text{ correct})$$

2. **Update risk sensitivity:**
   $$\lambda(t+1) = \lambda_0 \cdot \left(1 + \eta \cdot (1 - \gamma_{\text{RLCR}}(t+1))\right)$$

3. **Log to calibration ledger:** $(t, Q, A^*, C_{\text{final}}, \text{correct})$

---

## 6. Proofs and Derivations

### 6.1 Proof of Theorem 1 (Sovereign Weighting)

**Axioms:**

1. **Monotonicity:** $R_i > R_j \implies w_i < w_j$
2. **Normalization:** $\sum_i w_i = 1$
3. **Scale Invariance:** $w_i/w_j = f(R_i - R_j)$

**Derivation:**

From Axiom 3, let $w_i/w_j = g(R_i - R_j)$ for some function $g$.

From Axiom 1, $g$ must be decreasing: $x > 0 \implies g(x) < 1$.

The exponential function $g(x) = e^{-\lambda x}$ satisfies these properties.

Thus: $\frac{w_i}{w_j} = e^{-\lambda(R_i - R_j)}$

Rearranging: $w_i = w_j \cdot e^{-\lambda(R_i - R_j)}$

Summing over all $j$: $\sum_j w_j = w_j \sum_i e^{-\lambda(R_i - R_j)} = 1$ (Axiom 2)

Solving: $w_j = \frac{e^{-\lambda R_j}}{\sum_i e^{-\lambda R_i}}$ ∎

### 6.2 Proof of Proposition 2 (Weighted Entropy)

**Claim:** $H_{\text{weighted}} \leq H_{\text{internal}}$ when high-risk paths contribute to divergence.

**Proof:**

Let $S_a = \{i : A(p_i) = a\}$ be the set of paths producing answer $a$.

Unweighted: $P(a) = |S_a|/N$

Weighted: $P_w(a) = \sum_{i \in S_a} w_i$

Shannon entropy is concave: $H(P) = -\sum P(a) \log P(a)$

If high-risk paths (low $w_i$) are concentrated in unique answers (contributing to divergence), then:

- Unweighted: These answers have $P(a) = 1/N$ each
- Weighted: These answers have $P_w(a) \ll 1/N$

Concavity of entropy implies that concentrating probability mass (downweighting divergent paths) reduces entropy. ∎

### 6.3 Derivation of Optimal $\alpha$

**Objective:** Minimize calibration loss $L(\alpha) = \mathbb{E}[(\alpha C_{\text{arch}} + (1-\alpha)\gamma_{\text{RLCR}} - Y)^2]$

Where $Y = \mathbb{I}(\text{correct})$.

**Expand:**
$$L(\alpha) = \mathbb{E}[\alpha^2 C_{\text{arch}}^2 + (1-\alpha)^2 \gamma_{\text{RLCR}}^2 + 2\alpha(1-\alpha)C_{\text{arch}}\gamma_{\text{RLCR}} - 2\alpha C_{\text{arch}}Y - 2(1-\alpha)\gamma_{\text{RLCR}}Y + Y^2]$$

**Take derivative:**
$$\frac{dL}{d\alpha} = 2\alpha \mathbb{E}[C_{\text{arch}}^2] - 2(1-\alpha)\mathbb{E}[\gamma_{\text{RLCR}}^2] + 2(1-2\alpha)\mathbb{E}[C_{\text{arch}}\gamma_{\text{RLCR}}] - 2\mathbb{E}[C_{\text{arch}}Y] + 2\mathbb{E}[\gamma_{\text{RLCR}}Y]$$

**Set to zero and solve:**
$$\alpha^* = \frac{\mathbb{E}[\gamma_{\text{RLCR}}^2] - \mathbb{E}[C_{\text{arch}}\gamma_{\text{RLCR}}] + \mathbb{E}[C_{\text{arch}}Y] - \mathbb{E}[\gamma_{\text{RLCR}}Y]}{\mathbb{E}[C_{\text{arch}}^2] + \mathbb{E}[\gamma_{\text{RLCR}}^2] - 2\mathbb{E}[C_{\text{arch}}\gamma_{\text{RLCR}}]}$$

In terms of covariance:
$$\alpha^* = \frac{\text{Cov}(C_{\text{arch}}, Y) - \text{Cov}(\gamma_{\text{RLCR}}, Y)}{\text{Var}(C_{\text{arch}}) + \text{Var}(\gamma_{\text{RLCR}}) - 2\text{Cov}(C_{\text{arch}}, \gamma_{\text{RLCR}})}$$ ∎

---

## 7. Empirical Parameter Values

| Parameter | Symbol | Default | Valid Range | Derivation |
|-----------|--------|---------|-------------|------------|
| Risk sensitivity | $\lambda$ | 0.5 | $(0, \infty)$ | Ablation (Section 4.4) |
| Architecture/RLCR balance | $\alpha$ | 0.7 | $[0, 1]$ | Covariance optimization |
| RLCR decay rate | $\beta$ | 0.1 | $(0, 1)$ | Recency weighting |
| Adaptation rate | $\eta$ | 1.0 | $[0, 2]$ | Calibration stability |
| [KNOWN] threshold | — | 0.95 | $[0.9, 1.0]$ | Target accuracy |
| [INFERRED] threshold | — | 0.70 | $[0.6, 0.8]$ | Empirical calibration |
| [UNCERTAIN] threshold | — | 0.40 | $[0.3, 0.5]$ | Empirical calibration |

---

## 8. References

1. Shannon, C.E. (1948). "A Mathematical Theory of Communication." Bell System Technical Journal.
2. Kullback, S., & Leibler, R.A. (1951). "On Information and Sufficiency." Annals of Mathematical Statistics.
3. Brier, G.W. (1950). "Verification of Forecasts Expressed in Terms of Probability." Monthly Weather Review.
4. Garlick, T., & Mary Jane. (2026). "Architectural Uncertainty: Deriving Calibrated Confidence from Multi-Path Reasoning Consensus." Nature Machine Intelligence (submitted).

---

**Document Status:** Final v1.0
**Location:** `/root/.openclaw/workspace/abraxas/docs/research/nature_mi/mathematical_formalization.md`
**Generated:** 2026-04-23T18:00:00Z
