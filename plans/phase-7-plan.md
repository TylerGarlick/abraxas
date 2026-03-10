# Phase 7 — Session Continuity: Detailed Implementation Plan

## Overview

This document contains the detailed implementation plan for Phase 7 (Session Continuity), which adds cross-session memory persistence to the Abraxas system via the Mnemosyne skill. All 36 subtasks are annotated with Definition of Done (DoD), Status, and Assignee fields.

---

## A: MCP Server Session Tools

### A1: Session Storage MCP Tools

#### Task ID: A1.1 — Add `session_save` tool
**Definition of Done:**
- Tool accepts session_id, content, metadata parameters
- Saves session data to `~/.abraxas/.sessions/active/`
- Returns confirmation with session_id and timestamp

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.1 (index schema defined)

---

#### Task ID: A1.2 — Add `session_load` tool
**Definition of Done:**
- Tool accepts session_id parameter
- Retrieves session from active, recent, or archived storage
- Returns full session object with metadata

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.2 (index read/write implemented)

---

#### Task ID: A1.3 — Add `session_list` tool
**Definition of Done:**
- Tool accepts optional filter parameters (status, date_range)
- Returns list of sessions with id, title, timestamp, status
- Supports pagination for large session counts

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.2 (index read implemented)

---

#### Task ID: A1.4 — Add `session_archive` tool
**Definition of Done:**
- Tool accepts session_id parameter
- Moves session from active/recent to archived storage
- Updates index.json to reflect archived status

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B2.4 (session move operation)

---

#### Task ID: A1.5 — Add `session_export` tool
**Definition of Done:**
- Tool accepts session_id, format (json/markdown/text) parameters
- Exports session in requested format
- Handles cross-session links in output

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B2.5 (session export operation)

---

#### Task ID: A1.6 — Add `index_update` tool
**Definition of Done:**
- Tool accepts operation (add/update/remove), session_id, data
- Performs atomic updates to index.json
- Returns updated index state

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.2 (index read/write)

---

### A2: MCP Server Session Index Management

#### Task ID: A2.1 — Define index.json schema
**Definition of Done:**
- Schema defines required fields: sessions[], version, last_updated
- Each session entry includes: id, title, created, modified, status, links
- Schema includes cross-skill link references structure

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** None (foundation task)

---

#### Task ID: A2.2 — Implement index read/write
**Definition of Done:**
- Read operation loads and parses index.json
- Write operation atomic (write-temp, then rename)
- Handles concurrent access gracefully

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.1

---

#### Task ID: A2.3 — Add index recovery
**Definition of Done:**
- Detects corrupted index.json
- Rebuilds index from existing session files
- Logs recovery actions

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.2

---

## B: Storage Layer Implementation

### B1: Directory Structure Initialization

#### Task ID: B1.1 — Create base directory
**Definition of Done:**
- `~/.abraxas/` directory created
- Permissions set to user-only read/write/execute

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** None

---

#### Task ID: B1.2 — Create subdirectories
**Definition of Done:**
- `~/.abraxas/.sessions/active/` created
- `~/.abraxas/.sessions/recent/` created
- `~/.abraxas/.sessions/archived/` created

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B1.1

---

#### Task ID: B1.3 — Create config.json
**Definition of Done:**
- Config file includes: storage_path, max_session_size, auto_archive_days
- Default values for all settings
- Schema validation on load

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B1.1

---

#### Task ID: B1.4 — Initialize index.json
**Definition of Done:**
- index.json created with empty sessions array
- Version field set to current schema version
- last_updated timestamp set

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B1.2, A2.1

---

### B2: Session File Operations

#### Task ID: B2.1 — Session ID generation
**Definition of Done:**
- Generates unique session IDs (UUID format)
- Checks for ID collisions
- Includes timestamp component

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B1.4

---

#### Task ID: B2.2 — Session write
**Definition of Done:**
- Writes session JSON to `active/` directory
- Atomic write (temp file + rename)
- Includes metadata (id, created, modified, title)

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B2.1

---

#### Task ID: B2.3 — Session read
**Definition of Done:**
- Reads session JSON by ID
- Returns parsed session object
- Handles missing session gracefully

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B2.2

---

#### Task ID: B2.4 — Session move (archive)
**Definition of Done:**
- Moves session file between directories (active→recent→archived)
- Updates index on move
- Creates target directory if needed

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B2.3

---

#### Task ID: B2.5 — Session export
**Definition of Done:**
- Exports session to specified format
- Formats: JSON (full data), Markdown (readable), Text (plain)
- Includes/excludes metadata based on format

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** B2.3

---

## C: Cross-Skill Linking Mechanism

### C1: Auto-Extraction Implementation

#### Task ID: C1.1 — Implement Janus ID regex
**Definition of Done:**
- Regex pattern matches Janus ledger IDs (format: `JL-XXXXXXXX`)
- Extracts ID from session content automatically
- Handles multiple IDs per session

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** A1.1 (session_save can trigger extraction)

---

