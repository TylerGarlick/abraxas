# Decomposition Skill

**Purpose:** Enforce consistent story format and acceptance criteria across all workstreams. Use this skill when creating new work items — both humans and subagents.

---

## When to Use This Skill

- **Task:** Someone asks you to decompose an epic or feature into smaller stories
- **Task:** You're creating a new story and need to format it correctly
- **Task:** You need to validate that a story conforms to the schema

---

## Story Decomposition Process

When given a feature or epic, break it into smaller, testable stories:

1. **Identify user value** — What does the user actually get?
2. **Find the smallest shippable unit** — What can be tested independently?
3. **Separate concerns** — Auth, data, UI, notifications = separate stories
4. **Order by dependency** — What must be built first?
5. **Size stories** — Target XS–M effort. If L or XL, split further.

**Rule:** A story is done when it can be demonstrated to a stakeholder without additional work.

---

## Story Format Schema

Every story MUST follow this structure:

```markdown
## Story: [short, clear title]

- **Type:** feature | bugfix | chore | spike
- **Effort:** XS | S | M | L | XL
- **Priority:** P0 | P1 | P2 | P3
- **Acceptance Criteria:**
  1. AC1: Given [context] When [action] Then [result]
  2. AC2: Given [context] When [action] Then [result]
- **Verification:** How to verify this story is complete
- **Dependencies:** Any blocking stories or external dependencies
```

### Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| **Type** | Yes | `feature` (new work), `bugfix` (fix), `chore` (maintenance), `spike` (research) |
| **Effort** | Yes | Size estimate: XS (~1h), S (~4h), M (~1d), L (~3d), XL (>3d) |
| **Priority** | Yes | P0 (blocker), P1 (critical), P2 (normal), P3 (nice-to-have) |
| **Acceptance Criteria** | Yes | BDD-style Given/When/Then. At least one. |
| **Verification** | Yes | How do you know it's done? |
| **Dependencies** | No | Any blocking stories or external deps |

---

## Acceptance Criteria Rules

Each acceptance criterion MUST:
- Use **Given / When / Then** format (BDD-style)
- Be **measurable** — can you test it? Yes or no.
- Have a **clear result** — what happens when it passes?

### Good AC Example
```
AC1: Given the user is logged in, When they click "Export Report", Then a CSV file downloads with correct data.
```

### Bad AC Examples (and why)
```
AC1: User should be able to export reports.          ← Missing Given/When/Then
AC1: System should work well.                          ← Not measurable
AC1: Given I am logged in, When I click export, Then... ← Incomplete
```

---

## Enforcement

### Validation Script

Run the validator before committing or closing a story:

```bash
npx ts-node scripts/validate-story.ts stories/my-story.md
```

### What Gets Validated

- All required fields present (Type, Effort, Priority, Acceptance Criteria, Verification)
- Type is one of: feature, bugfix, chore, spike
- Effort is one of: XS, S, M, L, XL
- Priority is one of: P0, P1, P2, P3
- At least one Acceptance Criterion exists
- Each AC follows Given/When/Then format

### Rejection Criteria

Stories will be **rejected** if:
- Missing required fields
- Acceptance criteria don't use Given/When/Then format
- No measurable acceptance criteria
- No verification method defined

---

## Examples

### ✅ Well-Formed Story

```markdown
## Story: User can export transaction history as CSV

- **Type:** feature
- **Effort:** M
- **Priority:** P1
- **Acceptance Criteria:**
  1. AC1: Given the user is logged in and has transaction history, When they navigate to the Reports page and click "Export", Then a CSV file downloads containing all transactions in the correct date range.
  2. AC2: Given the user has no transactions, When they click "Export", Then an empty CSV with headers only is downloaded.
  3. AC3: Given the user has more than 10,000 transactions, When they click "Export", Then the download completes within 30 seconds.
- **Verification:** 
  - Manual: Navigate to Reports, click Export, open CSV in Excel, verify data matches UI
  - Automated: Run `npm test -- --grep "export"` and confirm all tests pass
- **Dependencies:** None
```

### ❌ Poorly-Formed Story (Before)

```markdown
## Story: Export feature

User wants to export data.

- Type: feature
- Priority: high
- AC: Should work well
```

**Problems:**
- No effort estimate
- Priority is "high" instead of P0–P3
- Acceptance criterion is vague ("Should work well")
- No Given/When/Then format
- No verification method
- No dependencies listed (even if none)

### ✅ Fixed Story (After)

```markdown
## Story: User can export transaction history as CSV

- **Type:** feature
- **Effort:** M
- **Priority:** P1
- **Acceptance Criteria:**
  1. AC1: Given the user is logged in and has transaction history, When they navigate to the Reports page and click "Export", Then a CSV file downloads containing all transactions in the correct date range.
- **Verification:** Navigate to Reports, click Export, open CSV, verify data matches UI.
- **Dependencies:** None
```

---

## Integration with Mission Control

This skill integrates with Mission Control for task creation:

1. When **Task:** creates a new story, use this skill to format it
2. Stories are stored in the `stories/` directory
3. Use `validate-story.ts` to verify before closing tasks
4. Task status: Use **closed** (not done) to mark completion in BEADS

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npx ts-node scripts/validate-story.ts <file>` | Validate a story file |
| `stories/story-template.md` | Template for new stories |

---

## Metadata

- **Skill:** decomposition
- **Version:** 1.0.0
- **Author:** Avalanche Team
- **BEADS_DIR:** /home/ubuntu/.openclaw/workspace/mc/.beads
