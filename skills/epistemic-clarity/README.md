# Epistemic Clarity - Quick Start

**Convert unknowns to knowns via systematic Socratic questioning.**

---

## Commands

| Command | Description |
|---------|-------------|
| `/clarity start [request]` | Begin clarity session |
| `/clarity status` | Show current knowns/unknowns |
| `/clarity answer [id] [answer]` | Answer question by ID |
| `/clarity skip [id]` | Skip question |
| `/clarity export` | Export final clarity map |

---

## Quick Example

```
You: /clarity start Build a dashboard

Engine:
🔍 UNKNOWN EXTRACTION
├─ GOAL: What exactly should this do? [unknown]
├─ AUDIENCE: Who is the end user? [unknown]
├─ FORMAT: What format is expected? [unknown]
└─ SUCCESS: How will we know when done? [unknown]

❓ "What exactly should this do / achieve?"

You: /clarity answer 1 Server health monitoring

✅ Labeled: Sol / Confident
📊 Remaining: 3 unknowns
```

---

## Epistemic Labels

| Label | Meaning |
|-------|---------|
| **Sol** | Verified true |
| **Nox** | Verified false |
| **Confident** | User explicitly confirmed |
| **Uncertain** | User expressed doubt |
| **Skipped** | User chose not to answer |

---

## Rules

1. **No inference** — Only explicit answers count
2. **High leverage first** — Most unknowns resolved per question
3. **Support uncertainty** — Help users arrive at answers
4. **Iterate** — Continue until no unknowns remain

---

## Files

```
skills/epistemic-clarity/
├── SKILL.md              # Full documentation
├── README.md             # This file
├── scripts/
│   ├── clarity-engine.js # Core engine
│   ├── unknown-extractor.js
│   ├── leverage-ranker.js
│   └── clarity-export.js
└── storage/
    └── clarity-ledger.jsonl
```
