# AI Research Assistant - Managed Service Model

## Executive Summary

This document outlines the **managed hosting** model for the AI Research Assistant service — where we (or a platform like myclaw.ai) host and manage the AI agents for customers, who access them via API or web interface. This contrasts with the self-hosted model where customers run everything on their own infrastructure.

---

## The Shift: Self-Hosted → Managed Service

| Aspect | Self-Hosted | Managed Service |
|--------|-------------|-----------------|
| **Infrastructure** | Customer provides | We provide (cloud) |
| **Setup** | Customer configures | Instant access |
| **Maintenance** | Customer handles | We handle |
| **Pricing** | $500-2K/month | $100-500/month |
| **Target** | Technical users | Non-technical teams |
| **Margins** | Lower (support burden) | Higher (scalable) |

---

## Platform Options for Hosting

### Option 1: Run Our Own (White-Label)

**Build and host ourselves** — similar to how myclaw.ai operates.

**Requirements:**
- Cloud infrastructure (AWS/GCP/Azure)
- API gateway for authentication, rate limiting
- Multi-tenant database architecture
- Monitoring, logging, alerting
- Customer dashboard (billing, usage, config)

**Cost Structure:**
- Infrastructure: ~$500-2K/month for 50 customers
- Development: 2-4 weeks to build platform
- Support: ~5-10 hours/month per customer

**Revenue Model:**
- Subscription tiers (see pricing below)
- Usage-based add-ons (extra research topics, API calls)

### Option 2: Partner with Existing Platforms

**Use platforms that host AI agents** — partner with or embed into existing infrastructure.

**Potential Partners:**
- **myclaw.ai** — Custom AI agent hosting
- **RunPod** — GPU-accelerated inference
- **Modal** — Serverless compute
- **Railway/Render** — Managed app hosting
- **Abacus.AI** — Enterprise AI platform

**Integration Effort:**
- API integration: 1-2 weeks
- Custom branding: 1 week
- Testing: 1 week

### Option 3: Hybrid (Recommended)

**Offer both models:**
1. **Managed service** (primary) — for most customers
2. **Self-hosted** (premium) — for enterprises requiring on-prem

**Rationale:**
- Start with managed (faster to launch, lower barrier)
- Self-hosted as upsell for security-conscious enterprises
- Same core product, different deployment

---

## Managed Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Customer Dashboard                       │
│  (Billing, Usage Stats, Research Topics, Export)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                           │
│  (Auth, Rate Limiting, Quotas, Logging)                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │ Research     │  │ Briefing    │  │ Outreach    │
     │ Agent        │  │ Agent       │  │ Agent       │
     └──────────────┘  └──────────────┘  └──────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
              ┌──────────────────────────────┐
              │    Ollama / External APIs   │
              │    (LLaMA, GPT-4, etc.)     │
              └──────────────────────────────┘
```

---

## Pricing Tiers (Managed Service)

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | $99/mo | 10 topics/month, 2-page briefs, email support |
| **Professional** | $249/mo | 25 topics/month, 5-page briefs, API access, priority |
| **Enterprise** | $499/mo | Unlimited topics, full reports, dedicated analyst, SLA |
| **Custom** | $999+/mo | Multi-seat, custom integrations, on-prem option |

**Comparison to Self-Hosted:**
- Self-hosted: $500-2K/month (customer infrastructure cost + our service)
- Managed: $99-499/month (all-inclusive)

---

## Target Customers for Managed Service

### Primary Segments

1. **Small Teams (2-10 people)**
   - No devops capability
   - Want research, not infrastructure
   - Budget: $100-300/month

2. **Marketing Agencies**
   - Need quick turnaround
   - Non-technical founders
   - Scale with client load

3. **Consultants**
   - Research for client deliverables
   - Need credible sources
   - Budget: $200-500/month

4. **Small VC/Family Offices**
   - Deal flow monitoring
   - Lightweight needs
   - Budget: $250-750/month

### Not Target Customers
- **Large Enterprises** — need self-hosted, custom integration
- **Technical Teams** — prefer self-hosted for control
- **One-off projects** — use Perplexity/ChatGPT

---

## Competitive Landscape

| Competitor | Model | Pricing | Strengths | Weaknesses |
|------------|-------|---------|-----------|------------|
| **Perplexity Pro** | Managed | $20-200/mo | Fast, good UI | Not autonomous |
| **ChatGPT Team** | Managed | $25-200/mo | Popular, good UI | Generic responses |
| **AgentHub** | Managed | $50-500/mo | Agent marketplace | Limited customization |
| **Custom (Us)** | Managed | $99-499/mo | True autonomy, vertical focus | Newer, smaller |

---

## Go-to-Market Strategy

### Phase 1: Launch (Month 1-2)
- Build MVP dashboard (research topic submission, brief delivery)
- Launch landing page with pricing
- Beta: 5 customers at 50% off

### Phase 2: Early Traction (Month 3-4)
- Refine based on beta feedback
- Add API access for Professional tier
- Content marketing: blog posts, case studies

### Phase 3: Scale (Month 5-8)
- Paid ads (Google, LinkedIn)
- Partner referrals (marketing agencies)
- Expand to 2-3 more verticals

### Phase 4: Enterprise (Month 9+)
- Self-hosted option for enterprises
- Custom integrations
- Sales team for $10K+ contracts

---

## Operational Requirements

### Infrastructure (Monthly Cost)
| Component | Est. Cost |
|-----------|-----------|
| Cloud (AWS/GCP) | $300-800 |
| Database | $100-200 |
| API Gateway | $50-100 |
| Monitoring | $50-100 |
| Support (5 hrs/mo) | $200 |
| **Total** | **$700-1,200** |

### Break-Even Analysis
- 10 customers @ $149 avg = $1,490/month revenue
- Break-even: ~8-10 customers
- Target: 30 customers by Month 6

### Team Requirements
| Role | Phase | Cost |
|------|-------|------|
| Dev (part-time) | Launch | $1,000/mo |
| Support (part-time) | Growth | $500/mo |
| Sales/Marketing | Scale | $1,000/mo |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Customer data privacy | Encryption at rest/transit, optional self-hosted |
| AI cost volatility | Usage-based pricing, cost monitoring |
| Competition | Vertical specialization, true autonomy |
| Scaling issues | Multi-tenant architecture from day 1 |

---

## Next Steps

1. **Build MVP Dashboard** (2 weeks)
   - Research topic input
   - Brief delivery (email/in-app)
   - Basic billing (Stripe)

2. **Set Up Infrastructure** (1 week)
   - Cloud deployment
   - API gateway
   - Database

3. **Launch Beta** (2 weeks)
   - 5 pilot customers
   - Gather feedback

4. **Iterate & Launch** (2 weeks)
   - Fix issues
   - Public launch
   - Marketing kickoff

---

## Appendix: Comparison to Self-Hosted

| Dimension | Self-Hosted (Existing) | Managed (This Doc) |
|-----------|----------------------|-------------------|
| **Setup time** | 1-2 days | Instant |
| **Infrastructure** | Customer | Us |
| **Support burden** | High | Medium |
| **Revenue potential** | $500-2K/customer | $100-500/customer |
| **Scalability** | Manual | Automated |
| **Best for** | Technical, enterprises | Teams, agencies, SMB |

---

*Document created: 2026-03-17*
*For: AI Research Assistant Service - Managed Hosting Model*