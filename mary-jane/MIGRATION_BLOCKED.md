# Migration Blocked — Exec Allowlist

**Date:** 2026-04-02
**Status:** BLOCKED — exec allowlist prevents all git/openclaw/dolt/bd operations

## What's Done
- FHIR adapter: 9 files written to `/tmp/abraxas-checkout/adapters/fhir/`
- Claim translation: 3 files written to `/tmp/abraxas-checkout/adapters/claim-translation/`
- MC_MIGRATION_REPORT.md: written
- `/tasks` board: 18 tasks migrated from Beads

## What's Blocked
1. Git branch `feat/fhir-adapter` not created (still on main)
2. Git push denied — `git` not in exec allowlist
3. `/tasks` CLI commands denied — `openclaw` not in exec allowlist
4. Beads operations denied — `dolt`, `bd` not in exec allowlist

## Root Cause
```
exec denied: allowlist miss
```
All commands that would make progress require exec access that isn't allowlisted.

## Fix Required
T must run:
```bash
openclaw gateway config set exec.allowlist --add git
```

## After Fix — Next Steps
1. Create git branch: `git checkout -b feat/fhir-adapter`
2. Commit: `git add adapters/fhir/ adapters/claim-translation/ && git commit -m "feat: implement EHR integration adapters"`
3. Push: `git push origin feat/fhir-adapter`
4. Create native `/tasks` for remaining EHR work
5. Close Beads tasks via `bd close <id>`

## Files Confirmed Written (via read tool)
- `/tmp/abraxas-checkout/adapters/fhir/fhir-adapter.ts` ✅
- `/tmp/abraxas-checkout/adapters/fhir/fhir-normalizer.ts` ✅
- `/tmp/abraxas-checkout/adapters/fhir/fhir-adapter.test.ts` ✅
- `/tmp/abraxas-checkout/adapters/fhir/index.ts` ✅
- `/tmp/abraxas-checkout/adapters/fhir/README.md` ✅
- `/tmp/abraxas-checkout/adapters/fhir/mock-fhir-payloads.json` ✅
- `/tmp/abraxas-checkout/adapters/fhir/providers/epic.ts` ✅
- `/tmp/abraxas-checkout/adapters/fhir/providers/cerner.ts` ✅
- `/tmp/abraxas-checkout/adapters/fhir/providers/meditech.ts` ✅
- `/tmp/abraxas-checkout/adapters/claim-translation/claim-translator.ts` ✅

## Beads Status
- 29 tasks total in `mc/.beads/beads.csv`
- 11 closed (mc-ab1, mc-ab2, mc-ab3, mc-ab4 + others)
- 5 in_progress
- 13 open
- Cannot close any via AI — exec block on `bd` command
