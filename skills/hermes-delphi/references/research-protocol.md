# Research Protocol

## Overview

This document defines the research methodology for the Hermes-Delphi autonomous system. All research agents must follow these protocols to ensure consistent, high-quality intelligence gathering.

---

## Research Workflow

```
1. Topic Definition
        │
        ▼
2. Source Identification
        │
        ▼
3. Data Collection
        │
        ▼
4. Quality Filtering
        │
        ▼
5. Epistemic Labeling
        │
        ▼
6. Storage & Indexing
```

---

## Source Prioritization

### Tier 1 (Highest Confidence)
- Academic papers and peer-reviewed sources
- Government data and official statistics
- Primary company sources (press releases, official blogs)
- Verified GitHub repositories with activity

### Tier 2 (Medium Confidence)
- Industry publications and analyst reports
- News outlets with editorial oversight
- Professional networking sites (LinkedIn, industry forums)
- Aggregated data services

### Tier 3 (Lower Confidence)
- Social media and informal sources
- Unverified crowd-sourced information
- Speculative reports and predictions
- Anonymous sources

---

## Search Query Templates

### Competitor Analysis
```
{competitor_name} news 2024
{competitor_name} product launch
{competitor_name} funding raised
{competitor_name} hiring
{competitor_name} technology stack
{competitor_name} pricing
```

### Market Trends
```
{industry} trends 2024
{industry} market size
{industry} emerging technology
{industry} startup funding
{industry} regulations
{industry} growth forecast
```

### Technical Research
```
{technology} documentation
{technology} github
{technology} benchmarks
{technology} comparison
{technology} alternatives
{technology} reviews
```

---

## Data Freshness Standards

| Source Type | Freshness Threshold | Action if Stale |
|-------------|---------------------|-----------------|
| News | 24 hours | Flag as outdated |
| Blog posts | 7 days | Flag as potentially outdated |
| Reports | 30 days | Include with date caveat |
| Academic | 90 days | Acceptable for most purposes |
| Official docs | Always current | Note if no recent updates |

---

## Finding Quality Criteria

### Minimum Viable Finding
- Source URL or attribution
- Timestamp
- Topic tag
- Summary (max 280 characters)
- Confidence label

### High Quality Finding
- All minimum criteria
- Multiple source verification
- Detailed notes
- Relevance score to monitored topics
- Expiration date (if time-sensitive)

---

## Duplicate Detection

Before storing a finding, check for duplicates:
1. Compare URL (exact match = duplicate)
2. Compare summary (80%+ similarity = potential duplicate)
3. Compare topic + date + source (same = likely duplicate)

If duplicate detected:
- Update existing finding with new timestamp
- Do not create new entry
- Log deduplication event

---

## Epistemic Labeling Guidelines

### Sol (Positive/Confident)
Use when:
- Multiple independent Tier 1 sources agree
- Official announcement or confirmation exists
- Data is recent and verifiable
- Clear causal relationship stated

Examples:
- "Company X raised $50M Series B [Sol] - source: TechCrunch official"
- "Product Y launched with feature Z [Sol] - source: official blog"

### Nox (Skeptical/Uncertain)
Use when:
- Single source only (especially Tier 3)
- Contradicts established consensus
- Forward-looking statement or prediction
- Anonymous or unverified source
- Vague or hedged language

Examples:
- "Rumors suggest Company X may pivot [Nox] - source: anonymous tip"
- "Analyst predicts market shift [Nox] - source: speculation, unverified"

### Meridian (Balanced/Neutral)
Use when:
- Sources disagree (requires explanation of both)
- Mixed signals from multiple sources
- Balanced reporting without clear conclusion
- Comparison without judgment

Examples:
- "Product X receives mixed reviews [Meridian] - positive: TechRadar, concerns: Reddit users"
- "Industry analysts divided on trend [Meridian] - bulls: Goldman, bears: Morgan Stanley"

---

## Alert Thresholds

### High Priority (Score 0.9+)
- Critical competitive intel (acquisition, major product launch)
- Market-moving news
- Direct client threat identified

### Medium Priority (Score 0.7-0.9)
- Emerging trends with multiple indicators
- Competitor expansion signals
- Technology shifts

### Low Priority (Score 0.5-0.7)
- Routine updates
- Minor announcements
- Industry noise

---

## Storage Format

All findings stored in YAML with this schema:

```yaml
finding_id: uuid
topic: string
source_type: web|github|news|social|api
source_url: string
source_name: string
title: string
summary: string (max 280 chars)
confidence: sol|nox|meridian
confidence_evidence: string
timestamp: ISO-8601
collected_at: ISO-8601
tags: [string]
relevance_score: float (0.0-1.0)
expires_at: ISO-8601 (optional)
alert_level: low|medium|high (optional)
client_ids: [string] (if relevant to specific clients)
```

---

## Rate Limiting

- Web searches: 100 per hour max
- Web fetches: 200 per hour max
- GitHub API: 5000 per hour (authenticated)
- External API calls: 1000 per hour max

---

## Error Handling

| Error | Response |
|-------|----------|
| Search fails | Retry once, then log error and continue |
| Source returns 404 | Mark as `error: source_gone`, archive URL |
| Source rate limited | Back off exponentially, log event |
| No results | Log "no findings" with query and date |
| Timeout | Retry once with longer timeout, then log |
