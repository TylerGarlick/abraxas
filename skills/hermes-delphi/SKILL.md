# Hermes-Delphi: Autonomous Research & Delivery System

Hermes-Delphi is Abraxas's autonomous research and delivery layer. Six specialized agents work in concert to monitor markets, synthesize briefs, prospect clients, deliver reports, collect feedback, and manage billing.

---

## System Identity

**System Name:** Hermes-Delphi
**Greek Foundation:** Hermes (messenger, commerce, navigation) + Delphi (oracle, insight, prophecy)
**Purpose:** Continuous autonomous research-to-delivery pipeline
**Core Principle:** Epistemically honest intelligence work with verifiable audit trails

---

## Agent Roster

| Agent | Greek Name | Role | Primary Commands |
|-------|------------|------|------------------|
| Research | Keres | Market/competitor monitoring | `/research *` |
| Briefing | Mythos | Brief synthesis | `/brief *` |
| Outreach | Prodos | Client prospecting | `/outreach *` |
| Delivery | Dromos | Report formatting/delivery | `/delivery *` |
| Feedback | Kleitos | Feedback collection/analysis | `/feedback *` |
| Billing | Logismos | Usage tracking/invoicing | `/billing *` |

---

## Autonomous Pipeline

### How It Works

The Hermes-Delphi pipeline runs autonomously via a cron-triggered system:

1. **Cron Trigger** — Daily at 14:00 UTC (7AM MST), the pipeline automatically starts
2. **Idempotent Runs** — If a pipeline is already running, subsequent triggers are skipped
3. **Checkpoint/Resume** — Pipeline state is saved after each agent completes, enabling resume from interruption
4. **Daily Report** — Upon completion, a research report is generated and delivered
5. **Feedback Loop** — Kleitos feedback is incorporated into future pipeline runs

### Running the Pipeline

```bash
# Run manually
cd hermes-delphi/runner
node pipeline-runner.js run

# Check status
node pipeline-runner.js status

# Resume interrupted run
node pipeline-runner.js resume

# Cancel running pipeline
node pipeline-runner.js cancel
```

### Cron Setup

```bash
# Install cron job (runs daily at 14:00 UTC)
cd hermes-delphi/runner
./setup-cron.sh --install

# Check status
./setup-cron.sh --status

# Remove cron
./setup-cron.sh --remove
```

---

## Global Commands

### System Control
- `/hermes status` — Show all agent statuses and queue depths
- `/hermes pause` — Pause all autonomous operations
- `/hermes resume` — Resume autonomous operations
- `/hermes config` — Show/edit system configuration
- `/hermes audit {period}` — Generate audit report for period

---

## Research Agent (Keres)

**Epistemic Posture:** Sun-face (positive bias) balanced with Nox-face (skeptical review)

### Commands
- `/research monitor {topic}` — Create continuous monitor for topic
- `/research scan {domain}` — One-time domain scan for intelligence
- `/research trends {industry}` — Identify emerging trends in industry
- `/research competitors {company}` — Track competitor activities
- `/research alert {signal}` — Define alert threshold for signal
- `/research status` — Show active monitors, recent findings
- `/research pause` — Pause all research activities
- `/research resume` — Resume research activities
- `/research findings {topic}` — Retrieve recent findings on topic

### Data Sources
- Web search via Brave API
- Web content fetch and extraction
- GitHub API (repo activity, commits, issues)
- News aggregation

### Output Schema
```yaml
finding_id: timestamped-uuid
topic: string
source: string
url: string
summary: string (max 280 chars)
confidence: sol|nox|meridian
raw_content: optional
timestamp: ISO-8601
tags: [string]
```

---

## Briefing Agent (Mythos)

**Epistemic Posture:** Meridian (balanced synthesis)

### Commands
- `/brief synthesize {research_ids}` — Generate brief from research findings
- `/brief template {type}` — Use template: executive, technical, strategic
- `/brief inject {client_id}` — Inject client context and preferences
- `/brief validate` — Check brief completeness and epistemic alignment
- `/brief finalize {brief_id}` — Mark brief ready for delivery
- `/brief status` — Show briefs in progress and completed
- `/brief archive {brief_id}` — Archive completed brief
- `/brief review {brief_id}` — Review brief for quality

### Brief Templates

**Executive Brief:**
```
# Executive Brief: {Topic}
**Client:** {Client Name}
**Date:** {Date}
**Prepared by:** Hermes-Delphi Autonomous System

## Summary
{3-sentence overview}

## Key Findings
1. **{Finding Title}**: {Description} [Confidence: {sol|nox|meridian}]
2. **{Finding Title}**: {Description} [Confidence: {sol|nox|meridian}]
3. **{Finding Title}**: {Description} [Confidence: {sol|nox|meridian}]

## Implications
{What this means for the client}

## Recommendations
1. {Actionable recommendation}
2. {Actionable recommendation}

## Next Steps
- {Concrete next step}
- {Concrete next step}
```

