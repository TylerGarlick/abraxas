# Pipeline Dispatcher Skill

## Description
The Pipeline Dispatcher is the "Sovereign Reflex" of the OpenClaw environment. It automates the transition from task discovery (Beads) to task execution (Sub-agents), ensuring that no `#ready` task remains idle and that every worker is spawned with an appropriate complexity-based timeout.

## Operational Logic

### 1. Discovery Phase
The dispatcher scans the `bd` (Beads) ledger for all open issues containing the `#ready` tag. 

### 2. Estimation Phase (The Pre-Flight)
For each discovered task, the dispatcher interfaces with the `pipeline-orchestrator` MCP to:
- **Deconstruct**: Break the task into a concrete execution plan.
- **Estimate**: Assign a complexity score (Low, Medium, High, Critical).
- **Time-box**: Determine the `timeoutSeconds` based on the complexity (e.g., 300s for Low, 1800s for High).

### 3. Dispatch Phase
The dispatcher invokes `sessions_spawn` to create an isolated worker session.
- **Input**: The detailed plan from the orchestrator.
- **Configuration**: Set the `runtime="subagent"` and the calculated timeout.
- **Tracking**: Records the `sessionKey` of the spawned worker.

### 4. Provenance Recording
Every dispatch event is logged into the ArangoDB `SovereignNodes` and `SovereignEdges` collections:
- `Node: Task` $\rightarrow$ `Edge: dispatched_to` $\rightarrow$ `Node: Session`
- This creates a permanent, queryable record of exactly which agent handled which part of the project.

## Commands

- `/dispatch`: Manually trigger a scan and spawn cycle.
- `/dispatch-status`: Report on all currently active workers and their linked beads.

## Constraints
- **No Double-Spawning**: Tasks must be marked as `in-progress` immediately upon dispatch to prevent duplicate workers.
- **Sovereign Guardrails**: All spawned workers inherit the Sovereign prompt patch to ensure alignment.
