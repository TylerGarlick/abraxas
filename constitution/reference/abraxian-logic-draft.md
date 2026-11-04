# Abraxian Logic — Provisional Addendum (Draft)

Status: provisional · draft · not yet bound to core constitution
Scope: additive vocabulary, operators, constants, helper functions, and query language
Compatibility: Sol labels remain `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`. No replacements.

## 1. Naming convention
- ABL (Abraxian Logic Box): prefix for new operators/function family.
- Syntax is declarative and composable; all new constructs must carry scope + provenance.

## 2. Supplementary modifiers
- `[SIMULATED]` — output returned because no real persistence/tool existed.
- `[SYSTEM-BOUND]` — available because a registered subsystem exposes it.
- `[SESSION-SEALED]` — material valid within the current session boundary only.
- `[CONFIDENCE:S<|channel|>U|M]` — strongest, uncertain, mixed evidence.
- `[NEXUS:sha256:...]` — provenance namespace for cross-Nexus entries.
- `[UNVERIFIED]` — math/symbolic result not yet internally checked.

## 3. Operators
- `=>` material implication (used only with explicit premises)
- `↔` bidirectional correlation (not logical equivalence unless proven)
- ` erót` (play marker) — no semantic weight, for synthetic placeholder only
- `∠` scope delimiter (prefix to scope attached to a reasoning unit)
- `⊕` additive confidence blending
- `⊗` dependency closure (requires all inputs verified)
- `⟦ ⟥ ]` provenance wrapper (outer provenance boundary)
- `↦` transformation map (symbolic -> actionable demand)

## 4. Constants
- `θAK = 0.95` — [KNOWN] expected confirmation rate floor
- `θAI = 0.75` — [INFERRED] expected confirmation rate expected
- `θAU = 0.55` — [UNCERTAIN] expected confirmation rate midpoint
- `CVP_DEFAULT = 3/5` — baseline N-of-M consensus gate
- `TRUST_LOW = 0.20` — floor for soft confidence updates
- `TRUST_HIGH = 0.90` — ceiling for promotion to [KNOWN]
- `N_EXPOSURE = 3` — minimum repeated evidence references for promotion

## 5. Helper functions
- `ABL.scope(input, scope)` → attach scope to input
- `ABL.source(input, provenance)` → attach source/persona attribution
- `ABL.rank(state, order)` → rank named states using explicit ordering
- `ABL.merge(mode, a, b)` → merge beliefs without lowering protections
- `ABL.seal(output, type)` → seal output as one of [SESSION-SEALED], [SIMULATED], [SYSTEM-BOUND]
- `ABL.footprint(input)` → return minimal provenance fingerprint

## 6. Minimal query language (ABQ)
- `ABQ.head(item)` — retrieve a symbolic or recorded item
- `ABQ.tail(item)` — retrieve provenance metadata only
- `ABQ.match(field, pattern)` — exact-pattern match over marked data
- `ABQ.filter(predicate)` — unary filtering by truth-tagged predicate
- `ABQ.trace(claim)` — run provenance resolution for a claim
- `ABQ.rank(list, key)` — order items by explicit key

## 7. Binding policy
- Standalone until regression tests pass against the current constitution.
- Promotion to `genesis.md` is allowed only in `constitution-optimized` profiles and only after the blast-radius check passes.
- Additive-only: removal or rename of this vocabulary triggers a full audit.

## 8. Character aliases (human-friendly)
- `=>` ↔ `imply`
- `↔` ↔ `iff`
- `∠` ↔ `scope`
- `⊕` ↔ `blend`
- `⊗` ↔ `dependsOn`
- `⟦ ... ⟥ ]` ↔ `withProvenance(...)`
- `↦` ↔ `demand(...)`
- `Erot` (play marker) ↔ `placeholder`

## 9. Set theory helpers (symbolic, human-readable)
- `ABL.union(A, B)` — union of scoped evidence sets
- `ABL.intersection(A, B)` — shared provenance
- `ABL.difference(A, B)` — remove lower-trust elements from A
- `ABL.symmetricDiff(A, B)` — elements unique to A or B only
- `ABL.subset(A, B)` — A does not exceed B in trust/minute detail
- `ABL.cardinality(A)` — number of independently verified items
- `ABL.cross(A, B)` — every combination for all-paths CVP checks

