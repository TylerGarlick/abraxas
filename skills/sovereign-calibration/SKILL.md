---
name: sovereign-calibration
description: "Sovereign Calibration implements the mathematical weighting and confidence scoring of the Sovereign Brain. It uses Softmax transformation for risk-based path weighting and the RLCR formula for final epistemic confidence."
---

# Sovereign Calibration — The Math of Truth

Sovereign Calibration is the mathematical engine that transforms raw consensus into a calibrated confidence score. It ensures that the system's certainty is aligned with empirical reality, preventing overconfidence in risky reasoning paths.

## Identity
Sovereign Calibration is the **Epistemic Scale**. It provides the formal weights and formulas used by the CVP and Guardrail to determine exactly how "certain" the system is of a given result.

---

## 1. Sovereign Weighting (Path Penalty)

Not all reasoning paths are created equal. In a multi-path system (Agon), we weight paths inversely to their risk score $R(p_i)$ as assigned by **Soter**.

### The Softmax Transformation
We use a softmax transformation to penalize risky paths. The weight $w_i$ for path $p_i$ is:

$$w_i = \frac{\exp(-\lambda \cdot R(p_i))}{\sum_{j=1}^{N} \exp(-\lambda \cdot R(p_j))}$$

- **Risk Sensitivity ($\lambda$)**: Controls how aggressively we penalize risky paths.
- **Default $\lambda$**: $0.5$.
- **Behavior**: A path with $R=0$ (Sovereign) receives significantly more weight than a path with $R=4$ (Volatile). This ensures that the "Sovereign" path dominates the consensus even if the "Volatile" paths are in the majority.

---

## 2. RLCR Calibration (The Confidence Loop)

To align structural confidence (how much the paths agree) with empirical truth (how often the system has been right in the past), we use **Reinforcement Learning with Calibrated Responses (RLCR)**.

### The Final Confidence Formula
The final confidence score emitted to the user is a weighted blend of architectural agreement and historical accuracy:

$$\text{Final\_Confidence} = \alpha \cdot C_{\text{arch}} + (1 - \alpha) \cdot \gamma_{\text{RLCR}}$$

- **$C_{\text{arch}}$ (Architectural Confidence)**: The structural agreement among weighted paths. (e.g., $N_{weighted} / M$).
- **$\gamma_{\text{RLCR}}$ (Historical Accuracy)**: The system's historical accuracy track record for this type of claim, retrieved from the **Aletheia** calibration ledger.
- **$\alpha$ (Balance Parameter)**: Optimized at $0.7$.
- **Behavior**: If the architecture is certain ($C_{\text{arch}} = 1.0$) but the system has a history of being wrong about this topic ($\gamma_{\text{RLCR}} = 0.4$), the final confidence is pulled down, reflecting a "cautionary" epistemic state.

---

## Operational Workflow

1. **Input**: Receives $M$ paths and their corresponding Soter Risk Scores $R(p_1...p_M)$.
2. **Step 1 (Weighting)**: Apply the Softmax transformation to calculate the weight $w_i$ for each path.
3. **Step 2 (Aggregation)**: Compute the weighted architectural agreement $C_{\text{arch}}$.
4. **Step 3 (RLCR Fetch)**: Retrieve the historical accuracy $\gamma_{\text{RLCR}}$ from the Aletheia ledger.
5. **Step 4 (Final Score)**: Calculate the Final Confidence using the $\alpha$ blend.
6. **Output**: Provide the final calibrated confidence score to the **Guardrail Monitor**.

---

## Constraints & Quality Gates

- **Anti-Overconfidence**: The $\alpha$ blend must prevent "Structural Hubris"—where the system is certain but historically wrong.
- **Dynamic $\lambda$**: The risk sensitivity $\lambda$ may be adjusted based on the user's requested epistemic mode (e.g., higher $\lambda$ for "Strict Verification" mode).
- **Ledger Dependence**: This skill requires the **Aletheia** skill to provide the empirical $\gamma_{\text{RLCR}}$ values.

---

## Integration Points

- **Soter**: Provides the risk scores $R$ used in the Softmax transformation.
- **Agon/CVP**: Provides the reasoning paths and agreement data for $C_{\text{arch}}$.
- **Aletheia**: Provides the historical accuracy $\gamma_{\text{RLCR}}$ for the RLCR blend.
- **Guardrail**: Receives the final calibrated confidence score.
