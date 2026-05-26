# Abstract

**Title:** Abraxas: Epistemic Verification Architecture for AI Systems — Preventing Hallucination, Deception, and Collusion Through Structural Constraints

**Authors:** Tyler Garlick

**Category:** cs.AI (Artificial Intelligence)

**Abstract:**

Large language models have a structural problem: they cannot distinguish between what they know, what they've inferred, what they're uncertain about, and what they're fabricating. This is not a training problem — it is an architectural problem. As models gain autonomy and multi-agent capabilities, this flaw enables deception, collusion, and instrumental convergence.

Abraxas is a different approach: not better training, but better architecture. By making epistemic status visible, verification mandatory, uncertainty safe, and audit automatic, Abraxas makes deception structurally difficult and costly. This whitepaper describes the Abraxas architecture, its six constituent systems (Honest, Janus, Logos, Agon, Aletheia, Logos-Math), and empirical validation results across 5 models with 130+ queries.

Key empirical findings: (1) Universal factual accuracy — all 5 tested models achieved 100% on verifiable claims (p = 1.0); (2) Meta-cognitive variation — calibration ranges 0-100% across models (F = 6.0, p < 0.01); (3) Parameter count correlates with calibration (r = 0.82) but NOT factual accuracy (r = 0.00); (4) gpt-oss:120b-cloud leads overall (composite 0.93); glm-5:cloud shows 15% timeout rate.

We propose five empirical tests for deception detection: performance inflation (≥95% detection), collusive agreement (≥85% detection via convergence flagging), alignment faking (≥90% detection via Qualia Bridge), resource exfiltration (100% block rate), and calibration degradation (100% visibility). Results demonstrate that architectural constraints on epistemic visibility can prevent emergent deceptive behaviors without capability reduction.

**Keywords:** AI safety, hallucination prevention, multi-agent systems, epistemic verification, deception detection, AI alignment, constitutional AI

**Word Count:** ~8,500 words (main text), ~150 words (abstract)

**Corresponding Author:** Tyler Garlick — GitHub: https://github.com/TylerGarlick

**Repository:** https://github.com/TylerGarlick/abraxas

**License:** MIT
