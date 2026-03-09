# Mnemon — Quick Reference

## Commands

| Command | Purpose |
|---------|---------|
| `/mnemon hold` | Register a belief to track |
| `/mnemon revise` | Record a belief revision |
| `/mnemon audit` | Review belief history |
| `/mnemon delta` | Show what changed between versions |
| `/mnemon prompted` | Flag AI-influenced revisions (anti-sycophancy) |
| `/mnemon ledger` | Full belief overview |

## Revision Types

| Type | Meaning |
|------|---------|
| `confirm` | Belief unchanged |
| `strengthen` | Confidence increased |
| `weaken` | Confidence decreased |
| `abandon` | Belief no longer held |
| `revise` | Statement changed |
| `replace` | Replaced by new belief |

## Revision Reasons

| Reason | Meaning |
|--------|---------|
| `AI output` | AI influenced the change |
| `evidence` | New information |
| `reflection` | Your own reasoning |
| `discussion` | Conversation |
| `experience` | Personal experience |

## Risk Assessment (Anti-Sycophancy)

| Factor | Low | Medium | High |
|:---|:---|:---|:---|
| Time after AI | >10 min | 5-10 min | <5 min |
| Revision | confirm | weaken | revise/replace |
| AI position | disagreed | neutral | agreed |
| Confidence | any | weaken | strengthen |

## Quality Targets

| Metric | Good | Warning | Poor |
|:---|:---|:---|:---|
| Prompted % | <33% | 33-50% | >50% |

## Storage

`~/.mnemon/beliefs/{uuid}.json`
