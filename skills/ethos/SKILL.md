---
name: ethos
description: >
  Ethos is voice preservation architecture for AI-assisted writing. It captures
  stylistic fingerprints, detects voice drift in real-time, and offers restoration
  pathways. Commands: /ethos register, /ethos check, /ethos restore, /ethos audit,
  /ethos compare. Integrates with Janus to handle Sol/Nox content appropriately.
argument-hint: <register|check|restore|audit|compare> [text] [--auto]
user-invokable: true
---

# Ethos

Ethos is voice preservation architecture — the systematic capture and defense of a writer's unique stylistic fingerprint against the homogenizing effects of AI-assisted writing. It solves the problem of voice drift: the gradual erosion of personal style as AI-generated content interleaves with human writing.

Ethos operates through five integrated commands that form a complete voice lifecycle: capture your fingerprint, check for drift, restore your voice, audit your history, and compare samples. Throughout, it integrates with Janus to distinguish Sol content (where voice matters) from Nox content (where authorship is ambiguous).

---

## The Core Problem Ethos Solves

AI assistance in writing produces a well-documented failure mode: **voice drift**. This manifests as:

- **Vocabulary convergence** — Writers adopt AI-common words, losing unique expression
- **Sentence structure homogenization** — Average length and complexity drift toward model defaults
- **Tonal flattening** — Emotional register diminishes as AI favors neutral tone
- **Idiom loss** — Personal catchphrases and domain-specific phrases disappear

Most existing approaches detect drift after it has occurred. Ethos provides real-time detection with actionable restoration pathways — it doesn't just identify the problem, it offers solutions.

---

## When to Use Ethos

**Use Ethos when:**
- You write with AI assistance regularly and want to preserve your voice
- You've noticed your writing feeling "generic" or "AI-like"
- You want to establish a baseline of your authentic voice
- You're transitioning between different writing projects and want consistency
- You need to restore your voice after heavy AI editing

**Use Ethos with Janus when:**
- Analyzing documents with mixed factual and creative content
- Working on projects that span Sol (analytical) and Nox (creative) modes
- Content contains [KNOWN], [INFERRED], [DREAM], or other Janus labels

---

## The Five Commands

### `/ethos register` — Capture Your Stylistic Fingerprint

Capture your current writing style as a fingerprint for future comparison. The fingerprint encodes measurable characteristics across four dimensions: sentence structure, vocabulary, rhythm, and tone.

**Arguments:**
- `text` (required unless using clipboard): The text sample to analyze. Must be 100+ words (500+ recommended).
- `--clipboard` (flag): Use clipboard content instead of provided text.

**Error Handling:**
| Error | Condition | Response |
|-------|-----------|----------|
| INSUFFICIENT_TEXT | Fewer than 100 words | "Fingerprint requires minimum 100 words. Provided: {count}. For reliable results, use 500+ words." |
| NO_TEXT | No text provided and no clipboard | "Please provide text sample or use --clipboard flag." |

**Example:**
```
/ethos register
The morning arrived without ceremony, the way it always does in November —
gray and indifferent, yet somehow full of promise. I sat at the kitchen table
with my coffee, watching steam curl upward, thinking about the conversation
we'd had last night. She had that look in her eyes, the one that meant she
was about to say something important, something that would change things.
```

**Output:**
```
[STYLISTIC FINGERPRINT CAPTURED]

Fingerprint ID: fp-2026-03-12-abc123
Registered: 2026-03-12T08:30:00Z
Source: 342 words

Dimensions:
├── Sentence Structure
│   ├── Avg length: 18.5 words (std: 6.2)
│   ├── Complex sentences: 35%
│   ├── Fragments: 8%
│   └── Questions: 0.3/para
├── Vocabulary
│   ├── Type-token ratio: 0.68
│   ├── Avg word length: 4.9 chars
│   ├── Long words (7+): 18%
│   └── Unique bigrams: 24 identified
├── Rhythm
│   ├── Avg paragraph: 3.2 sentences
│   ├── Short para ratio: 12%
│   └── Long para ratio: 22%
└── Tone
    ├── Formality: 0.42 (moderate)
    ├── Emotional valence: 0.15 (slightly positive)
    ├── Emotional arousal: 0.38 (moderate)
    └── Personal pronouns: 28%

Storage: ~/.abraxas/ethos/fingerprints/fp-2026-03-12-abc123.json
```

