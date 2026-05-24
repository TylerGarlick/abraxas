# Technical Specification: Quest-Trigger Bridge

## 1. Overview
The **Quest-Trigger Bridge** is an automation layer designed to connect the epistemic signals of the `janus-system` (specifically the `[UNKNOWN]` marker) with the orchestration capabilities of the `research-assistant` skill.

The goal is to transform a passive epistemic admission ("I don't know this") into an active research operation ("I will find this out"), reducing the friction between identifying a knowledge gap and initiating the process of filling it.

## 2. The Trigger: `[UNKNOWN]` Markers
Within the `janus-system`, the **SOL (Waking Face)** uses the `[UNKNOWN]` label when it cannot provide a sourced, verifiable answer without fabricating.

### Trigger Condition
A "Quest" is triggered when:
1. The active face is **SOL**.
2. The output contains the `[UNKNOWN]` marker.
3. The `[UNKNOWN]` marker is associated with a specific, identifiable topic or query (e.g., `[UNKNOWN]: The specific thermal expansion coefficient of alloy X`).

## 3. The Bridge Logic (The Orchestrator)
The Bridge acts as a listener/interceptor between the Janus output and the final delivery to the user.

### Logic Flow
1. **Detection**: Scan Sol's output for `[UNKNOWN]`.
2. **Extraction**: Isolate the topic/query following the `[UNKNOWN]` marker.
3. **Contextualization**: Identify the current project or session context (via `~/.janus/ledger.md` or active session state).
4. **Action Initiation**: Automatically spawn a `research-assistant` subagent to resolve the gap.

### Trigger Command Mapping
The bridge will translate the `[UNKNOWN]` event into a structured task for the research-assistant:
`Task: research-assistant: /research start [Topic from UNKNOWN] && /research add [Relevant Context/Initial Leads]`

## 4. Implementation Architecture

### Component A: The Marker Listener (Interceptor)
- **Type**: Post-processing hook or wrapper around Janus output.
- **Function**: Regular expression match for `\[UNKNOWN\]:?\s*(.*)`.
- **Output**: A `QuestObject` containing `{topic: string, session_id: string, timestamp: date}`.

### Component B: The Subagent Spawner (Bridge)
- **Type**: Integration script.
- **Function**: Takes the `QuestObject` and constructs a `Task:` prompt for OpenClaw.
- **Prompt Template**: 
  `Task: research-assistant: Resolve epistemic gap identified by Janus SOL. Topic: {{topic}}. Initialize a new research project to verify and document this information.`

### Component C: The Feedback Loop (Closure)
- **Function**: Upon completion of the `research-assistant` task, the result is piped back to the Janus Epistemic Ledger (`~/.janus/ledger.md`).
- **Update**: The `[UNKNOWN]` mark for that topic is updated to `[KNOWN]` or `[INFERRED]` based on the research findings.

## 5. Failure Modes & Safeguards
- **Trigger Storms**: To prevent spawning 10 subagents for 10 unknown facts in one response, the Bridge will batch multiple `[UNKNOWN]` marks into a single "Research Sprint" project.
- **Triviality Filter**: The Bridge will ignore `[UNKNOWN]` markers for trivial or non-researchable queries (e.g., "I don't know what you're thinking").
- **Human-in-the-Loop**: The Bridge will notify the user: *"Janus SOL identified an unknown. I've spawned a Research Assistant to track this down. [Link to Task]"*

## 6. Definition of Done (DoD)
- [ ] Technical spec finalized.
- [ ] Regex/Extraction logic defined.
- [ ] Task prompt templates established.
- [ ] Ledger update flow mapped.
