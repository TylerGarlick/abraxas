# Gmail Skill

Gmail integration for OpenClaw - fetch, read, send, search, and manage emails via IMAP/SMTP.

## Quick Start

### 1. Add Gmail Credentials

```bash
MJ_MASTER_KEY="0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs=" \
  node /root/.openclaw/workspace/secrets/add-secret.js \
  gmail password "YOUR_GMAIL_APP_PASSWORD" "Gmail IMAP/SMTP access"
```

### 2. Set Email Address

Add to your environment or create `config.json`:

```bash
export GMAIL_USER="your.email@gmail.com"
```

### 3. Fetch Emails

```bash
python3 /root/.openclaw/workspace/skills/gmail/gmail_tool.py fetch
```

## Commands

| Command | Description |
|---------|-------------|
| `fetch [--count N]` | List N most recent emails |
| `read <email_id>` | Read full email content |
| `send --to --subject --body` | Send an email |
| `search <query> [--count N]` | Search emails |
| `mark_read <email_id>` | Mark email as read |

## Documentation

See [SKILL.md](./SKILL.md) for full documentation including:
- Gmail setup requirements
- Search query syntax
- Configuration options
- Troubleshooting guide

## Files

- `SKILL.md` - Complete skill documentation
- `gmail_tool.py` - Main CLI implementation
- `config.json` - Optional configuration (create if needed)
- `gmail.log` - Runtime logs (created on first run)

## Security

- Credentials stored encrypted in Secrets Manager
- All connections use SSL/TLS
- Uses Gmail app passwords (not main password)
- Full audit logging of secret access
