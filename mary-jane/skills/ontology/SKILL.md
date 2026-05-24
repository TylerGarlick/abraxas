---
name: ontology
description: Typed knowledge graph for structured agent memory and composable skills. Use when creating/querying entities (Person, Project, Task, Event, Document), linking related objects, enforcing constraints, planning multi-step actions as graph transformations, or when skills need to share state. Trigger on "remember", "what do I know about", "link X to Y", "show dependencies", entity CRUD, or cross-skill data access.
---

# Ontology

A typed vocabulary + constraint system for representing knowledge as a verifiable graph.

## Core Concept

Everything is an **entity** with a **type**, **properties**, and **relations** to other entities. Every mutation is validated against type constraints before committing.

```
Entity: { id, type, properties, relations, created, updated }
Relation: { from_id, relation_type, to_id, properties }
```

## When to Use

| Trigger | Action |
|---------|--------|
| "Remember that..." | Create/update entity |
| "What do I know about X?" | Query graph |
| "Link X to Y" | Create relation |
| "Show all tasks for project Z" | Graph traversal |
| "What depends on X?" | Dependency query |
| Planning multi-step work | Model as graph transformations |
| Skill needs shared state | Read/write ontology objects |

## Core Types

```yaml
# Agents & People
Person: { name, email?, phone?, notes? }
Organization: { name, type?, members[] }

# Work
Project: { name, status, goals[], owner? }
Task: { title, status, due?, priority?, assignee?, blockers[] }
Goal: { description, target_date?, metrics[] }

# Time & Place
Event: { title, start, end?, location?, attendees[], recurrence? }
Location: { name, address?, coordinates? }

# Information
Document: { title, path?, url?, summary? }
Message: { content, sender, recipients[], thread? }
Thread: { subject, participants[], messages[] }
Note: { content, tags[], refs[] }

# Resources
Account: { service, username, credential_ref? }
Device: { name, type, identifiers[] }
Credential: { service, secret_ref }  # Never store secrets directly

# Meta
Action: { type, target, timestamp, outcome? }
Policy: { scope, rule, enforcement }
```

## Storage

Default: `memory/ontology/graph.jsonl`

```jsonl
{"op":"create","entity":{"id":"p_001","type":"Person","properties":{"name":"Alice"}}}
{"op":"create","entity":{"id":"proj_001","type":"Project","properties":{"name":"Website Redesign","status":"active"}}}
{"op":"relate","from":"proj_001","rel":"has_owner","to":"p_001"}
```

Query via scripts or direct file ops. For complex graphs, migrate to SQLite.

### Append-Only Rule

When working with existing ontology data or schema, **append/merge** changes instead of overwriting files. This preserves history and avoids clobbering prior definitions.

## CLI Commands

```bash
# Create entity
python3 scripts/ontology.py create --type Person --props '{"name":"Alice","email":"alice@example.com"}'

# Get single entity
python3 scripts/ontology.py get --id p_001

# Query by type and filters
python3 scripts/ontology.py query --type Task --where '{"status":"open"}'

# List all entities of a type
python3 scripts/ontology.py list --type Person

# Link two entities
python3 scripts/ontology.py relate --from proj_001 --rel has_task --to task_001

# Find related entities
python3 scripts/ontology.py related --id proj_001 --rel has_task

# Delete entity
python3 scripts/ontology.py delete --id p_001

# Validate all constraints
python3 scripts/ontology.py validate

# Append schema definitions
python3 scripts/ontology.py schema-append --data '<yaml-or-json>'
```

## Constraints

Define in `memory/ontology/schema.yaml`:

```yaml
types:
  Task:
    required: [title, status]
    status_enum: [open, in_progress, blocked, done]
  
  Event:
    required: [title, start]
    validate: "end >= start if end exists"

  Credential:
    required: [service, secret_ref]
    forbidden_properties: [password, secret, token]

relations:
  has_owner:
    from_types: [Project, Task]
    to_types: [Person]
    cardinality: many_to_one
  
  blocks:
    from_types: [Task]
    to_types: [Task]
    acyclic: true
```

## Skill Contract

Skills that use ontology should declare:

```yaml
ontology:
  reads: [Task, Project, Person]
  writes: [Task, Action]
  preconditions:
    - "Task.assignee must exist"
  postconditions:
    - "Created Task has status=open"
```

## Planning as Graph Transformation

Model multi-step plans as a sequence of graph operations:

```
Plan: "Schedule team meeting and create follow-up tasks"

1. CREATE Event { title: "Team Sync", attendees: [p_001, p_002] }
2. RELATE Event -> has_project -> proj_001
3. CREATE Task { title: "Prepare agenda", assignee: p_001 }
4. RELATE Task -> for_event -> event_001
5. CREATE Task { title: "Send summary", assignee: p_001, blockers: [task_001] }
```

## Integration Patterns

### Cross-Skill Communication

```python
# Email skill creates commitment
commitment = ontology.create("Commitment", {
    "source_message": msg_id,
    "description": "Send report by Friday",
    "due": "2026-01-31"
})

# Task skill picks it up
tasks = ontology.query("Commitment", {"status": "pending"})
```

## References

- `references/schema.md` — Full type definitions and constraint patterns
- `references/queries.md` — Query language and traversal examples
