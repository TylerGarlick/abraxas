# Abraxas Autonomous Research & Delivery System

## Overview

An autonomous multi-agent system for continuous market/competitor research, client prospecting, brief delivery, and billing. Built as an extension layer to Abraxas's epistemic infrastructure.

**System Name:** Hermes-Delphi (Research Pipeline)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HERMES-DELPHI AUTONOMOUS SYSTEM                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │   RESEARCH   │───▶│  BRIEFING    │───▶│      DELIVERY        │   │
│  │    AGENT     │    │    AGENT     │    │      AGENT           │   │
│  │   (Keres)    │    │  (Mythos)    │    │     (Dromos)         │   │
│  └──────────────┘    └──────────────┘    └──────────────────────┘   │
│         │                   │                      │                │
│         ▼                   ▼                      ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │   OUTREACH   │    │   FEEDBACK   │    │       BILLING        │   │
│  │    AGENT     │    │    AGENT     │    │      AGENT           │   │
│  │  (Prodos)    │    │  (Kleitos)   │    │     (Logismos)       │   │
│  └──────────────┘    └──────────────┘    └──────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Agent Specifications

### 1. Research Agent (Keres)

**Purpose:** Continuous market and competitor monitoring

**Commands:**
- `/research monitor {topic}` — Set up continuous monitoring for a topic
- `/research scan {domain}` — Scan domain for competitive intelligence
- `/research trends {industry}` — Identify emerging trends
- `/research competitors {company}` — Track competitor activities
- `/research alert {signal}` — Define alert thresholds
- `/research status` — Show active monitors and recent findings
- `/research pause` — Pause all monitoring
- `/research resume` — Resume monitoring

**Data Sources:**
- Web search (Brave API)
- Web fetch (content extraction)
- GitHub API (competitor repos, commits)
- News feeds

**Output:** Structured research findings stored in `research/active/`

---

### 2. Briefing Agent (Mythos)

**Purpose:** Synthesize research findings into client-ready briefs

**Commands:**
- `/brief synthesize {research_id}` — Generate brief from research
- `/brief template {type}` — Use brief template (executive, technical, strategic)
- `/brief inject {client_context}` — Add client-specific context
- `/brief validate` — Verify brief completeness and accuracy
- `/brief finalize {brief_id}` — Mark brief as ready for delivery
- `/brief status` — Show briefs in progress and completed
- `/brief archive {brief_id}` — Archive completed brief

**Brief Structure:**
```markdown
# Executive Brief: {Topic}
- Client: {Client Name}
- Date: {Date}
- Summary (3 sentences)
- Key Findings
  - Finding 1
  - Finding 2
  - Finding 3
- Implications
- Recommendations
- Next Steps
```

---

### 3. Outreach Agent (Prodos)

**Purpose:** LinkedIn and email prospecting to clients

**Commands:**
- `/outreach connect {prospect}` — Initiate outreach to prospect
- `/outreach email {template}` — Send email via configured provider
- `/outreach linkedin {action}` — LinkedIn engagement action
- `/outreach sequence {prospect} {step}` — Execute outreach sequence step
- `/outreach track {prospect}` — Track outreach status
- `/outreach pause {prospect}` — Pause outreach for prospect
- `/outreach resume {prospect}` — Resume outreach
- `/outreach status` — Show outreach pipeline status

**Sequence Steps:**
1. Initial connect (LinkedIn or email)
2. Follow-up (3 days)
3. Value add (7 days)
4. Final outreach (14 days)

---

### 4. Delivery Agent (Dromos)

**Purpose:** Format and deliver weekly briefs to clients

**Commands:**
- `/delivery schedule {brief_id} {time}` — Schedule delivery
- `/delivery send {brief_id}` — Send brief to client
- `/delivery format {brief_id} {format}` — Format brief (PDF, HTML, MD)
- `/delivery track {delivery_id}` — Track delivery status
- `/delivery confirm {delivery_id}` — Confirm client receipt
- `/delivery retry {delivery_id}` — Retry failed delivery
- `/delivery status` — Show delivery queue and history

**Delivery Formats:**
- PDF (via HTML conversion)
- HTML email
- Markdown (via repository)

---

### 5. Feedback Agent (Kleitos)

**Purpose:** Collect and act on client feedback

