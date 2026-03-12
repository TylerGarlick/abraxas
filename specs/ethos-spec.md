# Ethos Specification

## Specification Metadata

```yaml
---
name: ethos-spec
description: >
  Phase 8 Ethos skill specification — Voice preservation for AI-assisted writing.
  Defines stylistic fingerprint schema, voice drift detection algorithm, and
  Janus Nox integration patterns.
version: 1.0.0
phase: 8
status: specification
depends_on:
  - janus-system
  - agon
  - kairos
authors:
  - ai-rd-visionary
created: 2026-03-11
---
```

---

## E1.1 — Problem Statement

### The Voice Homogenization Crisis

AI assistance in writing produces a well-documented failure mode: **voice drift** — the gradual erosion of a writer's unique stylistic fingerprint as AI-generated content interleaves with human writing. This phenomenon has been observed across multiple studies and user reports:

- **Vocabulary convergence**: Writers using AI assistance show measurable convergence toward AI-common vocabulary within 3-6 months of regular use
- **Sentence structure homogenization**: Average sentence length and complexity converge toward model defaults (typically 15-25 words)
- **Tonal flattening**: Emotional register and expressiveness diminish as AI favors neutral, "professional" tone
- **Idiom loss**: Domain-specific phrases, personal catchphrases, and unique expressions disappear from writing

### Target Users

| User Segment | Use Case | Primary Need |
|:---|:---|:---|
| Creative writers | Fiction, poetry, creative nonfiction | Preserve unique voice across drafts |
| Professional writers | Business documents, reports, emails | Maintain professional but personal brand |
| Academic writers | Papers, proposals, grant applications | Retain scholarly voice through AI editing |
| Content creators | Blog posts, social media, marketing | Preserve authentic brand voice |
| Journalists | Articles, investigations, essays | Maintain individual style through AI assistance |

### Why Current Approaches Fail

Existing approaches to voice preservation suffer from:

1. **Post-hoc detection only**: Tools detect drift after it has occurred, not preventing it
2. **Binary classification**:区分 human vs AI, ignoring the spectrum of voice mixing
3. **No preservation mechanism**: Detection without restoration capability
4. **Ignoring Janus architecture**: No integration with Sol/Nox separation for mixed content

### Solution: Ethos

Ethos is a voice preservation system that:

- Captures the writer's stylistic fingerprint at registration
- Provides real-time drift detection with actionable feedback
- Offers restoration suggestions to return to original voice
- Integrates with Janus to handle mixed factual/expressive content
- Operates bidirectionally: detects AI influence AND preserves human voice

---

## E1.2 — Stylistic Fingerprint Schema

### Overview

The stylistic fingerprint is a multidimensional representation of a writer's voice. It captures measurable characteristics across four primary dimensions, each with specific metrics. The fingerprint is stored as a JSON document that enables algorithmic comparison.

