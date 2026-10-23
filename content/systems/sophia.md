# Sophia Meta-Cognitive Routing

## Overview
Sophia is the meta-cognitive layer of the Sovereign Brain. While Sovereign-Flow handles the 'how' of execution, Sophia handles the 'why' and 'where' of routing. 

In the current implementation, Sophia is powered by the `SovereignOrchestrator`, which coordinates the interplay between the Tension Monitor, the Epistemic Gate, and Sovereign Revision to maintain the brain's epistemic alignment.

## Capabilities
- **Complexity Analysis**: Analyzes a request to determine if it requires a simple retrieval or a recursive 'Quest' for missing evidence.
- **Capability Mapping**: Routes requests to the specific model or tool best suited for the epistemic lens required (e.g., routing a mathematical claim to the Logos-Math skill).
- **Resource Optimization**: Prevents the 'orchestration tax' by bypassing unnecessary layers for trivial queries.
- **Tension-Based Routing**: Uses the `TensionMonitor` to analyze output dissonance. If 'Sovereign Static' is detected, Sophia triggers a 'Hunt' for missing evidence; if 'Chaos' is detected, it triggers a Hard Reset to prevent epistemic drift.

## Goal
To maximize the efficiency of the Sovereign Brain by ensuring every token spent is aligned with the complexity of the problem and the stability of the sovereign anchors.