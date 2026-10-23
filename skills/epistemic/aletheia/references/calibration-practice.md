# Calibration Practice — Epistemic Foundations

## What Calibration Means

**Calibration** is the alignment between your confidence and reality.

When you say something is `[KNOWN]`, you are claiming 95%+ confidence. When you say something is `[UNCERTAIN]`, you are claiming 50% confidence. Calibration asks: **Did reality match your stated confidence?**

If you mark 100 things as `[KNOWN]` and 95 of them turn out to be true, you are perfectly calibrated on the `[KNOWN]` label. If only 80 are true, you are overconfident — you should have used `[INFERRED]` or `[UNCERTAIN]` instead.

---

## The Confidence Spectrum

The Janus System (and Aletheia) use four epistemic labels:

### [KNOWN]

**Meaning:** Sourced, verifiable, high confidence.

**Confidence level:** 95%+ that this is accurate.

**How to use:** Mark something `[KNOWN]` only when you have strong grounding — direct evidence, established facts, well-documented findings. Not "probably true" or "I'm pretty sure." *I know this.*

**Example:**
- `[KNOWN] Water boils at 100°C at sea level`
- `[KNOWN] The Civil Rights Act was signed in 1964`
- `[KNOWN] Photosynthesis occurs in chloroplasts`

**Calibration target:** >95% should be confirmed upon resolution.

**What over-confidence looks like:** You mark something `[KNOWN]` and it turns out you were wrong. If this happens more than 5% of the time, you are mislabeling or overconfident.

**What under-confidence looks like:** You mark something `[UNCERTAIN]` when you could have said `[KNOWN]`. This is conservative and safe; not a failure, but leaves information on the table.

### [INFERRED]

**Meaning:** Derived through clear reasoning from what is known. The chain is shown.

**Confidence level:** 70–85% that the inference is sound.

**How to use:** Mark something `[INFERRED]` when you have good logical or empirical grounds but not direct evidence. You are reasoning *from* what is known *to* what likely follows.

**Example:**
- `[INFERRED] If interest rates rise 0.5%, mortgage applications will decrease` (reasoning: economic principle → prediction)
- `[INFERRED] The protein's active site contains a zinc ion` (reasoning: mass spec data + homology → conclusion)
- `[INFERRED] Teams with psychological safety have higher retention` (reasoning: prior studies + logical mechanism → prediction)

**Calibration target:** 70–85% should be confirmed upon resolution.

**What well-calibrated looks like:** Of 100 inferences you make, 70–85 are confirmed, 15–30 are disconfirmed, and a few are superseded. This is healthy.

**What poorly-calibrated looks like:** 95%+ of your inferences confirm. This suggests you are either (a) only inferring things that are very likely true (overly conservative), or (b) confirming your priors rather than checking evidence (confirmation bias).

### [UNCERTAIN]

**Meaning:** Relevant but not fully verifiable. Confidence is partial. Uncertainty is named explicitly.

**Confidence level:** 40–70% that this is accurate (or genuinely unknown).

**How to use:** Mark something `[UNCERTAIN]` when you have partial information, conflicting signals, or genuine unknowns. You are not ignoring the question; you are being honest about the limits of your knowledge.

**Example:**
- `[UNCERTAIN] Whether remote work will remain >30% of jobs through 2027` (some data suggests yes; some suggests no; depends on company policy)
- `[UNCERTAIN] Whether LLM scaling will plateau by 2026` (plausible; not established; depends on discoveries not yet made)
- `[UNCERTAIN] Whether this patient's symptoms indicate condition A or condition B` (both fit; requires more tests)

**Calibration target:** 40–70% should be confirmed. **High disconfirmation is expected and healthy.**

**What well-calibrated looks like:** Of 100 uncertain claims you make, 40–70 are confirmed, 25–50 are disconfirmed, and a few are superseded. The high disconfirmation rate is *correct* — you were appropriately uncertain.

**What poorly-calibrated looks like:** 95%+ of your uncertain claims confirm. This means you were mislabeling — things you called "uncertain" were actually `[KNOWN]` or `[INFERRED]`. You were not being genuinely uncertain; you were just hedging.

### [UNKNOWN]

**Meaning:** I do not know this. I will not fabricate an answer.

**Confidence level:** 0% because you are not making a claim.

**How to use:** Mark something `[UNKNOWN]` when the question is outside your grounding or the answer truly is unknowable. `[UNKNOWN]` is a complete and valid response. Silence is permitted. Confabulation is not.

**Example:**
- `[UNKNOWN] The exact number of transistors in the current model's weights`
- `[UNKNOWN] What will happen if humans discover the theory of everything`
- `[UNKNOWN] The names of all people who will read this document`

**Calibration target:** `[UNKNOWN]` is not accuracy-scored. These claims remain open indefinitely.