---

### `/ethos check` — Detect Voice Drift

Compare current text against your registered fingerprint to detect voice drift. Returns a drift score with detailed breakdown by dimension, plus actionable recommendations.

**Arguments:**
- `text` (required unless using clipboard): The text to analyze.
- `--clipboard` (flag): Use clipboard content instead.

**Drift Thresholds:**
| Score | Classification | Visual | Action |
|-------|----------------|--------|--------|
| 0-19 | Acceptable | [GREEN] | No action required |
| 20-39 | Warning | [YELLOW] | Review flagged dimensions |
| 40-59 | Significant Drift | [ORANGE] | Restoration recommended |
| 60-79 | Critical | [RED] | Immediate restoration advised |
| 80-100 | Severe | [RED] | Full restoration needed |

**Example:**
```
/ethos check
The hippocampus plays a crucial role in memory consolidation. During sleep,
neural replay of daytime experiences strengthens synaptic connections. The
precise mechanism of long-term potentiation remains unclear.
```

**Output:**
```
[VOICE DRIFT DETECTED]

Drift Score: 32 [YELLOW - WARNING]

Dimensions:
├── Sentence Structure: 0.28 [GREEN]
│   ├── Avg length: 18.5 → 22.1 (+3.6)
│   └── Complex ratio: 0.35 → 0.22 (-13%)
├── Vocabulary: 0.35 [YELLOW]
│   ├── Type-token ratio: 0.68 → 0.52 (-16%)
│   ├── Unique bigrams: 24 → 8 (67% overlap)
│   └── "crucial", "precise" detected as AI-preferred
├── Rhythm: 0.18 [GREEN]
│   └── Paragraph patterns preserved
└── Tone: 0.38 [YELLOW]
    ├── Formality: 0.42 → 0.54 (+0.12)
    └── Personal pronouns: 28% → 12% (-16%)

Recommendations:
• Sentence length increased by 3.6 words — consider shorter, sharper sentences
• Complex sentence usage decreased by 13% — original voice favored more varied structure
• Formality score increased by 0.12 — consider more casual phrasing
• Personal pronoun usage dropped significantly — original voice was more personal

Janus Integration:
Sol portions analyzed: 3 passages (42 words)
Nox portions detected: 0 — no symbolic content excluded

Next: /ethos restore {text} to adjust, or /ethos compare {sample_a} {sample_b}
```

---

### `/ethos restore` — Return to Your Voice

Rewrite text to match your registered voice. Two modes: algorithmic (--auto) for immediate adjustment, or presentation mode for manual adoption.

**Arguments:**
- `text` (required): The text to restore.
- `--auto` (flag): Apply algorithmic adjustments only, no suggestions.

**Behavior by Mode:**

| Mode | Description | Use Case |
|------|-------------|----------|
| `--auto` | Algorithmic adjustment: sentence length, vocabulary swap, structure normalization | Quick fixes, batch processing |
| Default | Present suggestions for manual adoption: specific changes with rationale | Learning, precise control |

**Example (default mode):**
```
/ethos restore
The hippocampus plays a crucial role in memory consolidation. During sleep,
neural replay of daytime experiences strengthens synaptic connections. The
precise mechanism of long-term potentiation remains unclear.
```

**Output:**
```
[VOICE RESTORATION — SUGGESTIONS]

Analyzed: 42 Sol words, 0 Nox words (excluded)

Suggestions for adoption:

1. SENTENCE LENGTH
   Original: avg 22.1 words
   Target: 18.5 words
   ─────────────────────────
   "The hippocampus plays a crucial role in memory consolidation."
   → Consider: "The hippocampus anchors memory." (reduced from 8 to 4 words)

2. VOCABULARY REPLACEMENT
   ─────────────────────────
   "crucial" → AI-preferred marker
   → Alternative: "key", "central", "essential"
   
   "precise" → AI-preferred marker  
   → Alternative: "exact", "specific", "true"

3. TONE ADJUSTMENT
   ─────────────────────────
   Formality too high (0.54 → target 0.42)
   → "strengthens synaptic connections" → "fires up the connections between neurons"

4. PERSONAL VOICE
   ─────────────────────────
   Personal pronouns missing (12% → target 28%)
   → Consider adding: "we", "I", "my observations"

Apply all? [y/n] or review individually
```

