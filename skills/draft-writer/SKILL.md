# Draft Writer Skill

**Triggers:** "write draft", "MJ draft"

## Description
Generates structured content drafts from brief prompts. Creates blog posts, articles, emails, and marketing copy with proper formatting, headlines, and sections.

## Usage
When user says "write draft", "MJ draft", or similar phrasing:

1. Identify the content type from the request
2. Ask for key details if not provided (audience, tone, length)
3. Generate a well-structured draft using the script
4. Present the draft for review/editing

## Sister Skills
- Checks: [editor, style-guide-enforcer, readability-scorer, headline-analyzer]
- Checked by: [workflow-automation, content-calendar]

## Implementation
- Script: `scripts/draft-writer.js`
- Supports: blog posts, articles, emails, landing pages, social posts