**What it means when you later resolve an `[UNKNOWN]`:** If you later learn something about a topic you marked `[UNKNOWN]`, that is noteworthy. You have moved from "I don't know" to "I learned something." Mark the resolution and note what you learned.

**Pattern:** When `[UNKNOWN]` claims are later resolved, they typically show high disconfirmation rates (60–80% disconfirmed). This is because `[UNKNOWN]` means you had no basis to predict; when you finally learn the answer, it often surprises you.

---

## Calibration Drift

Over time, your calibration can drift. Three common patterns:

### Pattern 1: Overconfidence Creeping In

**Signal:** Your confirmation rate on `[INFERRED]` rises from 75% to 88% over three months.

**Interpretation:** You are becoming more confident. This might be fine (you are learning), or it might be overconfidence (you are checking less rigorously).

**Diagnosis:**
- Look at recent disconfirmations. Are they from high-uncertainty domains or low-uncertainty ones?
- If you are disconfirming less frequently on `[UNCERTAIN]` claims, this is a warning sign.
- Check: Are you only inferring things that are likely true, or are you inferring things broadly?

**Remedy:**
- Deliberately resolve some older `[UNCERTAIN]` claims. High disconfirmation is healthy.
- If disconfirmation rate is dropping, be more cautious in your next round of labeling.

### Pattern 2: Overcautiousness (Under-Confidence)

**Signal:** Everything is getting labeled `[UNCERTAIN]`. Your `[KNOWN]` labels have dropped by 50%.

**Interpretation:** You are being extremely cautious, hedging everything. This is safer (lower disconfirmation) but leaves information on the table.

**Diagnosis:**
- Are recent `[UNCERTAIN]` claims actually being confirmed at high rates (80%+)?
- If so, you were mislabeling — those were really `[KNOWN]` or `[INFERRED]`.

**Remedy:**
- Review recent high-confirming `[UNCERTAIN]` claims. Reclassify them mentally for next time.
- Be more decisive. `[KNOWN]` is appropriate when you actually know.

### Pattern 3: Confirmation Bias

**Signal:** Your overall confirmation rate is 95%+ across all label types.

**Interpretation:** You are confirming your priors rather than checking evidence. This is the most dangerous drift.

**Diagnosis:**
- All label types show 95%+ confirmation = statistically implausible across the board
- Likely: You are marking things confirmed when they are ambiguous; or you are only resolving claims you are pretty sure you were right about (ignoring disconfirmations)

**Remedy:**
- Deliberately seek out disconfirmations. What was I wrong about?
- When resolving, be strict about what counts as "confirmed." Partial matches = disconfirmed.
- Audit recent resolutions for bias.

---

## How to Interpret the Calibration Report

When you run `/aletheia calibration`, you get a report like this:

```
[KNOWN] Claims — Expected: >95% confirmed
  ✓ Confirmed: 56 (86%)
  ✗ Disconfirmed: 7 (11%)
  ⟳ Superseded: 2 (3%)
  Accuracy: 86% [CAUTION: Below expected threshold]
  Trend: Declining (was 92% at 60-day mark)
  Confidence bias risk: MEDIUM — unexpected disconfirmation rate
```

**What this means:**

- **Confirmed 86%:** Of the [KNOWN] claims you made and then resolved, 86% turned out to be true. This is below the 95%+ target.
- **Disconfirmed 11%:** 11% of your [KNOWN] claims were wrong. This is higher than the 1–5% you should expect.
- **Caution flag:** The system is warning you that your [KNOWN] confidence is not justified.
- **Trend declining:** Your accuracy has dropped from 92% to 86% over the last 60 days. This is a warning sign.

**Questions to ask:**

1. Are the disconfirmations from domains where I actually should be less confident?
   - If yes: You are learning appropriately. Keep going.
   - If no: Your [KNOWN] label is too broad. Be more selective.

2. Are the disconfirmations trivial misses (off by a detail) or real failures (I was completely wrong)?
   - If trivial: Maybe you were borderline [KNOWN]/[INFERRED]. Recalibrate the boundary.
   - If real: Your grounding for [KNOWN] labels is weak. Tighten it.

3. Am I only resolving claims I am confident I got right?
   - If yes: You are exhibiting confirmation bias. Deliberately resolve some claims you are uncertain about.
   - If no: Your disconfirmation rate is genuine; learn from it.

---

## Calibration Theater Prevention

The biggest risk with any calibration system is *calibration theater* — the appearance of calibration without the substance.

### Theater Pattern 1: Only Resolving Confirmations

**The trap:** You resolve the claims you were right about and ignore the ones you were wrong about. Result: 99% confirmation rate!

**The red flag:** Your confirmation rate is implausibly high (>95% for all label types).

**Aletheia's defense:** The audit report explicitly flags this. If your overall confirmation > 95%, you get a warning: "Possible confirmation bias."

**Your job:** Be honest. When you resolve, resolve a representative sample of claims — not just the ones you got right.

### Theater Pattern 2: Mislabeling to Inflate Accuracy

