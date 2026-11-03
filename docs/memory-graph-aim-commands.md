# Memory Graph + AIM Commands (Documentation)

## Memory Graph Commands
- `memoryGraph.add(world, label, level, provenance[])` — add a knowledge record.
- `memoryGraph.markUnknown(world, label, provenance[])` — add `[UNKNOWN]` record.
- `memoryGraph.drop(world, label)` — remove a record; returns boolean.
- `memoryGraph.export()` → JSON export.
- `memoryGraph.import(data)` — restore graph.
- `ABL.merge(mode, a, b)` / `ABL.without(items, coll)` — combine/dedup knowledge.
- `ABQ.decompose()` — split claim into atoms.
- `ABQ.reconcile(items)` — cross-link observation sets.

### Example
```
g = new MemoryGraph()
g.add('planner', 'goal-x', 'KNOWN', ['frame'])
g.markUnknown('planner', 'sync-latency', ['bench'])
...
g.export()
```

## AIM Mission Loop Commands
- `AIM.TARGET(name)` — set mission.
- `AIM.WORK(listUnknowns)` — queue unresolved items.
- `AIM.GOLDEN` — target state when `KNOWNS.count == WORK.count`.
- `MISSION_ACCOMPLISHED OUTPUT` — emit result.
- `ABORT => Authorization` — halt and ask authorized admin.

### Example
```
AIM.TARGET('memory-sync')
AIM.WORK(['latency','dupevents','rollback'])
=> resandles step by step -> mark verified
GOLDEN when each unknown has evidence-backed output.
```

## Notes
- Persistence local first; Nexus shared space for stories.
- All outputs preserve Sol labels + ABL provenance.
- Tests in `mcp/tests/memory-graph*.test.ts`: 9 passing.
MD