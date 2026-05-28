---
name: gmail
slug: gmail
version: 1.0.0
description: Gmail integration for fetching, reading, sending, searching, and managing emails via IMAP/SMTP. Retrieves credentials from Secrets Manager. Triggers: "check email", "read my email", "send email", "search emails", "gmail".
---

## Overview

Gmail skill providing CLI-based email operations via IMAP (fetch/read/search) and SMTP (send). All credentials are retrieved securely from the Secrets Manager.

## Capabilities

| Action | Command | Description |
|--------|---------|-------------|
| Fetch | `fetch` | List recent emails with subjects and senders |
| Read | `read <email_id>` | Retrieve full body of a specific email |
| Send | `send` | Send an email via SMTP |
| Search | `search <query>` | Search for emails based on a query |
| Mark Read | `mark_read <email_id>` | Mark an email as read |

## Prerequisites

### Gmail Account Setup

1. **Enable IMAP/SMTP** in Gmail settings:
   - Go to Gmail Settings → Forwarding and POP/IMAP
   - Enable "IMAP Access"

2. **Use App Password** (if 2FA is enabled):
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Store this password in Secrets Manager (see below)

### Secrets Manager Setup

Add your Gmail credentials to the Secrets Manager:

```bash
# Add Gmail password (app password recommended)
MJ_MASTER_KEY="0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs=" \
  node /root/.openclaw/workspace/secrets/add-secret.js \
  gmail password "YOUR_GMAIL_APP_PASSWORD" "Gmail IMAP/SMTP access"
```

**Secret Key Format:** `gmail:password`

## Usage

### Fetch Recent Emails

List the 10 most recent emails:

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py fetch
```

With custom count:

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py fetch --count 25
```

Output includes:
- Email ID (for read/mark_read operations)
- Subject
- Sender
- Date
- Read/unread status

### Read Email

Read a specific email by ID:

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py read <email_id>
```

Example:
```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py read 12345
```

Output includes:
- Full headers (From, To, Subject, Date)
- Email body (plain text or HTML)
- Attachments list (if any)

### Send Email

Send an email via SMTP:

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py send \
  --to recipient@example.com \
  --subject "Your Subject" \
  --body "Email body text" \
  --cc optional@example.com \
  --bcc another@example.com
```

**Required flags:** `--to`, `--subject`, `--body`

**Optional flags:** `--cc`, `--bcc`, `--attachments` (comma-separated paths)

### Search Emails

Search for emails using Gmail's search syntax:

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py search "from:boss@example.com"
```

Common search queries:
- `from:email@example.com` - Emails from specific sender
- `to:email@example.com` - Emails sent to specific recipient
- `subject:keyword` - Emails with keyword in subject
- `has:attachment` - Emails with attachments
- `is:unread` - Unread emails only
- `after:2024/01/01` - Emails after a date
- `before:2024/12/31` - Emails before a date
- `label:important` - Emails with specific label

With custom count:
```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py search "project update" --count 20
```

### Mark Email as Read

Mark a specific email as read:

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py mark_read <email_id>
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MJ_MASTER_KEY` | Secrets Manager master key | Required |
| `GMAIL_USER` | Gmail address | Read from secrets/config |
| `GMAIL_IMAP_SERVER` | IMAP server | `imap.gmail.com` |
| `GMAIL_IMAP_PORT` | IMAP port | `993` |
| `GMAIL_SMTP_SERVER` | SMTP server | `smtp.gmail.com` |
| `GMAIL_SMTP_PORT` | SMTP port | `465` |

### Config File (Optional)

Create `/root/.openclaw/workspace/skills/gmail/config.json` for custom settings:

```json
{
  "gmail_user": "your.email@gmail.com",
  "imap_server": "imap.gmail.com",
  "imap_port": 993,
  "smtp_server": "smtp.gmail.com",
  "smtp_port": 465,
  "use_ssl": true
}
```

## Error Handling

The tool implements comprehensive error handling:

- **Connection errors:** Retries with exponential backoff
- **Authentication failures:** Clear error messages, suggests app password
- **IMAP/SMTP failures:** Logged with full stack trace
- **Missing secrets:** Helpful setup instructions
- **Network timeouts:** Configurable timeout with retry

All errors are logged to `/root/.openclaw/workspace/skills/gmail/gmail.log`

## Logging

Logs are written to:
- **File:** `/root/.openclaw/workspace/skills/gmail/gmail.log`
- **Level:** INFO (configurable via `--verbose` flag)

Enable verbose output:
```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py fetch --verbose
```

## Security Notes

1. **Never commit credentials** - Passwords stored only in encrypted secrets store
2. **Use app passwords** - Don't use your main Gmail password
3. **Audit logging** - All secret access is logged in secrets audit trail
4. **SSL/TLS** - All connections use encrypted channels

## Dependencies

- Python 3.8+
- `imaplib` (standard library)
- `smtplib` (standard library)
- `email` (standard library)
- `argparse` (standard library)
- `logging` (standard library)
- `json` (standard library)

## Troubleshooting

### "Authentication failed"
- Ensure you're using an **app password**, not your regular Gmail password
- Verify 2FA is enabled on your Google account
- Check that IMAP is enabled in Gmail settings

### "Connection timed out"
- Check network connectivity
- Verify firewall allows outbound connections on ports 993 (IMAP) and 465 (SMTP)
- Try increasing timeout with `--timeout 60`

### "Secret not found"
- Ensure `MJ_MASTER_KEY` is set in environment
- Verify secret was added: `node /root/.openclaw/workspace/secrets/add-secret.js gmail password "..." "..."`
- Check secrets store exists at `/root/.openclaw/workspace/secrets/secrets-store.json`

### "Email ID not found"
- Email IDs are session-specific; fetch a fresh list before reading
- IDs may change if emails are deleted or moved

## Examples

### Morning Email Check
```bash
# Fetch 20 most recent emails
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py fetch --count 20

# Search for unread emails from today
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py search "is:unread after:2024/04/16"

# Read a specific email
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py read 67890
```

### Send Quick Update
```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py send \
  --to team@example.com \
  --subject "Daily Standup Update" \
  --body "Completed: API integration\nIn Progress: Testing\nBlockers: None"
```

### Archive Old Emails
```bash
# Search for emails older than 90 days
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py search "before:2024/01/16" --count 50
```

## License

Part of OpenClaw AgentSkills ecosystem.