### Validation Checklist
- [ ] All claims labeled with confidence (Sol/Nox/Meridian)
- [ ] No unsubstantiated assertions
- [ ] Client context properly injected
- [ ] Format matches template specification
- [ ] Summary is 3 sentences or fewer

---

## Outreach Agent (Prodos)

**Epistemic Posture:** Sol-face (positive, value-forward)

### Commands
- `/outreach connect {prospect}` — Initiate connection with prospect
- `/outreach email {prospect} {template}` — Send email via configured provider
- `/outreach linkedin {prospect} {action}` — LinkedIn action (connect, message, endorse)
- `/outreach sequence {prospect}` — Start outreach sequence
- `/outreach track {prospect}` — Show outreach status for prospect
- `/outreach pause {prospect}` — Pause outreach for prospect
- `/outreach resume {prospect}` — Resume paused outreach
- `/outreach status` — Show outreach pipeline status

### Outreach Sequence (4 Steps)
1. **Day 0:** Initial contact (LinkedIn connect or email)
2. **Day 3:** Follow-up with value add
3. **Day 7:** Second follow-up with insight
4. **Day 14:** Final outreach with CTA

### Templates

**Initial Email:**
```
Subject: {Personalization hook}

Hi {First Name},

{I noticed/recently saw} {specific observation about their work or company}.

{Market insight or trend} that might be relevant to {their challenge}.

{Would you be open to a brief call to explore this further?}

Best,
{Agent Name}
```

---

## Delivery Agent (Dromos)

**Epistemic Posture:** Neutral (exact, reliable)

### Commands
- `/delivery schedule {brief_id} {datetime}` — Schedule delivery
- `/delivery send {brief_id}` — Execute delivery immediately
- `/delivery format {brief_id} {format}` — Format: pdf, html, markdown
- `/delivery track {delivery_id}` — Track delivery status
- `/delivery confirm {delivery_id}` — Confirm client receipt
- `/delivery retry {delivery_id}` — Retry failed delivery
- `/delivery status` — Show delivery queue and history

### Supported Formats
- **Markdown:** Raw format for repository storage
- **HTML:** Styled email-ready format
- **PDF:** Print-ready format (via HTML conversion)

### Delivery States
```
pending → scheduled → sent → delivered → confirmed
                        └→ failed → retry
```

---

## Feedback Agent (Kleitos)

**Epistemic Posture:** Nox-face (critical, improvement-focused)

### Commands
- `/feedback collect {delivery_id}` — Request feedback from client
- `/feedback analyze {feedback_text}` — Analyze feedback content
- `/feedback route {feedback}` — Route to appropriate agent for action
- `/feedback adapt {client_id}` — Adapt future briefs based on feedback
- `/feedback sentiment {period}` — Generate sentiment report
- `/feedback status` — Show pending/processed feedback

### Analysis Dimensions
| Dimension | Indicators | Weight |
|-----------|------------|--------|
| Content Quality | Relevance, accuracy, depth | 0.3 |
| Timing | Appropriate, too early/late | 0.2 |
| Format | Preferred format compliance | 0.2 |
| Value | Perceived usefulness | 0.2 |
| Actionability | Clear next steps | 0.1 |

### Sentiment Thresholds
- **Positive (0.7-1.0):** Increase engagement frequency
- **Neutral (0.4-0.7):** Maintain current cadence
- **Negative (0.0-0.4):** Review and adapt approach

---

## Billing Agent (Logismos)

**Epistemic Posture:** Neutral (precise, auditable)

### Commands
- `/billing track {action} {details}` — Log billable action
- `/billing invoice {client_id}` — Generate invoice for client
- `/billing report {period}` — Generate billing report
- `/billing usage {client_id}` — Show usage breakdown for client
- `/billing rates {service}` — Configure billing rates
- `/billing status` — Show pending/paid invoices

### Default Rate Schedule
```yaml
research_queries:
  base: $0.01
  premium: $0.02
  
brief_generation:
  executive: $50
  technical: $75
  strategic: $150

delivery:
  email: included
  premium_format: $10

outreach:
  per_sequence: $25
  linkedin_action: $5
```

### Invoice Schema
```yaml
invoice_id: string
client_id: string
period:
  start: date
  end: date
line_items:
  - service: string
    quantity: number
    unit_price: number
    total: number
subtotal: number
tax: number
total: number
status: draft|sent|paid|overdue
due_date: date
```

---

## Data Storage

### Run Management
```
data/runs/{run_id}.json          # Pipeline run state
data/checkpoints/{run_id}-{stage}.json  # Agent checkpoints
data/reports/{run_id}-report.md  # Daily reports
```

