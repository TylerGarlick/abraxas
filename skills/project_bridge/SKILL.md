---
name: project-bridge
description: "Unified cross-project management tool for search, retrospectives, and relationship mapping across the sovereign workspace."
---

# Project Bridge Skill

Project Bridge provides the connective tissue between disparate projects in the Abraxas workspace. It allows for unified discovery and structural analysis of the a multi-project environment.

## Core Capabilities

The bridge eliminates the need to manually navigate individual project directories for common administrative and research tasks.

### Cross-Project Search
A unified search interface that crawls multiple project repositories.
- **Mechanism**: Uses high-performance recursive grep searches across specified or discovered project paths.
- **Output**: Returns matching files with their project context and line-number references.

### Unified Retrospective Retrieval
Fetches project retrospectives from varied storage patterns across the workspace.
- **Mechanism**: Scans common retrospective directories (`/retrospectives`, `.retrospectives`, etc.) and extracts data based on date-based directory structures or file metadata.
- **Filtering**: Supports filtering by date range, specific project, or tags.

### Project Mapping
Tracks the structural relationships and dependencies between different projects.
- **Mechanism**: Maintains a centralized `.project-mappings.json` ledger.
- **Relationships**: Tracks `depends_on`, `extends`, `related_to`, `imports_from`, and `exports_to` linkages.

## Commands

### `cross_project_search`
Searches files across project repositories.
- **Arguments**: `query` (required), `projects` (optional), `file_pattern` (optional), `case_sensitive` (optional), `max_results` (optional).

### `unified_retrospective`
Aggregates retrospectives into a single view.
- **Arguments**: `project` (optional), `start_date` (optional), `end_date` (optional), `tags` (optional), `limit` (optional).

### `project_mapping`
Manages the project relationship graph.
- **Arguments**: `action` (required: `list`, `get`, `create`, `update`, `delete`), `source_project`, `target_project`, `relationship_type`, `metadata`.

### `health_check`
Verifies workspace accessibility and project availability.
- **Arguments**: `detailed` (optional).

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ ProjectBridgeLogic).
- **Workspace Insight**: Dynamically discovers project folders and integrates with the Sovereign root path.
- **Storage**: Uses a JSON-based ledger for project relationships.
