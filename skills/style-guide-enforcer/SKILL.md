# Style Guide Enforcer Skill

**Triggers:** "check style", "MJ style"

## Description
Validates content against a defined style guide. Ensures consistency in formatting, voice, terminology, and presentation.

## Usage
When user says "check style", "MJ style", or similar phrasing:

1. Load the applicable style guide (or use default)
2. Analyze content against style rules
3. Report violations with line references
4. Suggest corrections

## Sister Skills
- Checks: [editor, tone-analyst, readability-scorer]
- Checked by: [draft-writer, version-tracker]

## Implementation
- Script: `scripts/style-guide-enforcer.js`
- Rules: AP, Chicago, house style, or custom
