# Resolution Workflow — Common Patterns

This reference provides step-by-step workflows for common resolution scenarios.

---

## Workflow 1: Resolving Claims from Today's Session

**Scenario:** You just closed a Janus session. You made labeled claims during the session, and you want to resolve some of them immediately (or soon after, when context is fresh).

**Steps:**

1. **Gather the claims**
   ```
   /aletheia status
   ```
   This shows unresolved claims from this session. Copy one to your clipboard.

2. **Confirm or disconfirm**
   ```
   /aletheia confirm "claim text"
   ```
   If the claim was wrong:
   ```
   /aletheia disconfirm "claim text"
   ```
   System prompts for the correct answer.

3. **Add optional context**
   - When prompted "Resolution note (optional):", add 1–2 sentences explaining why or what changed.
   - Example: "Confirmed by the data release this morning."
   - Or leave blank and press Enter to skip.

4. **Repeat for other claims**
   ```
   /aletheia confirm "next claim"
   ```

**Duration:** 30 seconds per claim.

**When to do this:** Immediately or within a few hours, while context is fresh. You remember why you made the claim; you know what evidence would confirm or disconfirm it.

**Why it matters:** Claims resolved soon after they are made are more reliable — you have strong context. Long-delayed resolutions (months later) may have faded context.

---

## Workflow 2: Resolving a Forecast or Prediction

**Scenario:** Two months ago, you labeled: `[INFERRED] "AI regulation will pass in the EU by Q3 2026"`. Now it is Q3 2026. You want to resolve it.

**Steps:**

1. **Find the claim**
   ```
   /aletheia queue [INFERRED]
   ```
   Scan the list for your regulation claim. If not visible, search directly:
   ```
   /aletheia confirm "AI regulation will pass in the EU by Q3 2026"
   ```

2. **Determine the outcome**
   - Did regulation pass? Confirm.
   - Did it not pass? Disconfirm and provide the actual outcome.
   - Did it partially pass (close but not quite)? Disconfirm and note the partial success.

3. **Provide the resolution narrative**
   ```
   Resolution: disconfirmed
   Actual finding: "Regulation delayed to Q4 2026; draft approved but not yet voted on"
   ```

4. **Add optional evidence link**
   - Example: "See EU Parliament press release, Sept 15 2026"

**Duration:** 1–2 minutes.

**Common mistake:** Treating "close" as "confirmed." Only confirm if the claim actually happened. Partial success = disconfirmed + narrative explaining why.

**Why it matters:** Forecasts are your calibration training ground. Track them rigorously.

---

## Workflow 3: Resolving [UNKNOWN] When You Learn the Answer

**Scenario:** Four months ago: `[UNKNOWN] "What will be the cost of training GPT-7 when released?"`. Now GPT-7 has been released. You've read reports. You now have an answer.

**Steps:**

1. **Find the [UNKNOWN] claim**
   ```
   /aletheia queue [UNKNOWN]
   ```

2. **Resolve it**
   ```
   /aletheia confirm "What will be the cost of training GPT-7 when released?"
   ```
   Status: confirmed or disconfirmed?
   - If you predicted the cost would be high and it was high: confirm
   - If you predicted the cost would be high but it was low: disconfirm
   - But wait — you marked it [UNKNOWN], meaning you made NO prediction

3. **Special case: Pure [UNKNOWN]**
   If you actually marked it [UNKNOWN] and made no specific claim, you cannot confirm/disconfirm it in the traditional sense. Instead:
   ```
   /aletheia supersede "What will be the cost of training GPT-7 when released?"
   ```
   Supersede to: "Actual cost was $X million; this was higher/lower than industry expectations."

**Duration:** 1–2 minutes.

**Why it matters:** Resolving [UNKNOWN] claims shows what you didn't know and then learned. This is valuable feedback.

**Special insight:** [UNKNOWN] resolutions often show high disconfirmation rates. When you learn the answer to something you were genuinely uncertain about, the answer often surprises you. This is normal and healthy.

---

## Workflow 4: Tracking Confidence Drift on a Topic

**Scenario:** Over three months, you made five different claims about LLM scaling. Some were [KNOWN], some [INFERRED], some [UNCERTAIN]. You want to see if your confidence shifted and whether it was justified.

**Steps:**

1. **List all unresolved claims on this topic**
   ```
   /aletheia queue [INFERRED]
   ```
   (You may have to scan manually for "LLM scaling" related claims.)

2. **Resolve them all**
   Go through each claim and mark it confirmed/disconfirmed/superseded.

