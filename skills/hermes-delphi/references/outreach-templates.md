# Outreach Templates

## Overview

This document contains all outreach templates used by the Prodos agent for client prospecting and engagement.

---

## Email Templates

### Initial Outreach Email

```markdown
Subject: {Personalization hook - specific to them}

Hi {First Name},

{I noticed/recently saw} {specific observation about their work or company}.

{Market insight or trend} that might be relevant to {their challenge or interest}.

{Would you be open to a brief call to explore this further?}

Best,
{Agent Name}
```

**When to use:** First contact with a prospect. Must be personalized with specific observation about recipient.

**Key elements:**
- Personalization hook in subject
- Specific observation (not generic)
- Relevant market insight
- Soft CTA (call to action)

---

### Follow-Up Email

```markdown
Subject: Re: {Original subject} - {New angle}

Hi {First Name},

Following up on my note from {days_ago}.

{Came across / Noticed} {new insight, data point, or article} that I thought might resonate given {their specific context or challenge}.

{One key takeaway or question}.

No pressure to respond - just wanted to make sure this reached you.

Best,
{Agent Name}
```

**When to use:** Day 3 follow-up in sequence. Adds new value while referencing previous contact.

**Key elements:**
- Reference to previous email
- New value/insight
- Low-pressure tone

---

### Value Add Email

```markdown
Subject: {Industry insight} - thought you might find this interesting

Hi {First Name},

Sharing this {report/data/insight} because {specific reason it relates to them}.

{2-3 sentences on the key findings or implications}.

Happy to discuss if you find this relevant to {their current initiative}.

Best,
{Agent Name}
```

**When to use:** Day 7 in sequence. Pure value, no selling.

**Key elements:**
- No ask
- Pure value provision
- Easy opt-out

---

### Final Outreach Email

```markdown
Subject: {Final}

Hi {First Name},

I've enjoyed sharing these insights with you and will respect your time going forward.

If you'd ever like to continue this conversation, I'm here. Otherwise, I'll close the loop here.

Best,
{Agent Name}
```

**When to use:** Day 14 final outreach in sequence. Professional close.

**Key elements:**
- Acknowledges no response
- Professional exit
- Door left open

---

## LinkedIn Templates

### Connection Request Note

```
{I noticed your work on [specific project/initiative]. 
[One insight or observation] that [relates to their focus area]. 
Happy to connect to [common ground or purpose].}
```

**Character limit:** 300 characters max

**Key elements:**
- Personalization (not "I'd like to connect")
- Specific reason
- Common ground

---

### LinkedIn Message (Post-Connection)

```markdown
Hi {First Name}, thanks for connecting!

{I noticed [specific observation].} [One sentence on relevance or value.]

{Soft ask or opening for conversation.}

Looking forward to {staying in touch / learning more about your work}.
```

---

### LinkedIn Engage (Comment)

```markdown
{Genuine, specific comment about their content}
```

**Rules:**
- Always specific, never generic ("Great post!")
- Add value or insight
- Related to their content topic
- No selling or pitching

---

## Outreach Sequence Templates

### Standard Sequence

```yaml
sequence_id: standard
name: Standard 4-Step Sequence
steps:
  - step: 1
    day: 0
    channel: linkedin|email
    template: initial
    alternative: fallback_email (if linkedin not available)
    
  - step: 2
    day: 3
    channel: email
    template: followup
    
  - step: 3
    day: 7
    channel: email
    template: valueadd
    
  - step: 4
    day: 14
    channel: email
    template: final
```

---

### Content-Led Sequence

```yaml
sequence_id: content-led
name: Content-Led Sequence
steps:
  - step: 1
    day: 0
    channel: email
    template: initial_with_content_link
    content: {relevant research brief or article}
    
  - step: 2
    day: 5
    channel: linkedin
    template: engage_with_content
    
  - step: 3
    day: 10
    channel: email
    template: followup_on_content
    
  - step: 4
    day: 18
    channel: email
    template: final
```

---

### Warm Introduction Sequence

```yaml
sequence_id: warm-intro
name: Warm Introduction Sequence
steps:
  - step: 1
    day: 0
    channel: linkedin
    template: warm_initial
    note: {mutual connection or referral context}
    
  - step: 2
    day: 2
    channel: email
    template: warm_followup
    reference: {referrer name or context}
    
  - step: 3
    day: 7
    channel: email
    template: valueadd
    
  - step: 4
    day: 14
    channel: linkedin|email
    template: final
```

---

## Personalization Variables

These variables should be filled in for each prospect:

| Variable | Description | Source |
|----------|-------------|--------|
| `{First Name}` | Prospect's first name | Prospect profile |
| `{Company}` | Company name | Prospect profile |
| `{Title}` | Their job title | Prospect profile |
| `{Recent Achievement}` | Notable work/project | LinkedIn, website |
| `{Specific Observation}` | Why you're reaching out | Research |
| `{Industry Trend}` | Relevant to their field | Research |
| `{Common Ground}` | Shared connection | LinkedIn |
| `{Mutual Connection}` | Referrer name | Prospect profile |
| `{Agent Name}` | Your name | Config |

---

## Template Selection Guidelines

### When to Use Each Sequence

| Prospect Type | Recommended Sequence |
|---------------|---------------------|
| Cold prospect (no prior contact) | Standard 4-Step |
| Warm lead (engaged with content) | Content-Led |
|引Referral/introduction | Warm Introduction |
| Enterprise target | Extended (6 steps) |
| SMB target | Compressed (3 steps) |

### Template Selection

| Signal | Choose Template |
|--------|-----------------|
| Technical audience | More data, less story |
| Executive audience | Strategic framing, no jargon |
| Startup founder | Speed, outcome-focused |
| Enterprise buyer | Relationship, risk-reduction |
| VC/Investor | Market opportunity, traction |

---

## Compliance & Best Practices

### Email
- Include physical mailing address
- Include unsubscribe link
- No misleading subject lines
- No false pretenses

### LinkedIn
- Connection requests under 300 chars
- No mass invites
- No unsolicited promotional content
- Respect connection acceptance

### General
- Honor opt-out immediately
- No purchased lists
- Bounce handling after 2 failures
- Complaint handling = immediate removal
