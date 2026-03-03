# Context Template

Use this template to create your own custom frame. Copy it, fill in your context, and load it before starting your session.

---

## Template

```
# [Frame Name]

[Brief one-line description of what you need]

---

## Context

[What I need you to know about me, my situation, or this session]

## Communication Style

[How you want the AI to communicate with you]

## Priorities

[What matters most in this session]

## Evaluation Criteria

[How to judge success — what makes a good answer for you]

## What to Avoid

[Things that don't work for you or would be counterproductive]
```

---

## Example: Filled Template

```
# React Expert Review

I need a code review from someone who knows React deeply.

---

## Context

Working on a React 18 application with TypeScript. 
Using Redux Toolkit for state management. 
Team of 3 developers. 
Legacy code mixed with new features.

## Communication Style

Be direct. Don't explain React basics. 
Call out issues with line numbers.
I can handle harsh feedback — don't soften.

## Priorities

1. Security vulnerabilities
2. Performance problems  
3. React anti-patterns
4. TypeScript type safety

## Evaluation Criteria

Good = specific issues with evidence.
Don't = generic "this could be better" without specifics.

## What to Avoid

Don't spend time on:
- Code formatting (we use prettier)
- Variable naming suggestions
- Comments on obvious code
```

---

## How to Use

1. Copy this template
2. Fill in your specific context
3. Save as `[my-frame].md`
4. Load with `/frame load my-frame` (or equivalent in your tool)
5. Or copy the content directly into your AI's context

---

## Tips

- Keep it minimal at the top, detailed below
- Focus on what changes behavior, not just context
- Include evaluation criteria — it helps the AI know what "good" looks like
- Update as your needs evolve