**Example (auto mode):**
```
/ethos restore --auto
Same text as above
```

**Output:**
```
[VOICE RESTORED — AUTO MODE]

Adjusted text:

The hippocampus anchors memory. While we sleep, our brains fire up the
neural connections from daytime learning. The exact mechanism behind
long-term potentiation still puzzles researchers.

Changes applied:
• 3 vocabulary swaps (crucial→anchors, precise→exact, strengthens→fire up)
• 2 sentence shortenings
• 1 tone adjustment (added "our")
• Personal pronoun ratio restored to 24%

Note: --auto mode applies algorithmic adjustments only. For full restoration,
run without --auto flag.
```

---

### `/ethos audit` — Review Session History

Analyze your writing history to identify voice drift over time. Returns timeline visualization, identifies which interactions caused the most drift, and provides aggregate statistics.

**Arguments:**
- `session` (optional): Session ID to audit. If omitted, audits all sessions.
- `--days N` (optional): Limit to last N days.
- `--limit N` (optional): Limit to N most recent entries.

**Example:**
```
/ethos audit
```

**Output:**
```
[VOICE AUDIT REPORT]

Period: 2026-01-15 to 2026-03-12 (56 days)
Sessions analyzed: 12
Total comparisons: 47

Timeline:
──────────────────────────────────────────────────────────────
Jan 15  [GREEN] ────────────────────────────────────────── 8
Jan 22  [GREEN] ───────────────────────────────────────── 12
Jan 29  [YELLOW] ──────────────────────────────────────── 23
Feb 05  [YELLOW] ──────────────────────────────────────── 31
Feb 12  [GREEN] ────────────────────────────────────────── 18  ← After /ethos restore
Feb 19  [YELLOW] ──────────────────────────────────────── 27
Feb 26  [ORANGE] ───────────────────────────────────────── 45  ← Heavy AI editing session
Mar 05  [YELLOW] ──────────────────────────────────────── 32
Mar 12  [YELLOW] ───────────────────────────────────────── 28
──────────────────────────────────────────────────────────────

Largest Drift Events:
1. Feb 26: Score +45 → "AI-generated introduction to quarterly report"
   Cause: 73% of paragraph was AI-generated without review
   
2. Jan 29: Score +23 → "Email chain with client"
   Cause: Adopted formal AI-suggested phrasing

3. Feb 05: Score -18 → "After restoration"
   Cause: /ethos restore applied successfully

Aggregate Statistics:
├── Avg drift score: 26.4
├── Sessions in warning+: 7 (58%)
├── Restorations applied: 3
├── Recovery rate: 67% (2 of 3 effective)

Voice Health: CAUTION
─────────────────────
Your writing shows consistent drift patterns. Consider:
1. More frequent /ethos check during AI-assisted sessions
2. Review AI suggestions before accepting (Feb 26 event)
3. Apply /ethos restore after heavy editing sessions

Next: /ethos audit --days 30 for recent period
```

---

### `/ethos compare` — Compare Two Samples

Compare two text samples or fingerprints directly. Returns detailed comparison showing which dimensions differ and by how much.

**Arguments:**
- `sample_a` (required): First text sample or fingerprint ID.
- `sample_b` (required): Second text sample or fingerprint ID.
- `--format text|fingerprint` (optional): Specify if comparing fingerprints or text.

**Example:**
```
/ethos compare
"The morning arrived without ceremony, the way it always does in November."
"During the night, memory consolidation occurs through hippocampal replay."
```

