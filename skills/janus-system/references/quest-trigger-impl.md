# Implementation Plan: Quest-Trigger Prototype

## 1. Phase 1: The Detector (Regex & Extraction)
We need a utility script that can be called post-Janus execution to identify gaps.

**Proposed Tool: `quest-detector.sh`**
```bash
#!/bin/bash
# Simple extractor for [UNKNOWN] patterns
input_file=$1
grep -oP "\[UNKNOWN\]:?\s*\K.*" "$input_file" | while read -r line; do
    echo "QUEST_FOUND: $line"
done
```

## 2. Phase 2: The Bridge (Task Generator)
A Python or Node script that takes the output of the detector and generates the OpenClaw `Task:` command.

**Proposed Tool: `quest-bridge.py`**
```python
import sys
import subprocess

def spawn_research_task(topic):
    prompt = f"Task: research-assistant: Resolve epistemic gap identified by Janus SOL. Topic: {topic}. Initialize a new research project to verify and document this information."
    # In a real OpenClaw env, this would be sent via the internal API or a shell command if supported
    # For the prototype, we write it to a 'pending_tasks.log' or execute via 'exec'
    with open("/root/.openclaw/workspace/pending_tasks.log", "a") as f:
        f.write(f"{prompt}\n")
    print(f"Bridge: Spawned research task for '{topic}'")

if __name__ == "__main__":
    for line in sys.stdin:
        if "QUEST_FOUND:" in line:
            topic = line.replace("QUEST_FOUND: ", "").strip()
            spawn_research_task(topic)
```

## 3. Phase 3: Integration into Janus Workflow
The ideal integration is a wrapper around the Janus skill execution.

**Proposed Workflow:**
1. `run_janus.sh` executes the Janus logic.
2. `run_janus.sh` pipes output to `quest-detector.sh`.
3. `quest-detector.sh` pipes to `quest-bridge.py`.
4. `quest-bridge.py` logs/triggers the `Task:`.

## 4. Phase 4: Ledger Synchronization
Once the `research-assistant` task is marked `closed` (via the OpenClaw task system):
1. A hook triggers a search in `~/.janus/ledger.md` for the corresponding `[UNKNOWN]` mark.
2. The mark is updated: `[UNKNOWN] -> [KNOWN]`.
3. The research project ID and summary are appended to the ledger entry.

## 5. Prototype Execution Roadmap
1. **Week 1**: Deploy `quest-detector` and `quest-bridge` as standalone scripts.
2. **Week 2**: Implement the `pending_tasks.log` watcher to actually spawn subagents.
3. **Week 3**: Build the ledger-sync loop.

## 6. Verification Plan (Testing the Prototype)
- **Test Case A**: Input a query known to be outside Janus SOL's training/context.
- **Expected Result**: 
    - Output contains `[UNKNOWN]: <Topic>`.
    - `pending_tasks.log` contains a `Task: research-assistant` entry for `<Topic>`.
    - A subagent is spawned.
- **Test Case B**: Input a query with multiple `[UNKNOWN]` markers.
- **Expected Result**: Multiple tasks spawned or a single batched research project created.
