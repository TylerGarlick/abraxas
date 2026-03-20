# Abraxas Autonomous Agent System

A multi-agent research and delivery system built on the Abraxian epistemic framework.

## Overview

This system consists of six specialized agents that work together to conduct continuous market research, synthesize findings into client-ready briefs, and deliver intelligence through various channels.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Research   │────▶│  Briefing   │────▶│  Delivery   │
│   Agent     │     │   Agent     │     │   Agent     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Outreach   │
                    │   Agent     │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Feedback   │
                    │   Agent     │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Billing   │
                    │   Agent     │
                    └─────────────┘
```

## The Agents

### Research Agent
Continuous market and competitor monitoring.

**Inputs:** Topic, sources, monitoring schedule  
**Outputs:** Research findings with epistemic labels, source citations, confidence assessment

**Key Methods:**
- `init(topic, sources)` — Initialize research session
- `monitor()` — Run monitoring cycle
- `addFinding(content, label, source)` — Add findings with labels
- `compileReport()` — Generate structured report

**Epistemic Labels Used:** `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, `[DREAM]`

---

### Briefing Agent
Synthesizes research findings into client-ready briefs.

**Inputs:** Research findings, client profile, format type  
**Outputs:** Structured brief with sections, highlights, action items

**Key Methods:**
- `synthesize(researchData, clientProfile, format)` — Create brief
- `formatForDelivery(brief, format)` — Format for email/HTML/PDF

**Brief Sections:**
- Executive Summary
- Key Findings (by epistemic label)
- Opportunities
- Risks
- Recommendations
- Citations
- Confidence Note

---

### Outreach Agent
LinkedIn and email prospecting to clients.

**Inputs:** Prospects list, brief content, channel  
**Outputs:** Outreach messages, response tracking, conversion metrics

**Key Methods:**
- `loadProspects(prospects)` — Load prospect list
- `generateMessage(prospect, brief, channel)` — Create personalized message
- `sendOutreach(prospects, brief, channel)` — Execute outreach campaign
- `trackResponse(messageId, response)` — Track client responses

**Anti-Confabulation:** All outreach includes uncertainty disclaimers when research confidence is low.

---

### Delivery Agent
Formats and delivers weekly briefs to clients.

**Inputs:** Brief, delivery method, schedule  
**Outputs:** Delivery records, receipts, status tracking

**Key Methods:**
- `prepareBrief(brief, options)` — Format for delivery
- `scheduleDelivery(preparedBrief, schedule, method)` — Schedule delivery
- `deliver(preparedBrief, method)` — Execute delivery
- `getStatus()` — Get delivery system status

**Supported Formats:** Markdown, JSON, HTML, PDF

---

### Feedback Agent
Collects and acts on client feedback.

**Inputs:** Feedback items, client ID  
**Outputs:** Feedback analysis, satisfaction score, action items

**Key Methods:**
- `collect(feedbackItem)` — Receive feedback
- `analyze(clientId)` — Analyze feedback patterns
- `generateResponse(feedbackItem, analysis)` — Generate response
- `getTrends(clientId, days)` — Track feedback over time

**Feedback Labels:** `[POSITIVE]`, `[NEGATIVE]`, `[NEUTRAL_POSITIVE]`, `[NEEDS_IMPROVEMENT]`, `[ACTIONABLE]`, `[UNCERTAIN]`

---

### Billing Agent
Tracks usage and generates invoices.

**Inputs:** Client ID, usage data, billing period  
**Outputs:** Invoices, usage summaries, billing metrics

**Key Methods:**
- `registerClient(client)` — Register for billing
- `recordUsage(clientId, usage)` — Record usage event
- `generateInvoice(clientId, period)` — Create invoice
- `getUsageSummary(clientId, start, end)` — Usage report

**Plans:** Standard, Premium, Enterprise (with volume discounts)

---

## Coordinator

The Coordinator orchestrates all agents into unified workflows:

```javascript
const { Coordinator } = require('./agents');

const coordinator = new Coordinator();

// Create workflow
const workflow = await coordinator.createWorkflow({
  topic: 'market trends in AI',
  client: { id: 'client-1', name: 'Acme Corp' },
  schedule: 'weekly'
});

// Execute full pipeline
const results = await coordinator.executeWorkflow(workflow.id);

// Check status
const status = coordinator.getWorkflowStatus(workflow.id);
```

### Workflow Stages

1. **Research** — Gather findings on topic
2. **Briefing** — Synthesize into client-ready format
3. **Outreach** — Send to prospects (if configured)
4. **Delivery** — Deliver to client
5. **Feedback** — Process client feedback
6. **Billing** — Track and invoice

### Quick Start with Factory

```javascript
const { createSystem } = require('./agents');

const system = createSystem();

// Start and execute workflow
const workflow = await system.startWorkflow({
  topic: 'competitor analysis',
  client: { name: 'TechCo' }
});

const results = await system.executeWorkflow(workflow.id, {
  stages: ['research', 'briefing', 'delivery']
});

console.log(system.getStatus());
```

---

## Abraxian Epistemic Framework

All agents use the Abraxian epistemic framework for honest, anti-confabulated output:

### Truth Labels

| Label | Meaning |
|:------|:--------|
| `[KNOWN]` | Verified fact. High confidence. |
| `[INFERRED]` | Derived from reasoning. Medium confidence. |
| `[UNCERTAIN]` | Relevant but unverified. Partial confidence. |
| `[UNKNOWN]` | Do not know. Will not fabricate. |
| `[DREAM]` | Symbolic/imaginal content. No factual claim. |

### Anti-Confabulation Rules

1. **No confabulation** — `[UNKNOWN]` is always valid
2. **Source citation required** — All claims need attribution
3. **Uncertainty propagation** — Low confidence is propagated forward
4. **Honest delivery** — Never soften conclusions for comfort

### Example

```
Research findings:
- "[KNOWN] Company X acquired 3 startups in Q4" (source: press release)
- "[INFERRED] This indicates aggressive market expansion" (derived)
- "[UNCERTAIN] Revenue impact unknown" (unverified)

Brief confidence note:
"[INFERRED] 2/3 claims verified. 1 requires additional sourcing."
```

---

## File Structure

```
agents/
├── index.js           # Main export / factory
├── coordinator.js     # Workflow orchestration
├── research-agent.js  # Market/competitor monitoring
├── briefing-agent.js  # Research → client briefs
├── outreach-agent.js  # LinkedIn/email prospecting
├── delivery-agent.js  # Format and deliver
├── feedback-agent.js  # Client feedback loop
├── billing-agent.js   # Usage tracking and invoicing
└── README.md          # This file
```

---

## Testing

```bash
# Run basic test
node -e "
const { createSystem } = require('./agents');
const system = createSystem();

const wf = system.startWorkflow({
  topic: 'test research',
  client: { name: 'Test Client' }
});

system.executeWorkflow(wf.id).then(r => {
  console.log('Result:', JSON.stringify(r, null, 2));
});
"
```

---

## License

MIT