**Commands:**
- `/feedback collect {delivery_id}` — Request feedback from client
- `/feedback analyze {feedback_text}` — Analyze feedback sentiment
- `/feedback route {feedback}` — Route feedback to appropriate agent
- `/feedback adapt {brief_type}` — Adapt future briefs based on feedback
- `/feedback sentiment {period}` — Generate sentiment report
- `/feedback status` — Show feedback pending and processed

**Analysis Dimensions:**
- Content quality
- Timing appropriateness
- Format preference
- Value perception
- Actionability

---

### 6. Billing Agent (Logismos)

**Purpose:** Track usage and generate invoices

**Commands:**
- `/billing track {action} {details}` — Log billable action
- `/billing invoice {client_id}` — Generate invoice for client
- `/billing report {period}` — Generate billing report
- `/billing usage {client_id}` — Show usage for client
- `/billing rates {service}` — Configure billing rates
- `/billing status` — Show pending and paid invoices

**Billing Model:**
```yaml
research_queries:
  base: $0.01 per query
  premium: $0.02 per query
  
brief_generation:
  executive: $50 per brief
  technical: $75 per brief
  strategic: $150 per brief

delivery:
  email: included
  premium_format: $10 per delivery
  
outreach:
  per_sequence: $25 per sequence
  linkedin_actions: $5 per action
```

---

## Data Flow

```
Research Findings ──▶ Briefing ──▶ Formatted Brief ──▶ Delivery ──▶ Client
                          │                                    │
                          ▼                                    ▼
                     Archive                              Feedback
                          │                                    │
                          ▼                                    ▼
                     Brief History                     Feedback Agent ──▶ Adapt
                                                                     │
                                                                     ▼
                                                              Billing Agent
```

---

## File Structure

```
hermes-delphi/
├── agents/
│   ├── keres-research.md        # Research agent
│   ├── mythos-briefing.md       # Briefing agent
│   ├── prodos-outreach.md       # Outreach agent
│   ├── dromos-delivery.md       # Delivery agent
│   ├── kleitos-feedback.md      # Feedback agent
│   └── logismos-billing.md      # Billing agent
├── skills/
│   └── hermes-delphi.skill/
│       ├── SKILL.md
│       └── references/
│           ├── research-protocol.md
│           ├── brief-templates.md
│           ├── outreach-templates.md
│           ├── delivery-config.md
│           ├── feedback-analysis.md
│           └── billing-schema.md
├── data/
│   ├── research/
│   │   ├── active/
│   │   └── archive/
│   ├── briefs/
│   │   ├── drafts/
│   │   └── final/
│   ├── clients/
│   │   ├── profiles/
│   │   └── outreach/
│   ├── deliveries/
│   ├── feedback/
│   └── billing/
│       ├── invoices/
│       └── reports/
└── docs/
    └── hermes-delphi.md
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
- Create agent definitions
- Create skill structure
- Set up data directories
- Define configuration schemas

### Phase 2: Research & Briefing
- Implement Keres (Research Agent)
- Implement Mythos (Briefing Agent)
- Create brief templates

### Phase 3: Outreach & Delivery
- Implement Prodos (Outreach Agent)
- Implement Dromos (Delivery Agent)
- Integration testing

### Phase 4: Feedback & Billing
- Implement Kleitos (Feedback Agent)
- Implement Logismos (Billing Agent)
- End-to-end workflow

---

## Configuration

### Client Profile Schema
```yaml
client_id: string
name: string
contact_email: string
contact_linkedin: string
preferences:
  brief_format: executive|technical|strategic
  delivery_frequency: weekly|biweekly|monthly
  topics: [string]
billing:
  rate_tier: base|premium|enterprise
  custom_rates: optional
```

### Monitor Configuration
```yaml
monitor_id: string
topic: string
frequency: hourly|daily|weekly
sources: [web|github|news|social]
alert_threshold: float
```

---

## Integration Points

### External APIs
- Brave Search API (research)
- GitHub API (competitor tracking)
- Email provider (outreach)
- LinkedIn API (prospecting)

### Internal Integration
- Abraxas Janus (epistemic labeling)
- Abraxas Mnemosyne (memory persistence)
- Abraxas Harmonia (skill composition)

---

## Quality Standards

1. All research findings labeled with epistemic confidence (Janus)
2. All briefs validated before delivery
3. All outreach tracked and auditable
4. All feedback processed within 24 hours
5. All invoices generated within 7 days of period end