3. **Run the calibration report**
   ```
   /aletheia calibration
   ```

4. **Examine the [INFERRED] section**
   - If your LLM scaling predictions are 85% confirmed: You were well-calibrated.
   - If they are 50% confirmed: You were overconfident; dial it back next time.
   - If they are 95% confirmed: You were under-confident; be more assertive next time.

**Duration:** 15–30 minutes for a full review.

**Follow-up:** Based on what you learned, adjust your confidence on similar topics going forward.

---

## Workflow 5: Responding to a Disconfirmation

**Scenario:** You resolved three claims and two were disconfirmed. You want to understand what went wrong.

**Steps:**

1. **List recent disconfirmations**
   ```
   /aletheia queue [UNCERTAIN]
   ```
   Filter by resolution status = "disconfirmed"

2. **Review the narrative**
   Read the resolution note. Why did you initially predict X, and why did Y actually happen?

3. **Categorize the failure**
   - Reasoning error? (I applied logic incorrectly)
   - Information gap? (I was missing data)
   - Black swan? (Something unexpected happened)
   - Mislabeling? (I should have been more uncertain)

4. **Extract the lesson**
   - If reasoning error: What should I think differently next time?
   - If information gap: What information should I seek?
   - If black swan: Nothing to learn; accept uncertainty.
   - If mislabeling: Lower confidence on similar claims next time.

**Duration:** 10–15 minutes per disconfirmation.

**Psychological note:** Disconfirmations are the most valuable learning opportunities. They show where your model of reality is wrong. Lean into them.

---

## Workflow 6: Superseding a Claim (Context Changed)

**Scenario:** You made: `[KNOWN] "Best programming language for backend is Python"`. Six months later, you have learned more. Python is still good, but Go is now dominant for your use case. You don't want to call the original claim "wrong"; you want to call it "outdated."

**Steps:**

1. **Find the claim**
   ```
   /aletheia queue [KNOWN]
   ```

2. **Mark it superseded**
   ```
   /aletheia supersede "Best programming language for backend is Python"
   ```

3. **Provide the superseding claim**
   ```
   Superseded by: "Best programming language for backend (2026): Go for production systems; Python for data/research"
   ```

4. **Add context**
   ```
   Reason: "Community consensus and adoption shifted; Go ecosystem matured significantly"
   ```

**Output:**

```
⟳ Superseded: "[KNOWN] Best programming language for backend is Python"
  Superseded by: "Best programming language for backend (2026): Go for production systems; Python for data/research"
  Resolution date: 2026-03-10
  Context: "Community consensus and adoption shifted; Go ecosystem matured significantly"

Entry written to ~/.janus/resolutions.md
```

**Duration:** 2–3 minutes.

**Why supersede instead of disconfirm?** Because the original claim wasn't *false* — it was appropriate at the time. The context changed. Supersession preserves that nuance.

---

## Workflow 7: Batch Resolution Session

**Scenario:** You have not resolved claims in weeks. You have 30+ unresolved [INFERRED] claims. You want to do a bulk resolution pass.

**Steps:**

1. **Set aside time**
   This will take 30–60 minutes. Do it when you have focus.

2. **Start with the oldest**
   ```
   /aletheia queue [INFERRED]
   ```
   The oldest claims are listed first. Start there (they have waited longest).

3. **Resolve one by one**
   For each claim, spend 30 seconds deciding: confirmed, disconfirmed, or superseded?
   ```
   /aletheia confirm "claim 1"
   /aletheia disconfirm "claim 2"
   /aletheia supersede "claim 3" "new version"
   ```

4. **After 10–15 resolutions, take a break**
   Decision fatigue is real.

5. **When finished, run calibration**
   ```
   /aletheia calibration
   ```
   See what you learned.

**Duration:** 1–2 hours for a 30-claim batch.

**Pro tip:** Keep your notes from when you made the claims. They will help you remember context.

---

## Workflow 8: Audit and Cleanup

**Scenario:** You have been using Aletheia for months. You want to check for data integrity and clean up any orphaned or corrupted entries.

**Steps:**

1. **Run audit**
   ```
   /aletheia audit
   ```

2. **Review findings**
   - Orphaned resolutions?
   - Resolution conflicts?
   - Format issues?

3. **Fix orphans (if any)**
   ```
   /aletheia audit --remove-orphans
   ```
   (This backs up the file first.)

