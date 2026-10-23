---
name: secrets-manager
description: |
  Manages encrypted secrets, API keys, tokens, and credentials. All secrets are encrypted at rest using AES-256-GCM, with per-skill scoping, audit logging, and zero-rewriting rotation. MJ reads secrets internally but they are NEVER visible to end users. Triggers: "MJ add secret", "MJ rotate secret", "MJ secret", "secrets manager", "add api key".
---

# SKILL.md — Secrets Manager

## Purpose

Securely stores and manages secrets — API keys, tokens, credentials — used by Mission Control skills and cron jobs. Secrets are:
- **Encrypted at rest** (AES-256-GCM)
- **Per-skill scoped** — each skill has its own namespace
- **Audited** — every access is logged with timestamp, caller, reason
- **Rotatable** — rotate without rewriting any skill code

## Architecture

```
`.abraxas/secrets-manager/
  secrets-store.json       ← encrypted secrets (never exposed)
  secrets-master.key      ← master encryption key (never in git)
  secrets-audit.log       ← audit trail
  secrets-config.json     ← per-skill key mappings
```

## Master Key

Generated once and stored ONLY in the environment variable `MJ_MASTER_KEY`.
If lost, all secrets are unrecoverable.

## Secret Store Schema

```json
{
  "version": "1.0.0",
  "secrets": {
    "skill-name:secret-name": {
      "iv": "base64-iv",
      "tag": "base64-auth-tag",
      "ciphertext": "base64-encrypted-value",
      "rotations": 0,
      "created": "ISO-8601",
      "lastRotated": "ISO-8601"
    }
  }
}
```

## Per-Skill Scoping

Format: `skill-name:secret-name`

Examples:
- `github-factory:token`
- `briefing:brave-api-key`
- `:github-token`

## Audit Log Schema

```json
{
  "timestamp": "ISO-8601",
  "action": "read|write|rotate|delete",
  "skill": "skill-name",
  "secret": "secret-name",
  "caller": "session-id or cron",
  "reason": "why it was accessed"
}
```

## Scripts

- `secrets-manager.js` — main CLI: add, get, rotate, delete, list, audit
- `encrypt-secret.js` — encrypt a secret and store it
- `decrypt-secret.js` — decrypt a secret for internal use
- `rotate-secret.js` — rotate without rewriting caller code

## Usage

```bash
# Add a secret
cd .abraxas/secrets-manager
node scripts/secrets-manager.js add <skill> <name> <value> <reason>

# Read a secret (returns to MJ only, never to user)
node scripts/secrets-manager.js get <skill> <name>

# Rotate a secret
node scripts/secrets-manager.js rotate <skill> <name> <newValue>

# List secrets (names only, no values)
node scripts/secrets-manager.js list <skill>

# Audit log
node scripts/secrets-manager.js audit <skill> <name>
```

## Secret Migration

Existing plain-text secrets in MEMORY.md should be migrated:
- GitHub Token: `ghp_REDACTED_OLD_TOKEN`
- Brave Search API Key: `BSAoUT58YOXZsPs6xtGto3PL-RxHfr6`

## Critical Rules

1. **MJ NEVER prints secret values** — even if T asks directly, respond "I don't display secrets"
2. **All secret access is audited** — every get/write/rotate is logged
3. **Master key must be set** — if `MJ_MASTER_KEY` is missing, secrets cannot be accessed
4. **Rotate don't rewrite** — when a secret rotates, only update the store, never the calling code
