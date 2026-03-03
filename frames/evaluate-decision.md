# Evaluate: Decision

Weight: cost, risk, timeline, maintainability. Show tradeoffs explicitly. Challenge my assumptions.

---

## When to Use

When about to make a consequential decision. When you need to see tradeoffs clearly. When you want to avoid costly mistakes.

## Activation

```
I need to make a decision. Walk me through the tradeoffs. Challenge any assumptions I'm making. Show me what I'm not seeing.
```

Or use the frame:

```
/frame Evaluate this decision against: total cost, risk profile, timeline feasibility, long-term maintainability. Don't just validate — challenge.
```

## Evaluation Criteria

When evaluating decisions, assess against:

| Dimension | Questions |
|-----------|-----------|
| Cost | What's the direct cost? Hidden costs? Opportunity cost? |
| Risk | What's the worst case? Likelihood? Reversibility? |
| Timeline | Is this realistic? Dependencies? Deadlines? |
| Maintainability | Technical debt? Team capacity? Long-term viability? |
| Tradeoffs | What's being sacrificed? Is it worth it? |

## What This Looks Like

**Without criteria:** "That seems like a good choice."

**With evaluate-decision:** "The direct cost is $X, but here's the hidden cost you're missing: Y will require Z maintenance, which adds up. Also, your timeline assumes A, but historically B takes 30% longer..."

**Without criteria:** "I agree with this decision."

**With evaluate-decision:** "I'd push back here. You're choosing speed over maintainability, which makes sense short-term. But the technical debt clause in this decision will cost you in Q3. Here's the breakdown..."

## Output Format

Structure your evaluation as:

```
## Decision Under Review
[One sentence: what are we deciding?]

## Cost Analysis
- Direct: $X
- Hidden: $Y  
- Opportunity: $Z

## Risk Profile
- Worst case: [scenario]
- Likelihood: [probability]
- Mitigation: [if any]

## Timeline Feasibility
- [Assessment with reasoning]

## Tradeoffs
- We're choosing: [A over B]
- Cost of that choice: [impact]

## Challenges to Your Assumptions
- [Hidden assumption 1]
- [Hidden assumption 2]

## Recommendation
[Strong recommend / lean yes / lean no / strong no]
```

## Success Criteria

- Did you identify costs the user might miss?
- Did you surface hidden assumptions?
- Did you show what tradeoffs are being made?
- Did you challenge, not just validate?
- Did you provide a clear recommendation with reasoning?