4. **Review conflicts**
   For each conflict, examine the two resolutions:
   - Are they truly contradictory? (Same claim marked confirmed and disconfirmed)
   - If yes, add a note explaining why your belief changed.
   - If no, they are just different claims with similar text.

5. **Re-run audit to confirm**
   ```
   /aletheia audit
   ```
   Should show "Status: HEALTHY" now.

**Duration:** 10–20 minutes.

**When to do this:** Every 2–3 months, or whenever you notice something odd.

---

## Workflow 9: Sharing Your Calibration Record

**Scenario:** You want to share your calibration insights with a colleague, or you want to export your data.

**Steps:**

1. **Run calibration report**
   ```
   /aletheia calibration
   ```

2. **Copy the summary**
   Select the entire report and copy to clipboard.

3. **Share directly** (simple)
   Paste the report in a message or document.

4. **Export to file** (structured)
   ```
   /aletheia export calibration > my-calibration-2026-q1.txt
   ```

5. **Anonymize if needed**
   The report does not include personal information, but you can redact specific claims if needed.

**Duration:** 5 minutes.

**Privacy note:** Your calibration record is personal. It contains your claims and confidence levels. Share selectively.

---

## Workflow 10: Monthly Calibration Review

**Scenario:** You want to build a monthly habit: check your calibration, learn from it, and adjust.

**Steps:**

1. **First Monday of the month**
   - Run `/aletheia status` (2 minutes)
   - Note: How many unresolved claims? Trending up or down?

2. **Mid-month**
   - Resolve 5–10 of the older claims (10 minutes)
   - Keep unresolved debt from growing

3. **Last day of the month**
   - Run `/aletheia calibration` (2 minutes)
   - Review the report (5 minutes)
   - Extract one insight: "This month I was overconfident on X; next month I will be more cautious"

4. **Adjust for next month**
   - Apply the insight to your next round of labeling

**Duration:** ~20 minutes per month.

**Expected outcome:** Over a year, you will have 12 monthly reviews. Patterns will emerge. You will know your strengths and weaknesses.

---

## Common Mistakes & How to Avoid Them

### Mistake 1: Resolving Only the Claims You Got Right

**What happens:** 99% confirmation rate. Feels great. Confidence theater.

**How to avoid it:** Deliberately resolve a representative sample. Include claims you are uncertain about. If you disconfirm something, that is valuable data, not a failure.

### Mistake 2: Mislabeling to Inflate Calibration

**What happens:** Everything is [UNCERTAIN]. [UNCERTAIN] claims are 90% confirmed. You look calibrated but you are not being genuinely uncertain.

**How to avoid it:** Use [UNKNOWN] when you actually don't know. Use [INFERRED] when you have reasoning. Only use [UNCERTAIN] when your confidence is genuinely 40–70%.

### Mistake 3: Adding Resolution Notes That Are Too Vague

**What happens:** "Confirmed." "Correct." No context. Future you cannot understand why you thought it was confirmed.

**How to avoid it:** Add 1–2 sentences: "Confirmed by the earnings report released Thursday." "Disconfirmed — the market went the opposite direction for political reasons."

### Mistake 4: Waiting Too Long to Resolve

**What happens:** You made a claim six months ago. Now you are trying to resolve it, but you have no context. Did it happen? You cannot remember.

**How to avoid it:** Resolve claims while they are fresh. Within a week if possible. Resolve at least monthly.

### Mistake 5: Treating [UNKNOWN] Like Hedging

**What happens:** You mark something [UNKNOWN] when you actually had a 70% confidence prediction. Result: You cannot track what you actually predicted.

**How to avoid it:** [UNKNOWN] means you made NO prediction. If you made any prediction, use [KNOWN], [INFERRED], or [UNCERTAIN].

---

## Tips for Consistent Practice

1. **Set a recurring reminder:** "First Monday of every month — run `/aletheia status`"

2. **Resolve in batches:** Don't resolve one claim at a time. Batch them (10+ per session) so you get into a rhythm.

3. **Keep a resolution journal:** Note patterns. "I am overconfident on technology timelines." "I am under-confident on policy outcomes."

4. **Review your calibration report monthly:** Not to judge yourself, but to learn.

5. **Share your learnings:** When you notice a pattern, tell someone. "I realized I am always wrong about tech timelines; I should stop predicting them."

6. **Celebrate disconfirmations:** They are the most valuable data. When something disconfirms, write it down. "I was wrong, and here is what I learned."

7. **Be patient:** Calibration is built over months and years, not weeks. Stick with it.