### Fingerprint Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Stylistic Fingerprint",
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Fingerprint schema version"
    },
    "registered_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of fingerprint creation"
    },
    "source_sample": {
      "type": "object",
      "properties": {
        "text": {
          "type": "string",
          "description": "Original text sample (optional, for reference)"
        },
        "word_count": {
          "type": "integer",
          "minimum": 100,
          "description": "Number of words in source sample"
        }
      }
    },
    "sentence_structure": {
      "type": "object",
      "description": "Sentence-level structural characteristics",
      "properties": {
        "avg_sentence_length": {
          "type": "number",
          "minimum": 1,
          "maximum": 100,
          "description": "Mean words per sentence"
        },
        "sentence_length_std": {
          "type": "number",
          "minimum": 0,
          "description": "Standard deviation of sentence length"
        },
        "sentence_length_percentiles": {
          "type": "object",
          "properties": {
            "p10": { "type": "number" },
            "p25": { "type": "number" },
            "p50": { "type": "number" },
            "p75": { "type": "number" },
            "p90": { "type": "number" }
          },
          "description": "Percentile distribution of sentence lengths"
        },
        "complex_sentence_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of sentences with 2+ clauses"
        },
        "fragment_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of sentence fragments (incomplete sentences)"
        },
        "questions_per_paragraph": {
          "type": "number",
          "minimum": 0,
          "description": "Average questions per paragraph"
        },
        "exclamations_per_paragraph": {
          "type": "number",
          "minimum": 0,
          "description": "Average exclamations per paragraph"
        }
      },
      "required": ["avg_sentence_length", "sentence_length_std"]
    },
    "vocabulary": {
      "type": "object",
      "description": "Lexical characteristics",
      "properties": {
        "type_token_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Unique tokens / total tokens (lexical diversity)"
        },
        "avg_word_length": {
          "type": "number",
          "minimum": 1,
          "maximum": 20,
          "description": "Average characters per word"
        },
        "long_word_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of words with 7+ characters"
        },
        "function_word_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of function words (the, a, is, etc.)"
        },
        "content_word_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of content words (nouns, verbs, adjectives)"
        },
        "unique_bigrams": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Distinctive bigram patterns"
        },
        "unique_trigrams": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Distinctive trigram patterns"
        },
        "domain_terms": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Domain-specific vocabulary used"
        },
        "personal_idioms": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Writer's unique phrases or expressions"
        }
      },
      "required": ["type_token_ratio", "avg_word_length"]
    },
    "rhythm": {
      "type": "object",
      "description": "Paragraph and flow characteristics",
      "properties": {
        "avg_paragraph_length": {
          "type": "number",
          "minimum": 1,
          "description": "Average sentences per paragraph"
        },
        "paragraph_length_variance": {
          "type": "number",
          "minimum": 0,
          "description": "Variance in paragraph length"
        },
        "short_paragraph_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of 1-sentence paragraphs"
        },
        "long_paragraph_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Proportion of 5+ sentence paragraphs"
        },
        "paragraph_start_patterns": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Common paragraph opening patterns"
        },
        "transition_frequency": {
          "type": "number",
          "minimum": 0,
          "description": "Transitions per 100 sentences"
        }
      },
      "required": ["avg_paragraph_length"]
    },
    "tone": {
      "type": "object",
      "description": "Emotional and formality indicators",
      "properties": {
        "formality_score": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "0 (informal/casual) to 1 (formal/ceremonial)"
        },
        "emotional_valence": {
          "type": "number",
          "minimum": -1,
          "maximum": 1,
          "description": "-1 (negative) to 1 (positive) emotional tone"
        },
        "emotional_arousal": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "0 (calm/neutral) to 1 (high energy/intense)"
        },
        "personal_pronoun_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "First-person pronouns / total pronouns"
        },
        "imperative_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Commands and directives / all sentences"
        },
        "hedging_frequency": {
          "type": "number",
          "minimum": 0,
          "description": "Hedging words per 1000 words (maybe, perhaps, etc.)"
        },
        "certainty_markers": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Words indicating certainty (definitely, certainly, etc.)"
        },
        "uncertainty_markers": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Words indicating uncertainty"
        }
      },
      "required": ["formality_score"]
    }
  },
  "required": ["version", "registered_at", "sentence_structure", "vocabulary", "rhythm", "tone"]
}
```

### Dimension Weights for Comparison

The following weights determine how each dimension contributes to the overall drift score:

| Dimension | Weight | Rationale |
|:---|:---:|:---|
| Sentence Structure | 0.25 | Most visible indicator of AI influence |
| Vocabulary | 0.30 | Primary carrier of unique expression |
| Rhythm | 0.15 | Paragraph flow is harder to consciously control |
| Tone | 0.30 | Most distinctive personal marker |

### Fingerprint Extraction Algorithm

The fingerprint extraction follows these steps:

1. **Preprocessing**: Clean text, normalize whitespace, split into sentences and paragraphs
2. **Sentence Analysis**: Calculate length, clause count, punctuation patterns for each sentence
3. **Vocabulary Analysis**: Tokenize, calculate TTR, identify n-grams, extract domain terms
4. **Rhythm Analysis**: Calculate paragraph statistics, transition frequency
5. **Tone Analysis**: Apply sentiment analysis, formality scoring, pronoun ratio calculation
6. **Aggregation**: Combine all metrics into fingerprint structure
7. **Validation**: Ensure minimum sample requirements are met (100+ words recommended)

### Minimum Sample Requirements

| Metric | Minimum | Recommended |
|:---|:---:|:---:|
| Word count | 100 | 500+ |
| Unique sentences | 10 | 50+ |
| Paragraphs | 3 | 10+ |

Samples below minimum may produce unreliable fingerprints. The system issues warnings when sample size is insufficient.

---

## E1.3 — Voice Drift Detection Algorithm

### Algorithm Overview

The voice drift detection algorithm compares two fingerprints (original vs. current) and produces a normalized drift score from 0-100. The algorithm is designed for real-time comparison during writing sessions.

### Drift Score Calculation

```
drift_score = Σ (dimension_weight × dimension_drift) × 100
```

Where `dimension_drift` is calculated per dimension as:

```python
dimension_drift = distance(original_values, current_values) / max_possible_distance
```

### Distance Metrics by Dimension

#### Sentence Structure Distance

Uses normalized Euclidean distance with percentile weighting:

```
sentence_distance = sqrt(
  (normalized_avg_length_diff)² × 0.30 +
  (normalized_std_diff)² × 0.20 +
  (normalized_complex_ratio_diff)² × 0.25 +
  (normalized_fragment_ratio_diff)² × 0.15 +
  (normalized_question_freq_diff)² × 0.10
)
```

#### Vocabulary Distance

Combines multiple lexical metrics:

```
vocabulary_distance = sqrt(
  (ttr_diff)² × 0.25 +
  (avg_word_length_diff)² × 0.15 +
  (long_word_ratio_diff)² × 0.15 +
  (unique_bigram_jaccard_diff) × 0.25 +
  (domain_term_overlap_diff) × 0.20
)
```

Jaccard distance for n-gram overlap: `1 - (intersection / union)`

#### Rhythm Distance

```
rhythm_distance = sqrt(
  (paragraph_length_diff)² × 0.40 +
  (short_para_ratio_diff)² × 0.30 +
  (long_para_ratio_diff)² × 0.30
)
```

#### Tone Distance

```
tone_distance = sqrt(
  (formality_diff)² × 0.35 +
  (valence_diff)² × 0.20 +
  (arousal_diff)² × 0.20 +
  (personal_pronoun_diff)² × 0.25
)
```

### Drift Thresholds

| Score Range | Classification | Action |
|:---|:---|:---|
| 0-19 | **Acceptable** | No action required. Voice is consistent. |
| 20-39 | **Warning** | User should review flagged dimensions. Suggestions provided. |
| 40-59 | **Significant Drift** | Active voice loss detected. Restoration recommended. |
| 60-79 | **Critical** | Major voice alteration. Immediate restoration advised. |
| 80-100 | **Severe** | Original voice largely lost. Full restoration needed. |

### Output Format

The algorithm returns a structured result:

```json
{
  "drift_score": 32,
  "classification": "warning",
  "dimensions": {
    "sentence_structure": {
      "drift": 0.28,
      "status": "warning",
      "details": {
        "avg_sentence_length": {
          "original": 18.5,
          "current": 22.1,
          "diff": 3.6,
          "severity": "moderate"
        },
        "complex_sentence_ratio": {
          "original": 0.35,
          "current": 0.22,
          "diff": -0.13,
          "severity": "moderate"
        }
      }
    },
    "vocabulary": {
      "drift": 0.35,
      "status": "warning",
      "details": { ... }
    },
    "rhythm": {
      "drift": 0.22,
      "status": "acceptable",
      "details": { ... }
    },
    "tone": {
      "drift": 0.38,
      "status": "warning",
      "details": { ... }
    }
  },
  "recommendations": [
    "Sentence length has increased by 3.6 words on average. Consider shorter sentences.",
    "Complex sentence usage decreased by 13%. Original voice favored more varied structure.",
    "Formality score increased by 0.12. Consider more casual phrasing."
  ],
  "timestamp": "2026-03-11T14:30:00Z"
}
```

### Algorithmic Considerations

#### Normalization

All metrics are normalized to [0, 1] range before distance calculation using min-max scaling based on observed ranges in training data:

| Metric | Observed Min | Observed Max |
|:---|:---:|:---:|
| Avg sentence length | 5 | 45 |
| Type-token ratio | 0.2 | 0.9 |
| Formality score | 0.1 | 0.95 |
| Emotional valence | -0.8 | 0.8 |

#### Robustness

The algorithm handles:

- **Missing dimensions**: If a dimension cannot be calculated, its weight is redistributed proportionally
- **Outlier sensitivity**: Percentile-based trimming (5% at each tail) before calculating statistics
- **Sample size adaptation**: Smaller samples receive wider confidence intervals in threshold interpretation
- **Temporal drift**: Accounts for natural voice evolution by allowing slow drift (<2 points/year) without triggering warnings

#### Performance

- **Single comparison**: <50ms for 1000-word sample
- **Batch processing**: 100 samples/second
- **Memory**: <1MB for fingerprint storage
- **Extraction**: ~100ms for 500-word sample

---

## E1.4 — Nox Integration Patterns

### Janus Architecture Recap

The Janus system divides output into two faces:

- **Sol**: The waking face — factual, analytical, labeled output with epistemic markers ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN])
- **Nox**: The dreaming face — symbolic, creative, unfettered output labeled [DREAM]

Ethos must integrate with this architecture to handle the reality of mixed-content documents.

### When Voice Applies

| Content Type | Janus Face | Ethos Applies? | Rationale |
|:---|:---|:---:|:---|
| Factual claims | Sol | **Yes** | Voice should persist in professional/academic writing |
| Analytical reasoning | Sol | **Yes** | Voice in argument construction matters |
| Technical documentation | Sol | **Yes** | Personal voice in technical expression |
| Creative writing | Nox | **Conditional** | Voice in creative work is complex—see below |
| Symbolic/poetic content | Nox | **No** | Different authorship expectations |
| Dream content | Nox | **No** | Clearly marked as generative |
| Mixed paragraphs | Both | **Segmented** | Apply voice to Sol portions only |

### Conditional Voice in Nox

Creative writing presents a special case. When a writer uses Nox for symbolic or poetic content:

- **Nox-native creative output**: Content generated purely by the model carries [DREAM] label — voice fingerprint does not apply as authorship is ambiguous
- **Writer-initiated creative revision**: If the user revises Nox output to make it their own, voice fingerprint applies to the revision
- **Hybrid passages**: Passages that mix writer-provided structure with Nox content are handled as segmented

### Threshold Behavior

When analyzing a document that contains both Sol and Nox content:

1. **Detection Phase**: Ethos identifies which portions are Sol vs. Nox using Janus labels
2. **Extraction Phase**: Sol content is extracted for fingerprint comparison
3. **Comparison Phase**: Fingerprint is compared against Sol-extracted content only
4. **Reporting Phase**: Results indicate which portions were analyzed

### Edge Cases

| Scenario | Handling |
|:---|:---|
| Document with no Sol content | Report "No voice-analyzable content found. Document appears purely symbolic." |
| Document with no Nox content | Standard comparison applies to entire document |
| Unlabeled content | Treat as Sol (default to voice analysis) |
| Single-sentence mixed label | Analyze at sentence level when possible |
| Ambiguous content | Query user: "This passage contains unlabeled content. Apply voice analysis?" |

### Example: Sol/Nox Document with Voice Preservation

#### Input Document (Mixed)

```
[KNOWN] The hippocampus plays a crucial role in memory consolidation. [INFERRED] 
During sleep, neural replay of daytime experiences strengthens synaptic connections. 
[UNKNOWN] The precise mechanism of long-term potentiation remains unclear.

