# Readability Scorer Skill

**Triggers:** "readability", "MJ readable"

## Description
Scores content readability using established metrics. Provides actionable suggestions to improve comprehension and engagement.

## Usage
When user says "readability", "MJ readable", or similar phrasing:

1. Analyze content with multiple readability formulas
2. Calculate overall readability score
3. Identify difficult passages
4. Suggest specific improvements

## Sister Skills
- Checks: [editor, seo-optimizer, style-guide-enforcer]
- Checked by: [draft-writer, version-tracker]

## Implementation
- Script: `scripts/readability-scorer.js`
- Metrics: Flesch, Gunning Fog, SMOG, Coleman-Liau
