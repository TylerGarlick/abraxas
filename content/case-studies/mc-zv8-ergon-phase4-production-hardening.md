# Story: mc-zv8 — Ergon Phase 4: Production Hardening

**Persona:** As a **Platform Engineer**, I want **Ergon to be production-ready with configurable thresholds, retry logic, rate limiting, observability, and circuit breakers**, so that **it handles real-world failure modes gracefully under load**.

**Task:** `mc-zv8`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: Abraxas (src/systems/ergon/)
- Phase 4 — final Ergon phase (after mc-hpl, mc-u5b, mc-dwf)
- Production hardening requirements: thresholds per skill, retry logic, rate limiting, observability hooks, graceful shutdown, persistent retry queue, circuit breakers
- Labels: none

*Unknowns:*
- Current observability — what metrics/traces exist in Abraxas?
- Metrics library in use? (Prometheus? OpenTelemetry? Datadog?)
- What happens during graceful shutdown — in-flight requests? Queued events?
- Persistent retry queue — SQLite? Redis? File-based?
- Circuit breaker state — stored where? Per skill or global?

## Intent (As a / I want / So that)

- **As a:** Platform Engineer
- **I want:** Ergon production-hardened with configurable thresholds per skill, retry logic, rate limiting, observability hooks, graceful shutdown, persistent retry queue, and circuit breakers
- **So that:** it operates reliably under production load and handles failures gracefully

## Gap Analysis

*What are we missing?*
- Metrics/traces schema — what does "good" observability look like for Ergon?
- Alerting — what thresholds trigger pages?
- Deployment strategy — Kubernetes? Docker? Single process?
- Secrets management for production — how are credentials handled?
- Load testing — what traffic patterns should it handle?
- Runbook — what to do when circuit breakers trip?

## Acceptance Criteria (Given / When / Then)

- **Given** a skill is returning errors above the configured threshold
- **When** Ergon routes a verification request
- **Then** the circuit breaker opens and Ergon gracefully degrades without calling the failing skill

- **Given** a verification request fails
- **When** retry logic is configured
- **Then** Ergon retries with exponential backoff up to the configured max attempts

- **Given** Ergon is under high load
- **When** rate limiting is configured
- **Then** it enforces per-skill and global rate limits and queues excess requests

- **Given** a shutdown signal is received
- **When** Ergon is running
- **Then** it stops accepting new requests, completes in-flight work, and drains the retry queue before exiting

- **Given** Ergon is running in production
- **When** observability hooks are configured
- **Then** metrics (request count, latency, error rates) and traces are emitted for monitoring

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
