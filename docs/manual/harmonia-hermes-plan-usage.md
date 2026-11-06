# Harmonia, Hermes, and Plan — Usage Guide

## Harmonia (`/harmonia`, aliases: `/abx:harmonia`, `/abraxas:harmonia`)

Composes multiple Abraxas skills into one workflow.

- `/harmonia compose {workflow}` — define a workflow
- `/harmonia sequence` — execute next composed step
- `/harmonia conflict` — detect conflicts before accepting output
- `/harmonia status` — inspect current state

Composition shapes:
- Sequential: `kairos.filter -> logos.map -> agon.debate`
- Parallel: `agon.advocate || agon.skeptic`
- Conditional: `? goal.known -> logos.map : honest.check`
- Fan-out/in: `agon [advocate, skeptic] synthesis`

Storage: `.abraxas/data/harmonia/`

## Hermes (`/hermes`, aliases: `/abx:hermes`, `/abraxas:hermes`)

Tracks multi-agent consensus and divergence.

- `/hermes init {topic}` — open consensus session
- `/hermes add {agent: position}` — add position
- `/hermes consensus` — compute agreement
- `/hermes diverge` — inspect disagreement points
- `/hermes track-record {agent}` — update/view historical accuracy
- `/hermes weight {agent} {score}` — set weight
- `/hermes history` — review past consensus runs

Storage: `.abraxas/data/hermes/`

## Plan (`/plan`, aliases: `/abx:plan`, `/abraxas:plan`)

Converts vague requests into an epistemically labeled specification.

Categories: Goal, Success, Audience, Format, Timeline, Data.

- `/plan start {request}` — open clarity session
- `/plan answer {label: response}` — answer next question
- `/plan skip` — skip a question
- `/plan status` — show progress
- `/plan export` — export final clarity map
- `/plan list` — list sessions
- `/plan clear {session}` — delete a session

Storage: `.abraxas/data/plan/sessions/`

## Suggested Combined Flow

```
/plan start "Add storage migration and aliases"
/harmonia compose migration: plan.export -> agon.debate -> hermes.consensus
/hermes init "Migration readiness"
/hermes add Planner: implementation is scoped
/hermes add Skeptic: test gaps remain
/harmonia sequence
/hermes consensus
/harmonia conflict
```