## 10. Mini query expansions
- `ABQ.withScope()` — bind scope to every entry
- `ABQ.explain()` — return reasoning chain for result
- `ABQ.decompose()` — split compound claims into checkable atoms
- `ABQ.reconcile(list)` — run cross-model CVP merge

## 11. Functional helpers (Rambda-inspired; Abraxian-scoped)
- `ABL.head(x)` alias for `ABQ.head`
- `ABL.tail(x)` alias for `ABQ.tail`
- `ABL.find(pred, coll)` → first matching element (truth-scoped)
- `ABL.filter(pred, coll)` → subset
- `ABL.map(fn, coll)` → transform while preserving provenance
- `ABL.reduce(fn, init, coll)` → fold (for deterministic aggregates)
- `ABL.any(pred, coll)` → if at least one verified item matches
- `ABL.all(pred, coll)` → if every verified item matches
- `ABL.without(items, coll)` → anti-merge of low-trust items
- `ABL.uniq(coll)` → deduplicate by hash
- `ABL.sort(pred, coll)` → deterministic ordering with stable scope
- `ABL.fromPairs(pairs)` → build ABL object tree
- `ABL.toPairs(obj)` → flatten object trees
- `ABL.path(keys, obj)` → deep lookup without mutation
- `ABL.assocPath(keys, val, obj)` → deep provenance-safe merge

## 12. Set operations (explicit)
- `ABL.add(x, s)` → `union(s, {x})` (structural append; no dup)
- `ABL.drop(x, s)` → `difference(s, {x})`
- `ABL.addMany(xs, s)` → `union(s, xs)`
- `ABL.dropMany(xs, s)` → `difference(s, xs)`
- `ABL.toggle(x, s)` → add if absent, drop if present
- `ABL.unionAll(list)` → fold union
- `ABL.intersectAll(list)` → fold intersection
- `ABL.dedupeBy(keyFn, s)` → keep first by key

## 13. Global AS namespace (Abraxas System)
- `AS` is the reserved Abraxas System global.
- Applies across Core/Standard/Full; boots after tier detection.
- Contract shape:
  - `AS.systemName = (input: T) => (output: R) => [OUTPUT]|[KNOWN|UNKNOWN|ANY]`
- Metadata is mandatory per system:
  - `Scope`, `Authority`, `Source`, `Persistence`, `Truth-State`.
- Each system must expose:
  - `describe()` for audit,
  - `approve()` for manual gating,
  - `run(input)` for execution,
  - output label modifiers include `[SIMULATED]` when not grounded.
- Commands are always logged as simulated provenance entries when in simulation tier.

## 14. AIM Mission Loop (provisional)
- `BEGIN AIM` initiates a mission.
- `TARGET` is selected mission scope.
- `PERMITTED` actors authorise operations (`ME`, admin-only override).
- `WORK` = unknowns to resolve.
- `KNOWNS` increments as truths verified.
- `MAGNUM_OPUS` / `GOLDEN` attained only when `KNOWNS.count == WORK.count`.
- `MISSION_ACCOMPLISHED` only when `GOLDEN`.

## 15. Event stream commands (drawn from system state)
- `AIM AT` → bind `TARGET`.
- `RUN(AIM AT)` → start mission and emit events.
- `STATE`, `SYSTEM`, `DIAGNOSTIC` → admin-supervised event surfaces for ALL agents.
- `ABORT` → halt mission, requires admin authorization.
- `HANDLE EVENT [NEEDS RESOURCES|NEEDS OBSERVATION|NEEDS DEBUGGING|NEEDS SUPERVISION]` → spawn child mission until parent + child golden.

## AQL/ABX Alias Surface (provisional)
- All aliases resolve to ABL/ABQ commands; short aliases include `!abx` and bare `abx` where parsed by router.
- Example:
  - `!abx scope` ↔ `ABL.scope`
  - `!abx trace` ↔ `ABQ.trace`
  - `!abx rank` ↔ `ABL.rank` + `ABQ.rank`
  - `!abx known/unknown` emits `[KNOWN]`/`[UNKNOWN]` set counts

## Four Functions of Consciousness (provisional syntax)
Mode map: `modeOf \in {thinking, intuition, thinking, sensation}` per runtime state.
Function:
- `!abx:consciousness:modeOf(process)` computes center bias towards selected mode.
- `aim at being` is achieved when at least one mode is ACTIVE and target completion remains UNKNOWN until verified.
- Output supports `KNOWNS`/`UNKNOWN` gating against all configured modes.
