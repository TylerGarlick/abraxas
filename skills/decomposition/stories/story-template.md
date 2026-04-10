# Story Template

Copy this template when creating a new story. Fill in all required fields.

```markdown
## Story: [Short, clear title describing what the user gets]

- **Type:** feature | bugfix | chore | spike
- **Effort:** XS | S | M | L | XL
- **Priority:** P0 | P1 | P2 | P3
- **Acceptance Criteria:**
  1. AC1: Given [context] When [action] Then [result]
  2. AC2: Given [context] When [action] Then [result]
  3. AC3: Given [context] When [action] Then [result]
- **Verification:** 
  - Manual: [How to manually verify]
  - Automated: [Test command or test name]
- **Dependencies:** [List any blocking stories or external dependencies, or "None"]
```

---

## Field Guide

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| **Type** | Yes | `feature`, `bugfix`, `chore`, `spike` | What kind of work is this? |
| **Effort** | Yes | `XS`, `S`, `M`, `L`, `XL` | XS=~1h, S=~4h, M=~1d, L=~3d, XL=>3d |
| **Priority** | Yes | `P0`, `P1`, `P2`, `P3` | P0=blocker, P1=critical, P2=normal, P3=nice-to-have |
| **Acceptance Criteria** | Yes | BDD format | At least one. Use Given/When/Then. |
| **Verification** | Yes | Free text | How do you know it's done? |
| **Dependencies** | No | List or "None" | Blocking stories or external deps |

---

## Example Filled Story

```markdown
## Story: User can filter transactions by date range

- **Type:** feature
- **Effort:** S
- **Priority:** P1
- **Acceptance Criteria:**
  1. AC1: Given the user is on the Transactions page, When they select a date range from the filter dropdown, Then only transactions within that range are displayed.
  2. AC2: Given the user has filtered the list, When they click "Clear Filters", Then all transactions are shown again.
- **Verification:** 
  - Manual: Apply date filter, verify results match expected date range, clear and confirm all return.
  - Automated: Run `npm test -- --grep "date filter"` and confirm all tests pass.
- **Dependencies:** None
```
