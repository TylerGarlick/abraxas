# Hermes-Delphi Documentation

**System:** Autonomous Research & Delivery
**Part of:** Abraxas
**Agents:** 6 (Keres, Mythos, Prodos, Dromos, Kleitos, Logismos)

---

## Overview

Hermes-Delphi is Abraxas's autonomous research-to-delivery pipeline. Six specialized agents work together to continuously monitor markets, synthesize intelligence, prospect clients, deliver reports, collect feedback, and manage billing.

---

## Quick Start

### Installation
```bash
cd skills
zip -r hermes-delphi.skill hermes-delphi/
```

### Basic Usage
```
/hermes status                    # Check all agent statuses
/research monitor {topic}        # Set up market monitoring
/brief synthesize {research_id}  # Generate client brief
/outreach connect {prospect}     # Start prospecting
/delivery send {brief_id}        # Deliver brief
/feedback collect {delivery_id}  # Request feedback
/billing invoice {client_id}     # Generate invoice
```

---

## Agent Responsibilities

| Agent | Role | Key Commands |
|-------|------|--------------|
| **Keres** (Research) | Market/competitor monitoring | `/research *` |
| **Mythos** (Briefing) | Brief synthesis | `/brief *` |
| **Prodos** (Outreach) | Client prospecting | `/outreach *` |
| **Dromos** (Delivery) | Report delivery | `/delivery *` |
| **Kleitos** (Feedback) | Feedback analysis | `/feedback *` |
| **Logismos** (Billing) | Usage tracking/invoicing | `/billing *` |

---

## Workflow

```
Research → Briefing → Outreach → Delivery → Feedback → Billing
   │           │           │          │          │          │
   ▼           ▼           ▼          ▼          ▼          ▼
Keres      Mythos      Prodos     Dromos     Kleitos    Logismos
```

1. **Keres** continuously monitors markets and competitors
2. **Mythos** synthesizes findings into client-ready briefs
3. **Prodos** prospects potential clients via LinkedIn/email
4. **Dromos** formats and delivers briefs to clients
5. **Kleitos** collects and analyzes feedback
6. **Logismos** tracks usage and generates invoices

---

## Data Storage

```
hermes-delphi/
├── agents/                 # Agent definitions
├── data/
│   ├── research/          # Research findings
│   ├── briefs/            # Draft and final briefs
│   ├── clients/           # Client and prospect profiles
│   ├── deliveries/        # Delivery records
│   ├── feedback/          # Feedback and analysis
│   └── billing/           # Invoices and usage
├── skills/
│   └── hermes-delphi.skill/
└── docs/                  # Documentation
```

---

## Epistemic Standards

All research findings use confidence labels:

| Label | Meaning | When to Use |
|-------|---------|-------------|
| **Sol** | Confident/positive | Multiple high-quality sources agree |
| **Nox** | Skeptical/uncertain | Single source, unverified, or contradictory |
| **Meridian** | Balanced/neutral | Mixed signals or balanced reporting |

---

## Configuration

System configuration stored in `config.yaml`:
- Research frequency and thresholds
- Outreach sequences and rates
- Delivery formats and schedules
- Feedback analysis windows
- Billing rates and tiers

---

## Integration

### External APIs
- Brave Search (research)
- GitHub API (competitor tracking)
- Email provider (outreach)
- LinkedIn API (prospecting)

### Abraxas Integration
- Janus (epistemic labeling)
- Mnemosyne (memory persistence)
- Harmonia (skill composition)

---

## File Locations

| Purpose | Path |
|---------|------|
| Agent definitions | `hermes-delphi/agents/*.md` |
| Main skill | `skills/hermes-delphi/SKILL.md` |
| References | `skills/hermes-delphi/references/*.md` |
| Data | `hermes-delphi/data/*/` |
| Spec | `plans/autonomous-research-system-spec.md` |
