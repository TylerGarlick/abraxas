# Delivery Configuration

## Overview

Configuration and setup for the Dromos delivery agent, including supported formats, delivery channels, and error handling procedures.

---

## Supported Formats

### Markdown
**Extension:** `.md`
**Use case:** Repository storage, plain-text clients
**Generation:** Direct from brief template
**Notes:** Default format, always generated

### HTML
**Extension:** `.html`
**Use case:** Email delivery, web viewing
**Generation:** Markdown to HTML conversion with styling
**Notes:** Inline CSS for email client compatibility

### PDF
**Extension:** `.pdf`
**Use case:** Print-ready, formal delivery
**Generation:** HTML to PDF via wkhtmltopdf or browser print
**Notes:** Additional $10 charge for generation

---

## Email Configuration

### Default Email Settings
```yaml
email:
  provider: smtp|api
  from_name: Hermes-Delphi
  from_address: briefs@{domain}
  reply_to: {config}
  
smtp:
  host: {SMTP_HOST}
  port: 587
  secure: true
  auth:
    username: {USERNAME}
    password: {PASSWORD}
    
api:
  provider: sendgrid|mailgun|ses
  api_key: {API_KEY}
  region: {REGION}
```

---

## Delivery States

```
pending
    │
    ▼
scheduled ─────────────────┐
    │                      │
    ▼                      │
    sent                   │
    │                      │
    ├──► delivered ◄──┐   │
    │                  │   │
    │                  │   │
    ├──► confirmed ────┴───┘
    │
    └──► failed
            │
            ├──► retry ◄────┐
            │               │
            └──► exhausted  │
                            │
        (notify operator)  │
```

---

## Retry Configuration

```yaml
retry:
  max_attempts: 3
  backoff:
    attempt_1: 5 minutes
    attempt_2: 15 minutes
    attempt_3: 60 minutes
  fallback_formats:
    - html  # If PDF fails, try HTML
    - markdown  # If HTML fails, try Markdown
```

---

## Confirmation Tracking

```yaml
confirmation:
  check_interval_hours: 24
  max_unconfirmed_hours: 48
  check_in_template: |
    Subject: Brief delivery confirmation
    
    Hi {client_name},
    
    We wanted to confirm you received the brief on {topic}.
    Please reply to confirm receipt or let us know if you didn't receive it.
    
    Best,
    Hermes-Delphi
```

---

## Client Delivery Preferences

Stored in client profile:

```yaml
delivery_preferences:
  preferred_format: markdown|html|pdf
  preferred_day: monday|tuesday|...
  preferred_time: HH:MM
  timezone: {TIMEZONE}
  channel: email|slack|webhook
  contact_email: {EMAIL}
  contact_slack: {SLACK_ID}
  webhook_url: {URL}
```

---

## Error Handling

| Error | Action | Escalation |
|-------|--------|------------|
| Invalid email | Mark failed, notify operator | After 1 attempt |
| SMTP timeout | Retry with backoff | After max retries |
| HTML conversion fail | Fall back to Markdown | Log error |
| PDF generation fail | Fall back to HTML | Log error |
| Webhook fail | Retry with backoff | After max retries |
| Rate limit | Queue for later | Log warning |

---

## Monitoring

### Health Checks
- Email delivery success rate: > 95%
- Confirmation rate: > 80% within 48h
- Format conversion success: > 99%

### Alerts
- Failed delivery > 5% triggers review
- Confirmation rate < 60% triggers client check
- Any format conversion error triggers alert
