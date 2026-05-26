# Story: mc-sg0 — Performance Baseline for Claims Processing

**Persona:** As a **Performance Engineer**, I want **performance benchmarks established for claim translation and adjudication**, so that **we can detect regressions and set SLA targets before going to production**.

**Task:** `mc-sg0`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: abraxas
- Targets: claim translation (mc-jyq) and adjudication
- Labels: benchmarking, dev, performance
- Related: all Ergon phases (mc-hpl, mc-u5b, mc-dwf, mc-zv8)

*Unknowns:*
- Current baseline — what are the existing performance characteristics?
- Load testing tool — what framework? (k6? JMeter? Locust?)
- Test data — real claims or synthetic FHIR fixtures?
- Concurrent user count target — what production load should it handle?
- p50/p95/p99 latency targets?
- Throughput target (claims per second)?

## Intent (As a / I want / So that)

- **As a:** Performance Engineer
- **I want:** performance benchmarks established for claim translation and adjudication
- **So that:** we can detect regressions in CI, set SLA targets, and validate production readiness

## Gap Analysis

*What are we missing?*
- Existing performance tests — are there any benchmarks already?
- What environment for benchmarking — local, staging, dedicated perf environment?
- Baseline data — what does "normal" look like today?
- SLA targets — what are the business requirements for latency/throughput?
- Resource monitoring — CPU, memory, database during load tests?
- Bottleneck identification — is the claim translation or adjudication the constraint?

## Acceptance Criteria (Given / When / Then)

- **Given** performance benchmarks are established
- **When** a developer runs the benchmark suite
- **Then** it reports p50, p95, p99 latency and throughput for claim translation and adjudication

- **Given** a performance regression is introduced
- **When** CI runs with benchmarks enabled
- **Then** it fails and alerts if latency or throughput degrades beyond configured thresholds

- **Given** benchmarks run under production-like load
- **When** results are collected
- **Then** we have clear SLA targets and can measure actual vs. target

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