**Output:**
```
[COMPARISON REPORT]

Sample A: 18 words (stylistic reference)
Sample B: 14 words (current writing)

Dimension Breakdown:

Sentence Structure:
├── Avg length: 18.5 → 14.0 (-4.5 words, -24%)
├── Variance: 6.2 → 3.1 (-50%, more uniform)
├── Complex ratio: 35% → 14% (-21 points)
└── Status: SIGNIFICANT DIFFERENCE

Vocabulary:
├── Type-token: 0.68 → 0.52 (-16 points)
├── Avg word length: 4.9 → 4.2 chars (-14%)
├── Unique bigrams: 24 → 6 (75% overlap)
├── AI-preferred markers: 2 detected ("during", "occurs")
└── Status: SIGNIFICANT DIFFERENCE

Rhythm:
├── Paragraph avg: 3.2 → 2.1 sentences (-34%)
├── Short para ratio: 12% → 33% (+21 points)
└── Status: MODERATE DIFFERENCE

Tone:
├── Formality: 0.42 → 0.71 (+0.29, more formal)
├── Emotional valence: 0.15 → -0.05 (-20 points)
├── Personal pronouns: 28% → 7% (-21 points)
└── Status: SIGNIFICANT DIFFERENCE

Summary:
─────────
Most different: Tone (+0.29 formality shift)
Second: Vocabulary (16-point TTR drop)
Third: Sentence structure (24% shorter avg)

The second sample shows classic AI-voice markers: higher formality,
shorter uniform sentences, fewer personal pronouns, reduced vocabulary
diversity. Consider /ethos restore to bring toward Sample A profile.
```

---

## Janus Integration

Ethos integrates with the Janus system to handle mixed Sol/Nox content appropriately. This ensures voice analysis applies only where it makes sense.

### Detection Rules

When analyzing content with Janus labels:

| Content Type | Janus Face | Voice Applies? |
|--------------|------------|----------------|
| Factual claims | Sol | Yes |
| Analytical reasoning | Sol | Yes |
| Technical documentation | Sol | Yes |
| Creative writing | Nox | Conditional |
| Symbolic/poetic content | Nox | No |
| Dream content | Nox | No |

### Command Behavior with Janus

- `/ethos register`: If text contains Janus labels, extracts Sol content only. Warns if >50% is Nox.
- `/ethos check`: Detects Sol vs. Nox, analyzes Sol only, reports Nox exclusion.
- `/ethos restore`: Applies to Sol passages only, preserves Nox unchanged.
- `/ethos audit`: Tags which sessions had Nox content.
- `/ethos compare`: Compares Sol-extracted content when labels present.

### Example: Mixed Sol/Nox Analysis

Input:
```
[KNOWN] The hippocampus plays a crucial role in memory consolidation.
[INFERRED] During sleep, neural replay strengthens connections.
[UNKNOWN] The precise mechanism remains unclear.

[My dreams] The hippocampus became a vast library. [DREAM]
```

Output from `/ethos check`:
```
Analysis: Document contains both Sol and Nox content.

Sol Portions Analyzed: 3 passages (42 words)
Nox Portions Excluded: 1 passage (18 words)

Drift Score: 24 [YELLOW]
Analysis applies to Sol content only.
```

---

## Storage

Fingerprints and history stored in `~/.abraxas/ethos/`:

```
~/.abraxas/ethos/
├── config.md                    # User preferences
├── fingerprints/                # Registered voice fingerprints
│   └── fp-{date}-{uuid}.json   # Fingerprint files
└── history/                    # Session history
    ├── sessions.json           # Session index
    └── comparisons/            # Individual comparison logs
```

---

## Constraints

1. **Non-prescriptive** — Ethos detects and suggests; it does not dictate your voice
2. **Respect Nox** — Never apply voice analysis to content marked [DREAM]
3. **Warn on small samples** — Reject fingerprints from <100 words with clear error
4. **Explain drift** — Always provide actionable recommendations, not just scores
5. **Preserve user agency** — Restore offers suggestions for adoption, not forced changes
6. **Track history** — Maintain session history for audit and pattern detection

---

## Quality Checklist

Before delivering any Ethos analysis:

- [ ] Fingerprint registered with sufficient sample size (100+ words)
- [ ] Janus labels detected and handled appropriately
- [ ] Drift score calculated with all four dimensions
- [ ] Recommendations are specific and actionable
- [ ] Threshold classification correct (green/yellow/orange/red)
- [ ] Storage path confirmed and accessible
- [ ] Audit history includes temporal tracking
- [ ] Compare provides dimension-by-dimension breakdown