# Token Tracking System

> Track context usage to prevent running out

## How to Check

Run `/status` or use `session_status` tool to see:
- Tokens: 82k in / 432 out (current session total)
- Context: 41k/200k (21% of window)

## Thresholds

| Context % | Action |
|:---|:---|
| >60% | Note in replies |
| >75% | Warn user |
| >85% | Suggest compaction |

## Current Session (2026-03-14)

- Time: 00:29 UTC
- Context: 21% (41k/200k)
- Status: Healthy

## Session Log

| Date | Session ID | Turns | Outcome |
|:---|:---|:---|:---|
| 2026-03-14 | (previous) | ~30+ | Ran out of context |
| 2026-03-14 | agent:main:main | ~25 | Hit limit again (03:43 UTC) |