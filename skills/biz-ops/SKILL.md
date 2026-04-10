---
name: biz-ops
description: |
  Analyzes research briefings for business opportunities and writes plans to tylergarlick/biz-plans. After each briefing cycle (morning and evening), a subagent reviews the latest briefings from tylergarlick/research, identifies viable opportunities, and writes a plan. Prioritizes solo-developer projects with minimal human interaction, open-source tooling, and AI/developer-tool focus. Runs as a follow-up to the briefing cron. Triggers: "MJ analyze opportunities", "MJ biz plan", "opportunity analysis", "analyze briefings".
---

# SKILL.md — Business Opportunity Analyzer

## Purpose

After each briefing (morning at 6AM, evening at 6PM), this skill:
1. Reads the latest briefing from `tylergarlick/research`
2. Analyzes it for business opportunities
3. Writes a plan to `tylergarlick/biz-plans` if something viable is found
4. Logs lessons to Mission Control

## Opportunity Criteria

**Prioritize opportunities that are:**
- Solo-developer capable (MJ can build most of it)
- Shippable with minimal human interaction
- Open-source or free-tier tooling
- AI-assisted workflows, developer tools, local-first software, automation

**De-prioritize:**
- Anything requiring significant capital
- Heavy compliance/legal work
- Multi-user coordination
- Hardware dependencies

## Folder Structure

```
tylergarlick/biz-plans/
├── README.md
└── YYYY/
    └── MM/
        └── DD/
            ├── opportunity-001.md
            └── opportunity-002.md
```

## Plan Format

Each opportunity plan includes:

```markdown
# Opportunity: [Name]

## Summary
One-line description of the opportunity.

## Why It's Viable
Why this can be built solo and shipped.

## What To Build
Concrete deliverables.

## How To Validate
How to test the idea with minimal effort.

## Effort Estimate
Low / Medium / High

## Priority
High / Medium / Low

## Notes
Additional thoughts.
```

## Trigger

Runs after each briefing cron — as a chained follow-up subagent.

## Scripts

- `analyze-briefings.js` — reads latest briefing, identifies opportunities
- `write-plan.js` — writes a plan to biz-plans repo
- `push-plan.js` — clones biz-plans, commits plan, pushes

## GitHub

- Plans repo: `tylergarlick/biz-plans`
- Token: `ghp_REDACTED_OLD_TOKEN`
- All contributions from Tyler Garlick

## Integration with Briefing

The briefing cron spawns a biz-ops subagent after the briefing is pushed:
```
Briefing cron → Briefing subagent → Biz-ops subagent → Plan pushed
```
