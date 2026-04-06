# Secrets — Long-Term

**All secrets now live in `workspace/skills/secrets-manager/` (AES-256-GCM encrypted). Master key in `MJ_MASTER_KEY` env var.**

## Stored Secrets

| Skill | Secret | Status |
|-------|--------|--------|
| `mission-control` | `github-token` | ⚠️ REVOKED — T needs to generate new PAT |
| `mission-control` | `vercel-token` | ✅ Active |
| `briefing` | `brave-api-key` | ✅ Active |

## Master Key

- **Env var:** `MJ_MASTER_KEY`
- **Location:** `/home/ubuntu/.openclaw/workspace/mission-control/secrets/secrets-master.key`
- **Set in:** `~/.bashrc`, `~/.profile`
- **Generated:** 2026-04-01

## To Add/Update a Secret

```bash
export MJ_MASTER_KEY=<key>
cd /home/ubuntu/.openclaw/workspace/skills/secrets-manager
node scripts/secrets-manager.js add <skill> <name> <value> <reason>
```

## To Rotate

```bash
node scripts/secrets-manager.js rotate <skill> <name> <newValue>
```

## Critical

- **Never print secret values** — not to user, not in logs
- **Never commit `secrets-store.json`** — in `.gitignore`
- **Losing MJ_MASTER_KEY = losing all secrets permanently**

## Migration Status

- ✅ GitHub token — moved from MEMORY.md → secrets store (but token revoked)
- ✅ Brave API key — moved from MEMORY.md → secrets store
- ✅ Vercel token — added to secrets store
