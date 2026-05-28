# Feedback Analysis Framework

## Overview

This document defines the methodology for analyzing client feedback, including sentiment calculation, theme extraction, and routing logic.

---

## Feedback Collection

### Collection Methods
- **Direct email response:** Reply to delivery confirmation
- **Periodic survey:** Request after 3rd delivery
- **On-demand:** Client-initiated feedback

### Collection Template
```markdown
Subject: Feedback request: {brief_topic}

Hi {Client Name},

Thank you for receiving "{brief_title}".

To help us improve, please rate:
1. Relevance (1-5): _
2. Timing (too early/right time/too late): _
3. Format preference (MD/HTML/PDF): _
4. Most valuable finding: _
5. Improvement suggestions: _

Reply directly to share feedback.
```

---

## Sentiment Analysis

### Dimension Scoring

Each feedback is scored on 5 dimensions (0.0 - 1.0):

| Dimension | Indicators | Weight |
|-----------|-----------|--------|
| Content Quality | relevance, accuracy, depth, completeness | 0.30 |
| Timing | early, late, right time, frequency | 0.20 |
| Format | format mentioned, preference stated | 0.20 |
| Value | useful, valuable, waste, helpful | 0.20 |
| Actionability | clear next steps, unclear, actionable | 0.10 |

### Sentiment Formula
```
overall_sentiment = (content_quality * 0.30) + 
                    (timing * 0.20) + 
                    (format * 0.20) + 
                    (value * 0.20) + 
                    (actionability * 0.10)
```

### Sentiment Labels
- **Positive:** 0.70 - 1.00
- **Neutral:** 0.40 - 0.69
- **Negative:** 0.00 - 0.39

---

## Theme Extraction

### Explicit Themes
Direct mentions in feedback:

| Theme | Positive Indicators | Negative Indicators |
|-------|--------------------|--------------------|
| Content Quality | relevant, useful, thorough, accurate | irrelevant, shallow, inaccurate, missing |
| Timing | right time, good timing, not too often | too often, too early, too late, infrequent |
| Format | prefer, like, easy to read | hard to read, wrong format, prefer X |
| Value | valuable, helpful, actionable, worthwhile | waste, not useful, no value |
| Actionability | clear next steps, actionable, know what to do | unclear, don't know what to do |

### Implicit Themes
Inferred from context:

| Inference | Evidence | Weight |
|-----------|---------|--------|
| High engagement | Detailed positive response | 0.8 |
| Low engagement | Brief, generic response | 0.6 |
| Specific issue | Detailed negative section | 0.9 |
| Overall satisfaction | Overall rating given | 1.0 |

---

## Routing Logic

### Primary Routing Table

| Dominant Theme | Route To | Reason |
|---------------|----------|--------|
| Content quality | Mythos | Brief content needs review |
| Timing | Dromos | Delivery schedule adjustment |
| Format | Dromos | Format preference change |
| Value | Keres | Research focus review |
| Actionability | Mythos | Recommendation clarity |

### Secondary Routing
Additional routing for specific insights:

| Insight Type | Route To | Action |
|-------------|----------|--------|
| Competitor mention | Keres | Add to competitor monitoring |
| Industry trend | Keres | Add trend monitoring |
| Client success | All | Log success pattern |
| System error | Operator | Log and investigate |

---

## Adaptation Rules

### Automatic Adaptations
Based on feedback patterns:

```yaml
adaptation_rules:
  - condition: "3+ consecutive negative timing scores"
    action: "reduce delivery frequency"
    agent: dromos
    
  - condition: "2+ requests for different format"
    action: "update client format preference"
    agent: dromos
    
  - condition: "content quality < 0.5"
    action: "flag client for priority brief review"
    agent: mythos
    
  - condition: "overall sentiment < 0.4"
    action: "trigger client check-in"
    agent: operator
```

---

## Trend Analysis

### Window Sizes
- **Immediate:** Single feedback
- **Short-term:** Last 5 feedbacks (2-4 weeks)
- **Medium-term:** Last 15 feedbacks (1-3 months)
- **Long-term:** Last 50 feedbacks (quarter+)

### Trend Detection
- Improving: 3+ consecutive period increases
- Declining: 3+ consecutive period decreases
- Stable: No significant change
- Volatile: High variance between periods

---

## Reporting

### Feedback Report Schema
```yaml
feedback_report:
  report_id: string
  period: {start, end}
  generated: ISO-8601
  
  summary:
    total_received: number
    response_rate: percentage
    average_sentiment: number
    
  sentiment_distribution:
    positive: {count, percentage}
    neutral: {count, percentage}
    negative: {count, percentage}
    
  dimension_averages:
    content_quality: number
    timing: number
    format: number
    value: number
    actionability: number
    
  top_themes:
    praises: [{theme, count}]
    criticisms: [{theme, count}]
    suggestions: [{theme, count}]
    
  client_sentiment:
    - client_id: string
      average_sentiment: number
      trend: improving|stable|declining
      feedback_count: number
```

---

## Quality Assurance

1. All feedback analyzed within 24 hours of receipt
2. All analysis routed to appropriate agent
3. All adaptations tracked and reviewed
4. Monthly sentiment reports generated
5. Quarterly trend analysis completed
