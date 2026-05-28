# Billing Schema

## Overview

Data schemas and rate configurations for the Logismos billing agent.

---

## Usage Record Schema

```yaml
usage_record:
  usage_id: uuid
  timestamp: ISO-8601
  
  client_id: string
  client_name: string
  
  action: 
    enum: [research_query, brief_generation, delivery, outreach_sequence, linkedin_action]
    
  details:
    # For research_query:
    query?: string
    sources_accessed?: number
    search_type?: web|github|news
    
    # For brief_generation:
    brief_id?: string
    brief_type?: executive|technical|strategic
    finding_count?: number
    
    # For delivery:
    delivery_id?: string
    format?: markdown|html|pdf
    
    # For outreach_sequence:
    sequence_id?: string
    prospect_name?: string
    
    # For linkedin_action:
    action_type?: connect|message|endorse|engage
    prospect_id?: string
    
  quantity: number
  unit: string
  unit_price: number
  total: number
  
  rate_tier: base|premium|enterprise
  
  billing_period:
    month: number (1-12)
    year: number
    
  recorded: ISO-8601
  billed: boolean (default: false)
  invoice_id?: string (if billed)
```

---

## Invoice Schema

```yaml
invoice:
  invoice_id: string  # Format: INV-YYYYMM-CLIENTCODE-SEQ
  
  # Client Information
  client_id: string
  client_name: string
  client_email: string
  client_address?: string
  
  # Billing Period
  period:
    start: date (YYYY-MM-DD)
    end: date (YYYY-MM-DD)
    
  # Line Items
  line_items:
    - category: research|briefs|delivery|outreach
      description: string
      quantity: number
      unit_price: number
      total: number
      
  # Totals
  subtotal: number
  tax_rate: number (e.g., 0.0 for no tax, 0.08 for 8%)
  tax_amount: number
  total: number
  
  # Status
  status: draft|sent|paid|overdue|cancelled
  issue_date: date
  due_date: date
  paid_date?: date
  
  # Metadata
  created: ISO-8601
  updated: ISO-8601
  version: number (for audit trail)
  
  # Notes
  notes?: string
  payment_instructions: string
  
  # Audit
  created_by: string (agent name)
  last_modified_by: string
  modifications:
    - modified_at: ISO-8601
      modified_by: string
      change_description: string
```

---

## Rate Configuration Schema

```yaml
rate_config:
  version: string (semver)
  updated: ISO-8601
  updated_by: string
  
  services:
    research_query:
      base: 0.01  # USD per query
      premium: 0.02
      unit: per_query
      
    brief_generation:
      executive: 50  # USD per brief
      technical: 75
      strategic: 150
      unit: per_brief
      
    delivery:
      markdown: 0  # included
      html: 0      # included
      pdf: 10      # USD per delivery
      unit: per_delivery
      
    outreach_sequence:
      standard: 25
      unit: per_sequence
      
    linkedin_action:
      base: 5
      unit: per_action
      
  rate_tiers:
    base:
      multiplier: 1.0
      description: Standard rates
      
    premium:
      multiplier: 1.5
      description: Volume discount (100+ queries/mo, 5+ briefs/mo)
      
    enterprise:
      multiplier: 2.0
      description: Full service (custom SLAs, dedicated support)
      
  tax:
    rate: 0.0  # decimal (0.0 = no tax)
    applicability: all|selective
    
  payment:
    terms_days: 14
    late_fee_percentage: 0.0
    late_fee_grace_days: 0
    
  currency: USD
```

---

## Client Billing Profile Schema

```yaml
client_billing:
  client_id: string
  
  billing_contact:
    name: string
    email: string
    phone?: string
    
  billing_address:
    street: string
    city: string
    state: string
    postal_code: string
    country: string
    
  billing_preferences:
    invoice_format: pdf|html
    invoice_email: string
    po_number_required: boolean
    po_number?: string
    
  rate_tier: base|premium|enterprise
  custom_rates?: 
    # Override specific rates for this client
    {service_name}: number
    
  tax_exempt: boolean
  tax_id?: string
  
  payment_method:
    type: invoice|credit_card|ach
    details: string (last 4 or reference)
    
  credit_limit?: number
  current_balance: number
  
  standing:
    status: current|overdue|suspended
    since: date (if overdue)
    total_overdue: number
    
  notes: string
```

---

## Report Schemas

### Monthly Summary Report

```yaml
monthly_report:
  report_id: string
  period:
    month: number
    year: number
  generated: ISO-8601
  
  summary:
    total_revenue: number
    total_invoices: number
    paid_invoices: number
    paid_amount: number
    outstanding_invoices: number
    outstanding_amount: number
    
  revenue_by_service:
    research: { amount, count, percentage }
    briefs: { amount, count, percentage }
    delivery: { amount, count, percentage }
    outreach: { amount, count, percentage }
    
  revenue_by_client:
    - client_id: string
      client_name: string
      revenue: number
      invoices: number
      
  period_comparison:
    vs_last_month: { percentage, direction }
    vs_last_quarter: { percentage, direction }
    vs_last_year: { percentage, direction }
```

---

## Audit Trail Schema

```yaml
audit_entry:
  entry_id: uuid
  timestamp: ISO-8601
  
  entity_type: usage|invoice|client_rate|rate_config
  entity_id: string
  
  action: created|updated|billed|paid|cancelled
  
  previous_state?: object
  new_state: object
  
  performed_by: string (agent name)
  reason?: string
```

---

## Rate Calculation Examples

### Example 1: Research Query (Base Tier)
```
Action: research_query
Sources: 5 web searches
Rate: $0.01/query
Calculation: 5 × $0.01 = $0.05
```

### Example 2: Executive Brief (Premium Client)
```
Action: brief_generation
Type: executive
Rate: $50
Client Tier: premium (1.5×)
Calculation: $50 × 1.5 = $75
```

### Example 3: PDF Delivery (Enterprise Client)
```
Action: delivery
Format: PDF
Rate: $10
Client Tier: enterprise (2.0×)
Calculation: $10 × 2.0 = $20
```

### Example 4: Full Outreach Sequence
```
Actions: 1 outreach_sequence + 3 linkedin_action + 2 followup emails
Sequence: $25
LinkedIn actions: 3 × $5 = $15
Emails: included in sequence
Subtotal: $25 + $15 = $40
```