#### Task ID: C1.2 — Implement Mnemon ID regex
**Definition of Done:**
- Regex pattern matches Mnemon belief IDs (format: `MB-XXXXXXXX`)
- Extracts ID from session content automatically
- Handles multiple IDs per session

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** C1.1

---

#### Task ID: C1.3 — Implement Logos ID regex
**Definition of Done:**
- Regex pattern matches Logos analysis IDs (format: `LA-XXXXXXXX`)
- Extracts ID from session content automatically
- Handles multiple IDs per session

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** C1.1

---

#### Task ID: C1.4 — Implement Kairos ID regex
**Definition of Done:**
- Regex pattern matches Kairos decision IDs (format: `KD-XXXXXXXX`)
- Extracts ID from session content automatically
- Handles multiple IDs per session

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** C1.1

---

#### Task ID: C1.5 — Implement extraction engine
**Definition of Done:**
- Runs all regex patterns against session content
- Aggregates found IDs into link array
- Triggers on session_save

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** C1.1, C1.2, C1.3, C1.4

---

#### Task ID: C1.6 — Handle missing artifacts
**Definition of Done:**
- When linked artifact doesn't exist, log warning
- Mark link as "orphaned" in session metadata
- Allow session save even with missing links

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** C1.5

---

### C2: Manual Linking Implementation

#### Task ID: C2.1 — Add manual link to session
**Definition of Done:**
- Command accepts session_id and target artifact reference
- Adds link to session's links array
- Validates format before adding

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** C1.5

---

#### Task ID: C2.2 — Validate link target
**Definition of Done:**
- Checks if target artifact exists in storage
- Returns validation result (valid/invalid/missing)
- Provides helpful error message for invalid targets

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** C2.1

---

#### Task ID: C2.3 — List session links
**Definition of Done:**
- Returns all links for a session
- Includes link type (Janus/Mnemon/Logos/Kairos/Manual)
- Shows target status (valid/orphaned)

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** C2.2

---

## D: Command Implementations

#### Task ID: D1 — /mnemosyne save
**Definition of Done:**
- Saves current session to storage
- Auto-extracts cross-skill IDs from content
- Returns confirmation with session ID

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** A1.1, C1.5

---

#### Task ID: D2 — /mnemosyne restore
**Definition of Done:**
- Loads session by ID or recent index
- Displays session summary before full restore
- Restores to current conversation context

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** A1.2, C2.3

---

#### Task ID: D3 — /mnemosyne list
**Definition of Done:**
- Lists all sessions with filtering options
- Shows: ID, title, date, status, link count
- Supports pagination

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** A1.3

---

#### Task ID: D4 — /mnemosyne archive
**Definition of Done:**
- Archives session by ID
- Moves from active to archived storage
- Confirmation before archive

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** A1.4

---

#### Task ID: D5 — /mnemosyne export
**Definition of Done:**
- Exports session to specified format
- Options: JSON, Markdown, Text
- Outputs to file or clipboard

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** A1.5

---

#### Task ID: D6 — /mnemosyne link
**Definition of Done:**
- Manually adds cross-skill link to session
- Validates target exists
- Lists current links

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** C2.1, C2.2, C2.3

---

#### Task ID: D7 — /mnemosyne recent
**Definition of Done:**
- Shows N most recent sessions (default: 5)
- Quick-access list without full list view
- One-click restore option

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** skill-author  
**Dependencies:** A1.3

---

## E: Integration & Testing

#### Task ID: E1 — End-to-End Integration Testing
**Definition of Done:**
- Full save→list→restore→export workflow passes
- Cross-skill links detected and persisted
- Archive and recent commands work correctly
- All 7 /mnemosyne commands tested

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** D1, D2, D3, D4, D5, D6, D7

---

#### Task ID: E2 — Error Handling & Edge Cases
**Definition of Done:**
- Handles: missing session, corrupted JSON, full disk, permission errors
- Handles: concurrent access, missing linked artifacts
- User-friendly error messages for all cases
- Recovery mechanisms work

**Status:** [ ] Not Started | [→] In Progress | [!] Blocked | [✓] Complete  
**Assignee:** systems-architect  
**Dependencies:** A2.3, C1.6, E1

---

## Summary

| Category | Tasks | Status |
|----------|-------|--------|
| A1: Session Storage MCP Tools | 6 | 0/6 complete |
| A2: Index Management | 3 | 0/3 complete |
| B1: Directory Structure | 4 | 0/4 complete |
| B2: Session File Operations | 5 | 0/5 complete |
| C1: Auto-Extraction | 6 | 0/6 complete |
| C2: Manual Linking | 3 | 0/3 complete |
| D: Commands | 7 | 0/7 complete |
| E: Integration & Testing | 2 | 0/2 complete |
| **Total** | **36** | **0/36 complete** |

---

## Notes

- **Assignee Roles:** ai-rd-visionary (specification), systems-architect (infrastructure), skill-author (command implementation), brand-ux-architect (completed in Phase 7 overview), docs-architect (Phase 7 overview), constitution-keeper (Phase 7 overview)
- All tasks in this implementation plan build upon the Phase 7 specification completed in the main PLAN.md
- Dependencies assume sequential completion within each category; parallel work possible across categories where dependencies are met
