# iCloud+ IMAP/SMTP Synchronization Bridge

## Overview

This implementation provides a secure bridge for syncing with Tyler's iCloud+ account (`tyler@hebros.us`) using the `mj@hebros.us` alias for outgoing mail.

## Files

- `icloud_sync.py` - Main synchronization script
- `icloud_config.json` - Configuration file
- `scripts/setup_icloud_secret.sh` - Secret setup helper
- `mail/drafts/` - Draft emails awaiting approval
- `logs/icloud-sync.log` - Sync activity logs

## Setup

### 1. Add iCloud App-Specific Password

Before using the sync bridge, you must add your iCloud app-specific password to the secrets manager:

```bash
# Option A: Use the setup script
bash /root/.openclaw/workspace/projects/mary-jane/scripts/setup_icloud_secret.sh

# Option B: Direct command
cd /root/.openclaw/workspace/skills/secrets-manager
node scripts/secrets-manager.js add icloud app-specific-password "<your-app-password>" "iCloud sync bridge"
```

**To get an app-specific password:**
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in with `tyler@hebros.us`
3. Navigate to **Sign-In and Security**
4. Click **Generate Password** under App-Specific Passwords
5. Label it "Mary Jane Sync" and copy the generated password

### 2. Verify Connection

```bash
python3 /root/.openclaw/workspace/projects/mary-jane/icloud_sync.py verify
```

This tests both IMAP and SMTP connectivity and logs results to `logs/icloud-sync.log`.

## Usage

### Fetch Recent Emails

```bash
# Fetch 10 most recent (default)
python3 icloud_sync.py fetch

# Fetch specific number
python3 icloud_sync.py fetch 25
```

### Create Draft Email

```bash
python3 icloud_sync.py draft "recipient@example.com" "Subject Line" "Email body text"
```

This creates:
- `.eml` file with the email content
- `.metadata.json` file with draft metadata

Drafts are saved to `/root/.openclaw/workspace/projects/mary-jane/mail/drafts/`

### Send Draft (Requires Approval)

```bash
python3 icloud_sync.py send /path/to/draft.eml
```

**⚠️ CRITICAL:** This requires typing `APPROVE` at the prompt. The script will NOT send without explicit confirmation.

## Compliance Rules

This implementation strictly follows the iCloud+ Operational Rules:

1. **NO DELETIONS** - The code contains ZERO deletion logic. IMAP operations are read-only.
2. **SEND APPROVAL** - SMTP send requires explicit `APPROVE` confirmation.
3. **DRAFT MODE** - Default behavior saves drafts to file, not send.
4. **ALIAS USAGE** - All outgoing mail uses `mj@hebros.us` in the From header.

## Security

- App-specific password stored encrypted via Secrets Manager (AES-256-GCM)
- Password never logged or displayed
- Audit trail for all secret access
- IMAP connections use readonly mode for inbox access

## Troubleshooting

### "Could not retrieve app-specific password"

Run the setup script to add the secret:
```bash
bash /root/.openclaw/workspace/projects/mary-jane/scripts/setup_icloud_secret.sh
```

### IMAP/SMTP Authentication Failed

- Verify app-specific password is correct (not your regular Apple ID password)
- Check that two-factor authentication is enabled on the Apple ID
- Ensure the app-specific password hasn't expired

### Connection Timeout

- Check network connectivity to `imap.mail.me.com` and `smtp.mail.me.com`
- Verify ports 993 (IMAP) and 587 (SMTP) are not blocked by firewall

## Log Files

All operations are logged to:
```
/root/.openclaw/workspace/projects/mary-jane/logs/icloud-sync.log
```

Check this file for detailed error messages and connection status.
