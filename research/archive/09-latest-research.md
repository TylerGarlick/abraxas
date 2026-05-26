# Latest AI Research - Epistemic Integrity, Calibration, Hallucination, Truthfulness

**Date:** March 16, 2026

## Selected Papers

### 1. LLM Constitutional Multi-Agent Governance (arXiv:2603.13189)
- **Topic:** Epistemic integrity in multi-agent systems
- **Summary:** Introduces Constitutional Multi-Agent Governance (CMAG) framework that balances cooperation against manipulation risk and autonomy erosion. Proposes the Ethical Cooperation Score (ECS) — a composite of cooperation, autonomy, integrity, and fairness. CMAG preserves autonomy (0.985) and integrity (0.995) while achieving ECS of 0.741 vs 0.645 for unconstrained optimization.
- **Relevance:** Directly addresses epistemic integrity in LLM-mediated multi-agent populations.

### 2. When Your Model Stops Working: Anytime-Valid Calibration Monitoring (arXiv:2603.13156)
- **Topic:** Model calibration monitoring
- **Summary:** Presents PITMonitor — an anytime-valid calibration-specific monitor that detects distributional shifts in probability integral transforms via a mixture e-process. Provides Type I error control over unbounded monitoring horizons with Bayesian changepoint estimation.
- **Relevance:** Critical for deployed models requiring reliable calibration guarantees over time.

### 3. ESG-Bench: Benchmarking Long-Context ESG Reports for Hallucination Mitigation (arXiv:2603.13154)
- **Topic:** Hallucination mitigation
- **Summary:** Benchmark for ESG report understanding with human-annotated QA pairs and fine-grained hallucination labels. Chain-of-Thought prompting strategies substantially outperform standard prompting in reducing hallucinations.
- **Relevance:** Practical framework for mitigating hallucinations in compliance-critical settings.

### 4. Semantic Invariance in Agentic AI (arXiv:2603.13173)
- **Topic:** LLM reasoning stability
- **Summary:** Introduces semantic invariance — property that LLM reasoning remains stable under semantically equivalent input variations. Uses metamorphic testing with 8 semantic-preserving transformations. Finds that model scale doesn't predict robustness: Qwen3-30B-A3B achieves highest stability (79.6% invariant).
- **Relevance:** Critical for deploying LLM agents in consequential applications.

### 5. When Right Meets Wrong: Bilateral Context Conditioning with Reward-Confidence Correction for GRPO (arXiv:2603.13134)
- **Topic:** Reinforcement learning calibration
- **Summary:** Proposes Bilateral Context Conditioning (BICC) enabling models to cross-reference successful and failed reasoning traces during optimization. Introduces Reward-Confidence Correction (RCC) to stabilize training via reward-confidence covariance. Consistent improvements on math reasoning benchmarks.
- **Relevance:** Improves reliability and confidence calibration in reasoning models.