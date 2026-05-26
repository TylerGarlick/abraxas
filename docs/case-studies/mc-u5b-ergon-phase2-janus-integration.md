# Story: mc-u5b — Ergon Phase 2: Janus Integration

**Persona:** As an **Abraxas Developer**, I want **Ergon to emit verificationRequested events that Janus listens for**, so that **claims and assertions flow through the verification pipeline correctly**.

**Task:** `mc-u5b`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: Abraxas (src/systems/ergon/ and src/systems/janus/)
- Phase 2 of Ergon — builds on Phase 1 (mc-hpl)
- Ergon receives claims/assertions
- Ergon emits verificationRequested events
- Janus listens and dispatches verification back to Ergon
- Labels: none

*Unknowns:*
- Event system — what library/pattern is used? (Node EventEmitter? A message bus? Redis?)
- Event payload schema — what does verificationRequested look like?
- Janus ↔ Ergon bidirectional communication — how does verification get routed back?
- ergon-janus-bridge — this task description mentions it; what is its scope?
- Testing — can we test event flow without full system?

## Intent (As a / I want / So that)

- **As a:** Abraxas Developer
- **I want:** Ergon to emit verificationRequested events that Janus listens for, and a bridge component for ergon-janus communication
- **So that:** claims and assertions flow through the verification pipeline with proper event-driven architecture

## Gap Analysis

*What are we missing?*
- Event schema — exact format of verificationRequested event payload
- Janus event handling — what events does it listen for and how does it respond?
- Backpressure — what if Janus can't keep up with Ergon events?
- Error handling in event chain — Ergon → Janus → back to Ergon — how are failures propagated?
- Dead letter queue or retry mechanism for failed event deliveries?
- Monitoring — are events traced for observability?

## Acceptance Criteria (Given / When / Then)

- **Given** Ergon receives a new claim
- **When** it needs verification
- **Then** it emits a verificationRequested event with the claim context

- **Given** Janus receives a verificationRequested event
- **When** it processes it
- **Then** it dispatches verification and returns the result to Ergon

- **Given** the ergon-janus-bridge is in place
- **When** Ergon and Janus communicate
- **Then** events flow correctly in both directions with proper error handling

- **Given** Janus is unavailable or errors during verification
- **When** Ergon has sent a verificationRequested
- **Then** Ergon handles the error gracefully and can retry or escalate

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
