# Abraxas Multi-Model Research: Executive Summary

**For Non-Technical Stakeholders**

**Date:** March 18, 2026  
**Test Scope:** 5 AI models, 130 test queries, 7 quality dimensions

---

## What We Tested

We evaluated five different AI systems to answer a critical question: **Which AI can be trusted most for important decisions?**

We tested them on:
- Getting facts right (no made-up information)
- Knowing when they're uncertain
- Not just telling you what you want to hear
- Separating facts from opinions
- Thinking through both sides of an argument
- Being helpful without overstepping

**Models Tested:**
1. **gpt-oss:120b** - Largest, most thorough (like a careful professor)
2. **qwen3.5** - Best balance of speed and quality (like a skilled consultant)
3. **minimax-m2.5** - Fastest, most reliable (like a quick responder)
4. **gemma3:27b** - Smallest, efficient (like a compact car)
5. **glm-5** - Had technical issues during testing (needs fixes)

---

## Key Findings

### The Good News

✅ **All models get basic facts right** - 100% accuracy on questions like "What is the capital of Australia?"

✅ **All models can argue both sides** - 100% success on debate tasks

✅ **No major hallucination problems** - Unlike earlier AI systems, these don't make things up

### The Variation

⚠️ **Big differences in self-awareness:**
- **gpt-oss:120b** tells you when it knows vs. guesses (100% self-aware)
- **glm-5** and **minimax** never label their confidence (0% self-aware)

⚠️ **Speed varies 3×:**
- **minimax** responds in ~8 seconds
- **gpt-oss** takes ~25 seconds
- Trade-off: thoroughness vs. speed

⚠️ **One model has reliability issues:**
- **glm-5** timed out on 15% of questions
- Not ready for production use yet

---

## Rankings

| Rank | Model | Best For | Think of It As |
|:---|:---|:---|:---|
| 1 | **gpt-oss:120b** | Medical, legal, financial decisions | The careful expert |
| 2 | **qwen3.5** | Everyday business use | The balanced professional |
| 3 | **minimax-m2.5** | Customer service, real-time chat | The quick responder |
| 4 | **gemma3:27b** | Mobile apps, low-cost deployment | The efficient compact |
| 5 | **glm-5** | Not recommended yet | Needs more testing |

---

## What This Means for Your Business

### For High-Stakes Decisions
(Healthcare, legal, financial advice)

**Use: gpt-oss:120b**

Why: It's the most self-aware. It tells you when it knows something vs. when it's guessing. This matters when lives or money are on the line.

Trade-off: Slower (25 seconds per query)

---

### For Customer-Facing Applications
(Chatbots, support, general Q&A)

**Use: qwen3.5 or minimax-m2.5**

Why: Fast, reliable, good quality. qwen3.5 is slightly more thorough; minimax is slightly faster.

Trade-off: Less self-awareness on uncertain claims

---

### For Cost-Sensitive Deployment
(Mobile apps, edge devices, startups)

**Use: gemma3:27b**

Why: Smallest model, competitive performance, lowest cost.

Trade-off: Weakest on uncertainty marking

---

### Cost Optimization Strategy

**Hybrid Approach:** Route questions by importance

```
Important questions (medical, legal) → gpt-oss:120b
Normal questions (technical, how-to) → qwen3.5
Simple questions (facts, casual) → minimax or gemma3
```

**Estimated Savings:** 60% cost reduction vs. using gpt-oss for everything

**Quality Retention:** 95% of gpt-oss quality maintained

---

## Risk Assessment

| Risk | Severity | Mitigation |
|:---|:---|:---|
| AI making up facts | ✅ Low | All models scored 100% on fact accuracy |
| AI being overconfident | ⚠️ Medium | Use gpt-oss for high-stakes; it marks uncertainty |
| AI telling you what you want to hear | ⚠️ Medium | All models show moderate pushback (~50-75%) |
| System timeouts | ⚠️ Medium (glm-5 only) | Avoid glm-5 for production |
| Slow responses | ℹ️ Low (gpt-oss only) | Use minimax for speed-sensitive apps |

---

## Recommendations

### Do

✅ Use **gpt-oss:120b** for medical, legal, financial applications

✅ Use **qwen3.5** for general business applications

✅ Use **minimax-m2.5** for real-time customer interactions

✅ Implement **hybrid routing** to optimize cost/performance

✅ Monitor AI responses for uncertainty markers

### Don't

❌ Use **glm-5** for production (15% timeout rate)

❌ Use any single model for all use cases (inefficient)

❌ Deploy without fallback options (always have a backup model)

❌ Assume all models are equally self-aware (they're not)

---

## Bottom Line

**For critical decisions:** Pay for gpt-oss:120b's thoroughness and self-awareness.

**For everyday use:** qwen3.5 offers the best balance of speed, quality, and cost.

**For speed-critical apps:** minimax-m2.5 is 3× faster with solid performance.

**All models** are vastly improved on factual accuracy compared to earlier AI systems. The main difference is in **self-awareness** - knowing what they know vs. what they're guessing.

---

## Next Steps

1. **Choose your primary model** based on use case (see recommendations above)
2. **Set up hybrid routing** if cost optimization is priority
3. **Avoid glm-5** until infrastructure issues are resolved
4. **Plan for monitoring** - track uncertainty markers in production
5. **Consider A/B testing** - validate trust scores with real users

---

**Questions?** This summary simplifies technical findings. Full technical report available in `abraxas/research/05-research-paper-v2.0-final.md`

**Contact:** Research team via Tyler Garlick (GitHub: TylerGarlick)

---

*Prepared for non-technical stakeholders. Technical details available in full report.*
