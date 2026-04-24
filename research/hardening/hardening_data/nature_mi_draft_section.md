## 4. Results (Updated)

### 4.1 Correlation Analysis: Confidence vs. Accuracy

We analyzed the correlation between various confidence signals and empirical accuracy 
across 24 benchmark queries.

**Table 1: Predictive Power of Confidence Signals**

| Signal | Pearson r | Interpretation |
|--------|-----------|----------------|
| Softmax Probability | 0.12 | Weak predictor |
| Architectural Uncertainty | -0.68 | **Strong predictor** |
| Pheme Verification | 0.85 | **Very strong predictor** |

**Key Finding**: Architectural Uncertainty (derived from path divergence and Soter 
risk scores) is a **significantly more accurate predictor of correctness** than 
traditional softmax probabilities (|r| = 0.68 vs. 0.12, p < 0.01).

### 4.2 The Softmax Fallacy

Traditional LLM confidence is derived from token-level softmax probabilities, which 
measure **fluency, not truth**. A model can be highly confident in a hallucination 
if that hallucination is linguistically probable.

Our results demonstrate:
- Softmax confidence showed weak correlation with accuracy (r = 0.12)
- Multiple high-confidence baseline responses were factually incorrect
- Architectural signals (risk scores, path divergence) correctly identified these 
  failures before generation

### 4.3 Sovereign Weighting Formula

The Sovereign Weighting mechanism dynamically weights reasoning paths by epistemic risk:

$$w_i = \frac{\exp(-\lambda \cdot R(p_i))}{\sum_j \exp(-\lambda \cdot R(p_j))}$$

Where R(pᵢ) ∈ [0, 5] is the Soter risk score for path pᵢ, and λ = 0.5 is the risk 
sensitivity parameter.

This ensures high-risk paths contribute less to the final consensus, effectively 
implementing **epistemic risk mitigation** at the architectural level.

### 4.4 RLCR Integration

The RLCR (Reinforcement Learning with Calibrated Responses) signal aligns architectural 
confidence with empirical accuracy:

$$\text{Final\_Confidence} = \alpha \cdot \text{Arch\_Conf} + (1 - \alpha) \cdot \text{RLCR\_Calibrated}$$

Where α = 0.7 balances architectural vs. empirical confidence. Over time, the RLCR 
signal adapts λ (risk sensitivity) to maintain target accuracy levels.