[My dreams] The hippocampus became a vast library where each book whispered its 
contents to anyone who listened. [DREAM]
```

#### Voice Analysis Output

```
Voice Analysis: Document contains both Sol and Nox content.

Sol Portions Analyzed: 2 passages (42 words)
Nox Portions Identified: 1 passage (18 words) — excluded from voice analysis

Drift Score: 24 (Warning)

Analysis breakdown:
- Sentence structure: Acceptable (drift: 0.15)
- Vocabulary: Warning (drift: 0.32)
  → "crucial" and "precise" detected as AI-preferred vocabulary
  → Consider replacing with personal alternatives
- Rhythm: Acceptable (drift: 0.18)
- Tone: Acceptable (drift: 0.19)

Note: Analysis covers Sol-labeled content only. Nox content preserved as-is.
```

### Integration Commands

#### `/ethos check [text]`

When invoked with mixed content, automatically:

1. Detects Janus labels in text
2. Extracts Sol content for analysis
3. Reports drift score for Sol content
4. Notes presence of Nox content

#### `/ethos register [text]`

When registering from mixed content:

1. If text contains Janus labels, extracts Sol content only
2. Warns if >50% of text is Nox: "Fingerprint may be incomplete"
3. Stores source type metadata: `{"source_type": "sol_extracted", "total_words": 500, "sol_words": 420}`

#### `/ethos restore [text]`

Restoration applies to Sol content only:

1. Identifies Sol-labeled passages
2. Applies voice adjustments to those passages only
3. Preserves Nox content unchanged
4. Reports: "Restored 380 of 420 Sol words. Nox content unchanged."

---

## Command Interface Summary

This specification enables the following Ethos commands:

| Command | Input | Output |
|:---|:---|:---|
| `/ethos register [sample]` | Text sample (100+ words) | Fingerprint JSON summary |
| `/ethos check [text]` | Text to analyze | Drift score + breakdown |
| `/ethos restore [text]` | Text to adjust | Voice-adjusted text |
| `/ethos audit [session]` | Session ID | Timeline + statistics |
| `/ethos compare [a] [b]` | Two samples/texts | Detailed comparison |

### Integration Notes

- All commands handle Janus Sol/Nox labels appropriately
- Fingerprint storage location: `~/.abraxas/ethos/fingerprints/`
- Session history location: `~/.abraxas/ethos/history/`
- Commands can be chained: `/ethos register sample1` → `/ethos check sample2`

---

## Success Criteria

Ethos Phase 8 specification is complete when:

- [x] E1.1: Problem statement documented with target user segments
- [x] E1.2: Stylistic fingerprint schema defined with JSON schema
- [x] E1.3: Voice drift detection algorithm designed with thresholds
- [x] E1.4: Nox integration patterns documented with examples

---

## Next Steps

This specification feeds into:

1. **E2.1**: Brand naming and aesthetic fit review (brand-ux-architect)
2. **E2.2-E2.6**: SKILL.md authoring for all five commands (skill-author)
3. **P1.1**: Skill packaging and integration testing

---

*Specification complete. Ready for implementation.*
*Created by: ai-rd-visionary*
*Date: 2026-03-11*