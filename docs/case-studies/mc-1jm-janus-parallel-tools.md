# Story: mc-1jm — Janus: Parallel Tool Execution

**Persona:** As an **Abraxas User**, I want **Janus to execute independent tools in parallel**, so that **multi-tool tasks complete faster and I get aggregated results with clear error handling**.

**Task:** `mc-1jm`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: Abraxas (src/systems/janus/)
- Janus dispatches verification requests to Ergon
- Currently: sequential execution assumed
- Task: execute independent tools concurrently, aggregate results
- Labels: none

*Unknowns:*
- How tool dependencies are declared — what makes a tool "independent"?
- Current tool execution interface — is there a ToolExecutor abstraction?
- How partial failures should be handled — continue with successful results?
- Result aggregation format — how are tool results ranked/merged?
- Timeout strategy — per-tool timeout vs. global?

## Intent (As a / I want / So that)

- **As a:** Abraxas User
- **I want:** Janus to execute all independent tools concurrently when a task requires multiple tools
- **So that:** multi-tool tasks complete as fast as the slowest tool, not the sum of all tools, with graceful handling of partial failures

## Gap Analysis

*What are we missing?*
- Tool dependency graph — how does Janus know which tools depend on others?
- Concurrency limits — max parallel tool calls to avoid overwhelming downstream services?
- Result ordering — does order matter for aggregation?
- Cancellation — if one tool fails catastrophically, do others continue?
- Timeout propagation — how does timeout affect the aggregated result?

## Acceptance Criteria (Given / When / Then)

- **Given** a task requiring Tool A and Tool B which are independent
- **When** Janus dispatches the task
- **Then** both tools execute concurrently and results are returned when both complete

- **Given** Tool A succeeds but Tool B fails
- **When** Janus aggregates results
- **Then** it returns A's result with a descriptive error for B, not a full failure

- **Given** a tool times out during parallel execution
- **When** the global timeout has not been exceeded
- **Then** the timeout is recorded and other tools continue; aggregate result reflects the timeout

- **Given** 5 independent tools are to be executed
- **When** concurrency limit is 3
- **Then** Janus executes them in two batches (3 + 2) without exceeding the limit

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
