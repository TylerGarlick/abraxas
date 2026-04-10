# ShipSummit 2026 — Conference Supplement

**For:** Tyler Garlick (T)  
**Track:** Product  
**Dates:** March 31 – April 2, 2026  
**Venue:** Grand Hyatt Deer Valley, Park City, Utah

---

## Table of Contents

1. [Speaker Profiles](#1-speaker-profiles)
2. [Core Themes Mapped to Product Work](#2-core-themes-mapped-to-product-work)
3. [Reading List](#3-reading-list)
4. [Talking Points + Questions](#4-talking-points--questions)
5. [Product-Track Deep Dives](#5-product-track-deep-dives)
6. [Impact Lab: Operation Avalanche](#6-impact-lab-operation-avalanche)

---

## 1. Speaker Profiles

### Gene Kim
*Author & Founder, IT Revolution*

**Background:** Gene Kim is a multi-time entrepreneur, former CTO, and founder of IT Revolution. He's been studying high-performing IT organizations since 1999. Author of *The Phoenix Project* (2013), *The DevOps Handbook* (2016), and more recently *Vibe Coding* (2025).

**Key Ideas:**
- The Three Ways: flow, feedback, continuous learning/experimentation
- DevOps as a predictor of organizational performance
- Work-in-progress (WIP) limits as a lever for throughput
- The intersection of IT performance and business outcomes

**What He's Known For:**
- Fiction-format technical books (*The Phoenix Project*) that made DevOps accessible
- Quantifying the correlation between DevOps practices and business metrics
- Popularizing the concept that "IT is the backbone of the business"

**Relevant Links:**
- [IT Revolution](https://itrevolution.com/)
- [Gene Kim's site](https://genekim.com/)
- [*The Phoenix Project* summary](https://itrevolution.com/product/the-phoenix-project/)

---

### Kent Beck
*Author & Founder, Extreme Programming*

**Background:** Creator of Extreme Programming (XP) and Test-Driven Development (TDD). Co-author of the Agile Manifesto. Former engineer at Apple, Facebook, and others. Author of *Tidy First?* (2023) and *Implementation Patterns* (2006). Currently focused on AI-augmented software development.

**Key Ideas:**
- Extreme Programming's core practices: pairing, TDD, simple design, refactoring, frequent releases
- TDD as a design technique, not just a testing technique
- "Make it work, make it right, make it fast" — in that order
- Recent work on AI agents in software development and "vibe coding"

**What He's Known For:**
- Being the person who literally wrote the book on XP
- Challenging his own ideas (recently: "TDD is against design")
- Practical AI integration: using LLMs to accelerate while maintaining craft

**Relevant Links:**
- [Kent Beck's site](https://kentbeck.com/)
- [*Tidy First?* Substack](https://tidyfirst.substack.com/)
- [Pragmatic Engineer interview on TDD + AI](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent)

---

### Mina Hsiang
*Former Administrator, U.S. Digital Service*

**Background:** Third Administrator of USDS (2021–2025), appointed during the Biden administration. Previously founding Executive Director of USDS at Health and Human Services. First woman and first Asian-American to lead USDS. Has worked across private sector and government solving complex sociotechnical problems.

**Key Ideas:**
- Product thinking applied to government services
- "Tens of billions in savings" through strategic modernization
- Human-centered design in the public sector
- Breaking large bureaucratic systems into investable, improvable chunks

**What She's Known For:**
- Launching the first free government tax filing tool (Direct File)
- Modernizing Social Security and veterans' services
- Building USDS from ~100 to ~300+ people during her tenure
- Navigating political complexity while maintaining technical credibility

**Relevant Links:**
- [Wikipedia: Mina Hsiang](https://en.wikipedia.org/wiki/Mina_Hsiang)
- [Shorenstein Center interview](https://shorensteincenter.org/article/mina-hsiang-former-administrator-united-states-digital-service-usds-joins-shorenstein-center-fellow/)
- [USDS Origins Archive](https://usdigitalserviceorigins.org/interviews/mina-hsiang/)

---

### John Cutler
*Head of Product, Dotwork*

**Background:** Formerly at Toast and Amplitude. Combines UX, product management, and coaching. Writes extensively about complex systems, product development, and organizational design. Runs newsletters and blogs that dissect how products actually get built.

**Key Ideas:**
- Outcomes over outputs — measuring success by behavior change, not shipped features
- The "dual track" model: discovery and delivery running in parallel
- Complexity theory applied to product teams
- Challenging the "roadmap as commitment" mental model

**What He's Known For:**
- Painful, honest breakdowns of why product development fails
- The "170-slide decks about product" genre that cuts through BS
- Connecting systems thinking to everyday product decisions
- Making the invisible org dynamics visible

**Relevant Links:**
- [John Cutler's Medium](https://medium.com/@johncutlefish)
- [The Understanding Marketing podcast/existence]

---

### Jason Fraser
*Author & Impact Strategy Consultant*

**Background:** Impact strategy consultant with experience leading public-sector product and design teams. Clients range from the Department of Defense to nonprofits and the White House. Applies product strategy frameworks to mission-critical government work.

**Key Ideas:**
- "Impact" as a measurable outcome, not an aspirational word
- Bridging commercial product practices with government constraints
- Strategy translation: how to make framework-level thinking actionable
- Navigating the unique politics of public-sector software

**What He's Known For:**
- Making product strategy legible to non-technical stakeholders
- Working across the DoD-product divide
- Practical adaptation of OKRs in constrained environments

**Relevant Links:**
- [*Beyond The Budget: Impact Strategy* (Jason Fraser's Substack or site)](https://jasontfraser.com/) (personal site)

---

### Paul Rayner
*Founder & Author, The EventStorming Handbook*

**Background:** Software design consultant with 35+ years experience. Founder of Virtual Genius. Specializes in EventStorming, Domain-Driven Design (DDD), and collaborative modeling. Has worked with everyone from startups to Fortune 500s.

**Key Ideas:**
- EventStorming as a discovery and alignment tool
- Domain-Driven Design: bounded contexts, aggregates, domain events
- The "big picture" event storming for横跨团队 alignment
- Modeling as a collaborative, not solitary, practice

**What He's Known For:**
- *The EventStorming Handbook* — the definitive guide
- Making DDD accessible without losing rigor
- Connecting modeling to delivery (the "process" part of process modeling)

**Relevant Links:**
- [Virtual Genius](https://virtualgenius.com/)
- [EventStorming.com](https://www.eventstorming.com/)
- [*The EventStorming Handbook*](https://www.eventstorming.com/book/)

---

## 2. Core Themes Mapped to Product Work

### Theme 1: Outcomes Over Outputs

**The shift:** Moving from "did we ship?" to "did behavior change?"

This is a through-line across Cutler, Kim, and Fraser. The argument: shipping features is a leading indicator, not a goal. The goal is measurable improvement in user behavior or business outcomes.

**Product work application:**
- Define success metrics *before* building, not after
- Instrument your product to actually measure outcomes, not just funnel stages
- Challenge the roadmap-as-contract mental model — roadmaps should reflect hypotheses, not promises
- Cutler's framing: "Outputs are activities. Outcomes are results. Results are what you get paid for."

**Reference:** John Cutler's "outcomes over outputs" writings; Teresa Torres's *Continuous Discovery Habits*

---

### Theme 2: AI-Native Product Development

**The shift:** Not "add AI to the product" but "rethink the development process with AI"

Kent Beck's recent work is the bellwether here. He's been vocal about:
- AI agents as pair programmers, not just autocomplete
- "Vibe coding" — describing intent in natural language and having AI generate working code
- The need to evaluate AI output rigorously (non-deterministic systems require new quality practices)

**Product work application:**
- Prompt-driven prototyping: can you validate a concept in hours, not weeks?
- AI as a stakeholder interview simulator (role-play with an LLM)
- Rapid assumption testing using AI-generated mockups
- The new skill: evaluating AI output quality, not just producing it

**Reference:** Kent Beck's *Tidy First?*, recent Substack posts on design in TDD and AI

---

### Theme 3: Rapid Validation

**The shift:** Compressing the learning cycle from months to days

All the speakers converge here from different angles:
- Beck: tight feedback loops via TDD
- Kim: continuous delivery enabling fast experiments
- Cutler: dual-track discovery + delivery
- Rayner: EventStorming as a compressed modeling/alignment exercise
- Hsiang: government modernization proving it can be done fast

**Product work application:**
- Pretotyping before prototyping (Google's "假" before building)
- Smoke tests with real users before full build
- The "48-hour product challenge" approach to validate demand
- Impact Lab as the extreme version: day-and-a-half from problem to prototype

---

### Theme 4: Org Design for Product Teams

**The shift:** Team structure determines what gets built and how fast

Kim's Three Ways implicitly argue for org structures that enable:
- End-to-end ownership (no hand-offs)
- Fast feedback at every stage
- Psychological safety for experiments

Cutler and Fraser both address the hidden org dynamics:
- Who controls the roadmap?
- Why do good teams ship bad products?
- The politician/product manager conflict

**Product work application:**
- Team topologies that match your domain complexity
- How to identify and break siloed thinking
- Hiring/structuring for outcomes accountability

---

## 3. Reading List

### Gene Kim

| Resource | Type | Link |
|---|---|---|
| *The Phoenix Project* (novel) | Book | [IT Revolution Press](https://itrevolution.com/product/the-phoenix-project/) |
| *The DevOps Handbook* (2nd ed.) | Book | [IT Revolution Press](https://itrevolution.com/product/the-devops-handbook-2nd-edition/) |
| *Vibe Coding* (2025) | Book | [IT Revolution Press](https://itrevolution.com/product/vibe-coding/) |
| Accelerate (with Nicole Forsgren, Jez Humble) | Book | [IT Revolution Press](https://itrevolution.com/product/accelerate/) |
| State of DevOps Reports | Reports | [DORA](https://dora.dev/research/2021/dora-report/) |

**Key chapters:** *Accelerate* chapters 3–5 (technical practices); *Phoenix Project* Parts IIII for the Three Ways narrative.

---

### Kent Beck

| Resource | Type | Link |
|---|---|---|
| *Tidy First?* | Book | [Amazon](https://www.amazon.com/Tidy-First-Becoming-Minimalist-Developer/dp/B0CXNQL1M4) |
| *Implementation Patterns* | Book | [Pearson](https://www.informit.com/store/implementation-patterns-9780321413093) |
| Kent Beck's Substack | Newsletter | [tidyfirst.substack.com](https://tidyfirst.substack.com/) |
| "Design in TDD" | Article | [Substack post](https://tidyfirst.substack.com/p/design-in-tdd) |
| XP explained | Website | [c2.com/cgi/wiki?ExtremeProgramming)
---

### Mina Hsiang

| Resource | Type | Link |
|---|---|---|
| USDS Website | Official | [usds.gov](https://www.usds.gov/) |
| USDS Origins Archive | Oral History | [usdigitalserviceorigins.org](https://usdigitalserviceorigins.org/interviews/mina-hsiang/) |
| Direct File launch announcement | Article | [USDS blog](https://www.usds.gov/news/2024/03/22/direct-file) |
| Shorenstein Center interview | Article | [shorensteincenter.org](https://shorensteincenter.org/article/mina-hsiang-former-administrator-united-states-digital-service-usds-joins-shorenstein-center-fellow/) |

**Key focus:** How USDS thinks about product in government — political constraints as inputs, not blockers.

---

### John Cutler

| Resource | Type | Link |
|---|---|---|
| Medium articles | Articles | [medium.com/@johncutlefish](https://medium.com/@johncutlefish) |
| "The Product Roadmap is Not a Commitment" | Article | [Search within Medium](https://medium.com/@johncutlefish) |
| "170 Slides About Product" genre | Talk/Slides | Search "john cutler 170 slides" |
| Teresa Torres: *Continuous Discovery Habits* | Book | [Orton Family Foundation](https://www.ortonfamily.org) |

**Key focus:** Systems thinking in product; why org dynamics override process improvements.

---

### Paul Rayner / EventStorming

| Resource | Type | Link |
|---|---|---|
| EventStorming.com | Official Site | [eventstorming.com](https://www.eventstorming.com/) |
| *The EventStorming Handbook* | Book | [eventstorming.com/book/](https://www.eventstorming.com/book/) |
| Big Picture EventStorming | Article | [eventstorming.com](https://www.eventstorming.com/) |
| Domain-Driven Design Distilled (Vaughn Vernon) | Book | Addison-Wesley |

**Key focus:** EventStorming as a product discovery tool — mapping the timeline of user/system events to surface requirements and team boundaries.

---

### AI-Native Product Development

| Resource | Type | Link |
|---|---|---|
| "TDD, AI agents and coding with Kent Beck" | Interview | [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent) |
| Martin Fowler: "LLM Integration" | Article | [martinfowler.com](https://martinfowler.com/tags/llm-integration.html) |
| Evaluating AI Output (ShipSummit theme) | Conference Topic | ShipSummit Day 2 sessions |
| Generative AI for Product Managers (free course) | Course | [Google/DORA](https://dora.dev/) |

---

### Outcomes-Based Prioritization

| Resource | Type | Link |
|---|---|---|
| Teresa Torres: *Continuous Discovery Habits* | Book | [teresatorres.com](https://www.teresatorres.com/books) |
| "RightProduct" framework | Article | Search "John Cutler outcomes over outputs" |
| Measure What Matters (OKRs) | Book | John Doerr — [WhatMatters.com](https://www.whatmatters.com/) |
| The RICE framework | Article | [Intercom](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/) |

---

## 4. Talking Points + Questions

### Gene Kim

**Talking Points:**
- DevOps has moved from niche to table stakes — the question now is how it intersects with AI
- The "three ways" remain relevant even as the tooling changes
- High-performing IT orgs are 3x more likely to exceed business goals (Accelerate data)

**Questions to Ask:**
- How does vibe coding change the economics of the Three Ways? Does flow become even faster?
- What does "evaluation" look like for non-deterministic AI-generated code in a high-compliance environment?
- In *Vibe Coding*, how do you maintain institutional knowledge when the code was never "typed by hand"?

---

### Kent Beck

**Talking Points:**
- Your recent work suggests TDD can work *against* good design — what's the resolution?
- AI agents as "pair programmers who never get tired" — what's the actual productivity delta you're seeing?
- The craft vs. speed tension: where do you land in 2026?

**Questions to Ask:**
- You've been critical of TDD recently — is TDD dead, or just misunderstood?
- For a builder working on AI-native product dev: should we still practice TDD when AI is generating the implementation?
- What's the minimal testing practice that still gives you confidence in AI-generated code?

---

### Mina Hsiang

**Talking Points:**
- USDS proof-of-concept that government can ship — what broke the logjam?
- The political dimension: how do you maintain product momentum across administrations?

**Questions to Ask:**
- What's the most counter-intuitive lesson from scaling USDS from 100 to 300+?
- How do you think about "technical debt" in a government context where procurement cycles are 5+ years?
- For a product person entering government: what's the single biggest mindset shift needed?
- How did Direct File navigate the political/technical interface?

---

### John Cutler

**Talking Points:**
- The "output vs. outcome" conversation is well-worn — what's the version that actually changes behavior?
- Product org dynamics are often the real blocker, not the technology

**Questions to Ask:**
- When you say "roadmaps are hypotheses, not commitments" — how do you get leadership to buy in?
- What's the minimal viable metric framework for a team that's not measuring outcomes at all?
- How do you detect when an org has "假敏捷" (fake agility) before you commit to working there?
- What have you changed your mind about recently in product management?

---

### Jason Fraser

**Talking Points:**
- Impact strategy in government — the frameworks are the same but the constraints are different
- Bridging the DoD/product divide

**Questions to Ask:**
- How do you define and measure "impact" when the outcomes are long-horizon or diffuse?
- What product frameworks fail most often in the public sector, and why?
- How do you work with stakeholders who confuse "activities" with "outcomes"?

---

### Paul Rayner

**Talking Points:**
- EventStorming as a product discovery tool — not just for engineers
- Domain events as a bridge between product thinking and technical implementation

**Questions to Ask:**
- For a product person: what's the minimal EventStorming practice they can start using this week?
- How do you use EventStorming when the problem space isn't clearly bounded?
- Can EventStorming help with AI prompt design — mapping the "events" an AI system should recognize?
- How does EventStorming handle "the thing that doesn't happen" — absence as an event?

---

## 5. Product-Track Deep Dives

### 5a. AI-Native Product Development Frameworks

**What it means:** Building product development workflows where AI is a first-class participant, not an add-on. This goes beyond "use Copilot" to rethinking:

- **Prompt as specification** — can you write a prompt precise enough to generate working code?
- **LLM as stakeholder** — role-play user interviews, edge cases, objection handling with an LLM
- **Rapid prototyping loops** — describe → generate → evaluate → refine → generate

**Frameworks to know:**

1. **Vibe Coding** (Kent Beck): Intent expressed in natural language → code. Emphasis on evaluation and iteration over generation.

2. **AI-Augmented Discovery** (Teresa Torres + others): Use LLMs to generate hypothesis variants, interview scripts, and mockups before building.

3. **Prompt-Driven Prototyping**: Treat prompts like specifications. Version them. Test them against edge cases.

4. **Evaluation-Driven Development (EDD)**: Traditional TDD tests correctness. AI-native TDD tests *alignment* — does the AI output match intent? This is the hard unsolved problem.

**Key tension:** AI can generate fast, but evaluating non-deterministic output is expensive. The bottleneck shifts from production to validation.

**ShipSummit sessions to prioritize:**
- Human–AI Collaboration workshops
- Evaluating AI Output sessions
- Vibe Coding hands-on

---

### 5b. Outcomes-Based Prioritization

**The problem:** Most teams prioritize by urgency, stakeholder influence, or "strategy theater." Actual outcome measurement is rare.

**The framework (synthesized from Cutler, Torres, Fraser):**

```
Outcome: [Verb] + [Object] + [Metric]
─────────────────────────────────────
Example: "Reduce abandoned carts by 15%"
          verb     object    metric

Not:     "Ship the new checkout flow"
          activity, not outcome
```

**Prioritization layers:**

1. **Hypothesis layer** — what do we think will cause the outcome to move?
2. **Output layer** — what do we build to test the hypothesis?
3. **Activity layer** — what does the team actually do day-to-day?

Most orgs only see layer 3. Product's job is to surface layer 1.

**Practical approach (RICE → Impact mapping):**

| Factor | RICE | Outcome-Based |
|---|---|---|
| Reach | How many people | How many will actually *change behavior* |
| Impact | Estimated % lift | Actual measured lift |
| Confidence | Judgment call | Validated with pretotype |
| Effort | Person-weeks | Opportunity cost |

**The OKR trap:** OKRs set at the org level often don't cascade correctly to product teams. Fix: co-create outcome metrics with the team doing the work.

**ShipSummit sessions to prioritize:**
- Lean Execution workshops
- Fast Experimentation sessions
- Any Cutler session on outcomes

---

### 5c. Cross-Team Alignment in Complex Systems

**The problem:** Large organizations have multiple teams with partial, overlapping views of the same product. Features get built that conflict. Dependencies become blockers. "Done" means different things to different teams.

**Keyframe works:**

1. **Bounded Contexts (DDD)** — Paul Rayner's specialty. Each team owns a coherent domain model. Cross-context communication happens via events/APIs, not shared databases.

2. **Team Topologies (Matthew Skelton/Nicolas Manuel)** — Four fundamental team types: stream-aligned, platform, enabling, complicated-subsystem. Anti-pattern: the "two-pizza team" that tries to do everything.

3. **EventStorming for org alignment** — Map the events that flow *between* teams, not just within a team. Where events don't connect, there are gaps. Where events conflict, there are dependencies.

4. **Inverse Conway Maneuver** — Design your team interactions to produce the architecture you want. Architecture follows org structure.

**Practical questions to ask in alignment sessions:**

```
1. What events does our team produce that other teams consume?
2. What events do we consume that other teams produce?
3. Where do events from multiple teams need to be combined?
4. What events should happen but currently have no owner?
5. What does "done" mean for this feature across all teams?
```

**Hard case: government.** USDS's experience shows that cross-team alignment in government is complicated by procurement, security review cycles, and political oversight. The alignment patterns still apply, but timelines are longer.

**ShipSummit sessions to prioritize:**
- Paul Rayner's EventStorming sessions
- Any platform engineering session on team APIs
- Impact Lab (Day 2–3) — the avalanche challenge is inherently cross-team

---

## 6. Impact Lab: Operation Avalanche

### The Challenge

**Avalanche forecasting** is a real-time data and coordination problem. Multiple data sources, multiple stakeholders, multiple agencies, compressed time windows, and lives on the line.

### Why It Matters for Product Development

| Aspect | Product Parallel |
|---|---|
| Real-time data ingestion | Feature flags, analytics, monitoring |
| Multiple data sources | User research, market data, operational data |
| Time-sensitive decisions | Sprint planning, incident response |
| Lives on the line | A/B tests with revenue impact; core product quality |
| Cross-agency coordination | Cross-team feature delivery |
| Communicating uncertainty | Communicating technical risk to stakeholders |

### The Data Problem

Avalanche forecasting combines:
- **Weather data** (temperature, wind, precipitation)
- **Snowpack data** (layer analysis, stability tests)
- **Terrain data** (slope angle, aspect, elevation)
- **Historical data** (past incidents, patterns)
- **Real-time observations** (field reports, satellite imagery)

These sources are:
- In different formats
- Updated at different frequencies
- Owned by different agencies (NOAA, USFS, state avalanche centers)
- Incomplete by definition (you can't observe what's underneath)

This is a classic **data integration problem** — the same challenge as building a unified product analytics platform or a cross-team customer view.

### The Coordination Problem

Multiple agencies with different:
- Data-sharing agreements
- Technical infrastructure
- Decision-making authority
- Communication protocols

Getting information to the right person at the right time requires:
- Clear product vision (what's the "single source of truth"?)
- API design (how do systems talk to each other?)
- UX for high-stakes decision-making (what does the forecaster actually need?)
- Org alignment (who owns the final forecast?)

### Product Implications

Operation Avalanche is designed to compress months of product work into a day and a half:
- Define the product (what are we building?)
- Design the experience (what does a forecaster see?)
- Build the integration (how do we get data in?)
- Ship a prototype (does it work?)
- Present to the group (did we prove the concept?)

**For T specifically:** The challenge is well-matched to Abraxas-style multi-skill reasoning — parsing heterogeneous data sources, making inferences under uncertainty, and presenting coherent outputs.

---

## Appendix: ShipSummit Logistics

| Item | Details |
|---|---|
| **Dates** | March 31 (Day 1 keynotes), April 1 (Day 2 Impact Lab), April 2 (Day 3 presentations) |
| **Venue** | Grand Hyatt Deer Valley, Park City, Utah |
| **Pass** | Builder pass — all sessions, Impact Labs, meals |
| **Product Track Focus** | Rapid delivery, AI frameworks, outcomes, cross-team alignment |
| **Impact Lab Challenge** | Operation Avalanche — avalanche forecasting data/coordination |
| **Key Sessions** | Day 1 keynotes (all speakers), Day 2 hands-on Impact Lab, Day 3 presentations |

---

*Generated: 2026-03-31*  
*For: Tyler Garlick*  
*Repo: tylergarlick/research*