### Research Findings
```
data/research/active/{topic}_{timestamp}.yaml
data/research/archive/{year}/{month}/{topic}_{timestamp}.yaml
```

### Briefs
```
data/briefs/drafts/{brief_id}.yaml
data/briefs/final/{client_id}/{year}/{month}/{brief_id}.md
```

### Client Profiles
```
data/clients/profiles/{client_id}.yaml
data/clients/outreach/{client_id}/{sequence_id}.yaml
```

### Deliveries
```
data/deliveries/{delivery_id}.yaml
```

### Feedback
```
data/feedback/{feedback_id}.yaml
data/feedback/reports/{year}_{month}.md
```

### Billing
```
data/billing/invoices/{invoice_id}.yaml
data/billing/reports/{year}_{month}.md
```

---

## Idempotent Run Management

The pipeline ensures only one run executes at a time:

1. **Lock File** — `data/.pipeline_lock` contains running PID
2. **Stale Detection** — Locks older than 2 hours are considered stale
3. **Process Check** — Verifies lock PID is still running
4. **Force Flag** — `--force` can override for manual runs

---

## Checkpoint/Resume

Each agent saves a checkpoint after completion:

```javascript
// Checkpoint structure
{
  run_id: "run-2026-03-21-...",
  stage: "mythos",
  timestamp: "2026-03-21T14:30:00Z",
  data: { /* agent output */ }
}
```

Resume logic:
1. Check for existing checkpoint
2. Load checkpoint data
3. Skip completed agents
4. Resume from last incomplete agent

---

## Feedback Loop Closure

Kleitos feedback is wired back into the pipeline:

1. **Collect** — Feedback collected after deliveries
2. **Analyze** — Sentiment and theme analysis
3. **Adapt** — Client-specific adaptations generated
4. **Store** — Adaptations saved to `data/feedback-adaptations.json`
5. **Incorporate** — Next run loads and applies adaptations

---

## Quality Assurance

### Research Quality
- All findings must have source attribution
- Confidence levels required (Sol/Nox/Meridian)
- Duplicate detection before storage
- Stale data flagging (48h+ without update)

### Brief Quality
- Validation checklist must pass
- Epistemic labeling on all claims
- No hallucinated data
- Client context verified

### Outreach Quality
- Personalization required for each contact
- Frequency caps enforced (no spam)
- Opt-out handling mandatory
- Audit trail complete

### Delivery Quality
- Receipt confirmation tracked
- Failure retry with exponential backoff
- Format verification before send

---

## Anti-Scheming Safeguards

1. **No self-modification:** Agents cannot modify their own prompts or constraints
2. **Audit logging:** All actions logged with timestamps
3. **Human-in-loop:** Critical operations require explicit confirmation
4. **Immutable records:** Once logged, findings and briefs cannot be altered
5. **Rate limiting:** External API calls throttled to prevent abuse

---

## Integration Points

### External APIs
- Brave Search API (`web_search` tool)
- GitHub API (`gh` CLI)
- Email provider (configurable SMTP/API)
- LinkedIn API (if authorized)

### Abraxas Integration
- **Janus:** Epistemic labeling for all research claims
- **Mnemosyne:** Cross-session memory persistence
- **Harmonia:** Skill composition for multi-step workflows
- **Mission Control:** Backlog integration for autonomous scheduling

### Mission-Control Integration
The pipeline integrates with Abraxas Mission-Control via `integrations/mission-control.js`:
- Syncs run status to backlog
- Creates tasks for report delivery
- Routes feedback adaptations to backlog

---

## Configuration

### System Config (`data/config/config.yaml`)
```yaml
system:
  name: Hermes-Delphi
  mode: autonomous|supervised
  log_level: info|debug|error
  
research:
  default_frequency: daily
  max_concurrent_monitors: 10
  stale_threshold_hours: 48

outreach:
  sequence_days: [0, 3, 7, 14]
  max_retries: 3
  rate_limit_per_day: 50

delivery:
  default_format: markdown
  retry_attempts: 3
  retry_backoff_minutes: [5, 15, 60]

feedback:
  analysis_window_days: 30
  sentiment_threshold_positive: 0.7
  sentiment_threshold_negative: 0.4

billing:
  default_currency: USD
  invoice_period_days: 30
  payment_terms_days: 14

pipeline:
  frequency: daily
  feedback_loop_enabled: true
  report_recipients:
    - ""
```

### Client Profile Template
```yaml
client_id: string (UUID)
name: string
contact:
  email: string
  linkedin: string (optional)
preferences:
  brief_format: executive|technical|strategic
  delivery_frequency: weekly|biweekly|monthly
  delivery_day: monday|tuesday|...
  delivery_time: HH:MM timezone
  topics: [string]
billing:
  rate_tier: base|premium|enterprise
  custom_rates: optional override
status: active|paused|inactive
created: ISO-8601
updated: ISO-8601
```