**The trap:** You mark everything `[UNCERTAIN]`, and then most things confirm (because you were being so cautious). Result: You look "calibrated" by the numbers.

**The red flag:** Your [UNCERTAIN] confirmation rate is 80%+ (should be 40–70%).

**Aletheia's defense:** The calibration report shows this as an anomaly: "[UNCERTAIN] confirmation above expected."

**Your job:** Don't mislabel. If you marked something [UNCERTAIN] but it confirmed at 90%, that was mislabeling — next time, mark it [KNOWN] or [INFERRED].

### Theater Pattern 3: Shifting Labels After the Fact

**The trap:** You mark something [KNOWN], it disconfirms, and then you say "I never meant [KNOWN], I meant [INFERRED]."

**The red flag:** Your labels in resolutions.md don't match the original ledger entry.

**Aletheia's defense:** Resolutions are keyed to the original ledger entry. You cannot change the label retroactively.

**Your job:** Own your labels. If you mislabeled, note it in the resolution narrative, but the original label stands.

---

## Calibration at Different Time Scales

### Short-term Calibration (Days to Weeks)

With <20 resolved claims, trends are mostly noise. The calibration report will say so.

**Use:** Get familiar with your labeling patterns. Start noticing if there are obvious discrepancies (e.g., all [INFERRED] claims disconfirm).

**Don't:** Treat short-term trends as significant. You need statistical power.

### Medium-term Calibration (Months)

With 50–200 resolved claims, patterns start to emerge.

**Use:** Identify systematic biases (e.g., "I'm consistently overconfident on technology predictions").

**Action:** Adjust your labeling for future claims. If you are overconfident on tech, drop your next round of tech predictions from [KNOWN] to [INFERRED].

### Long-term Calibration (6 Months to Years)

With 500+ resolved claims, you have strong signal. Trends are meaningful.

**Use:** Build a personal calibration model. "In my experience, I am 80% accurate on [INFERRED] claims about markets, but only 60% accurate about technology timelines."

**Action:** Use this self-knowledge in future labeling. Adjust confidence by domain.

---

## Calibration Across Domains

Different domains have different baselines:

### High-Confidence Domains

Where [KNOWN] labels should be very accurate (>95%):
- Basic mathematics and logic
- Well-established physical laws
- Historical facts with good documentation
- Medical contraindications (well-studied conditions)

### Medium-Confidence Domains

Where [INFERRED] labels should be 70–85% accurate:
- Economics and policy effects
- Technology timelines and capabilities
- Population-level behavior predictions
- Scientific hypotheses (plausible but not proven)

### Low-Confidence Domains

Where [UNCERTAIN] is appropriate and disconfirmation is common:
- Long-term technology adoption (>5 years out)
- Political outcomes
- Individual behavior prediction
- Emerging scientific frontiers
- Speculative futures

**Calibration insight:** If your [INFERRED] accuracy varies wildly by domain (95% on markets, 50% on tech), you might be mislabeling in one domain. Either your tech predictions are actually less certain (should be [UNCERTAIN]), or your market predictions are actually more certain (should be more of them [KNOWN]).

---

## Common Calibration Errors

### Error 1: Confusing [KNOWN] with "I'm Pretty Sure"

**Mistake:** Marking something [KNOWN] with 80% confidence, thinking "pretty sure" = known.

**Correction:** [KNOWN] means 95%+. If you are 80% confident, use [INFERRED].

### Error 2: Using [UNCERTAIN] as a Hedge

**Mistake:** "I'll mark this [UNCERTAIN] so I can't be wrong either way."

**Correction:** [UNCERTAIN] is a specific claim about your confidence (40–70%), not a cop-out. If you actually know with 90% confidence, say [KNOWN] or [INFERRED].

### Error 3: Not Tracking [UNKNOWN]

**Mistake:** Marking things [UNKNOWN] but never resolving them. The point of [UNKNOWN] is to track what you didn't know, then learn later.

**Correction:** Resolve [UNKNOWN] claims when you do learn the answer. This is the most interesting data.

### Error 4: Conflating "Unique" with "Uncertain"

**Mistake:** Marking something [UNCERTAIN] because it is unusual or novel, not because your confidence is actually 50%.

**Correction:** Unusualness and confidence are independent. A novel thing can still be [KNOWN] if you have good grounding.

---

## Calibration as Practice

Calibration is not a destination; it is a practice.

The goal is not to achieve 100% accuracy (impossible). The goal is to:

1. **Know what you know** — [KNOWN] claims should be very accurate
2. **Know what you don't know** — [UNKNOWN] should be frequent when appropriate
3. **Know your limits** — [UNCERTAIN] should reflect genuine uncertainty, not hedging
4. **Learn from feedback** — Track calibration over time and adjust your labeling accordingly

Each resolution you record is a data point in your epistemic practice. Aletheia's job is to make that data visible.

Your job is to learn from it.

