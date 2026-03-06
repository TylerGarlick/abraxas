---
name: your-skill-name
description: >
  One or two sentences describing what this skill does and when to use it.
  The description is shown in skill pickers and is the first thing a user reads.
  Write it from the user's perspective: "Use this skill when you want to..."
---

# Your Skill Name

<!-- Replace the sections below with your skill's actual content. -->
<!-- Delete this comment block when you ship. -->

## Purpose

What problem does this skill solve? One paragraph. Be specific about the failure mode
it addresses and why existing tools or prompting patterns don't solve it well.

---

## Commands

| Command | Description |
|---------|-------------|
| `/your-skill open` | Start a session |
| `/your-skill status` | Show current session state |
| `/your-skill close` | End and summarize the session |

<!-- Add all commands your skill provides. Every command should have a description. -->
<!-- Aim for 4–8 commands. More than 10 is a sign the skill should be split. -->

---

## Command Reference

### `/your-skill open`

**Purpose:** Begin a new session.

**Behavior:** [Describe what the system does when this command is invoked. Be specific: what
state is set, what is output, what is expected from the user next.]

**Example:**
```
/your-skill open
```

---

### `/your-skill status`

**Purpose:** Show the current session state.

**Behavior:** [Describe what is shown. If the skill maintains a ledger or tracked state,
describe what fields appear in the status output.]

**Example:**
```
/your-skill status
```

---

### `/your-skill close`

**Purpose:** End the session and produce a summary.

**Behavior:** [Describe what is output at close. What is preserved? What is reset?
If the skill writes to persistent storage, describe the file format and location.]

**Example:**
```
/your-skill close
```

---

## Behavioral Constraints

<!-- This section is required. State what the skill will NOT do. -->
<!-- Constraints prevent scope creep and protect users from misuse. -->

- [State one thing this skill explicitly refuses to do and why]
- [State a second constraint]
- [Add more as needed — be specific]

---

## Persistent Storage (if applicable)

<!-- Delete this section if your skill has no persistent state. -->

This skill writes to `~/.your-skill/` using the following files:

| File | Contents |
|------|---------|
| `session.md` | Current session state |
| `ledger.md` | Accumulated records across sessions |

**File format:** [Describe the format of each file. Plain text, Markdown, or structured
sections with headers. Avoid JSON or YAML for user-readable ledgers — Markdown is preferred
in the Abraxas ecosystem.]

---

## Integration Notes

<!-- Describe how this skill works alongside other Abraxas skills. -->
<!-- If your skill has no integrations, state that explicitly. -->

This skill integrates with:

- **[Skill name]** — [How and when to use them together]

This skill does NOT require:

- [List skills that are NOT required, if there is a common misconception]

---

## Authoring Notes

<!-- For your reference during development. Delete before publishing. -->

**Abraxas skill conventions:**
- Skill files are zip archives: `cd skills && zip -r skill-name.skill skill-name/`
- Install: `unzip skill-name.skill -d ~/.claude/skills/`
- Front matter: use `name` and `description` only — avoid undocumented fields
- Reference files: place in `skill-name/references/` and link from this SKILL.md
- After packaging: update `docs/skills.md` with a command table entry

**Review checklist:**
- [ ] Every command has a description and example
- [ ] Behavioral constraints section is present
- [ ] Persistent storage section is accurate (or deleted if not applicable)
- [ ] Integration notes are accurate
- [ ] Front matter `description` is a single plain paragraph (no markdown formatting)
- [ ] Skill packaged and installation tested
