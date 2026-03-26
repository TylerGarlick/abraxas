# Link Checker Skill

**Triggers:** "check links", "MJ links"

## Description
Validates all links in content (internal and external). Checks for broken links, redirect chains, and accessibility issues.

## Usage
When user says "check links", "MJ links", or similar phrasing:

1. Extract all URLs from content
2. Validate each URL (HTTP status, redirects)
3. Report broken or problematic links
4. Suggest fixes for redirect chains

## Sister Skills
- Checks: [seo-optimizer, version-tracker]
- Checked by: [editor, workflow-automation]

## Implementation
- Script: `scripts/link-checker.js`
- Checks: HTTP status, redirects, rel attributes
