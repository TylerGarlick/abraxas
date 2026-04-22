# Project Bridge MCP Server

Cross-project management MCP server for the Abraxas ecosystem. Provides unified tools for searching across multiple project repositories, retrieving retrospectives, and managing project-to-project relationships.

## Features

- **Cross-Project Search**: Search across your project ecosystem using grep-style queries. The bridge automatically discovers projects within your workspace.
- **Unified Retrospective Retrieval**: Fetch retrospectives from multiple projects in a unified format.
- **Project Mapping**: Create, manage, and query project-to-project relationships and dependencies.
- **Health Check**: Monitor server and project repository health.

## Installation

```bash
cd /root/.openclaw/workspace/abraxas/mcps/project-bridge
bun install
```

## Usage

### Start the Server

```bash
bun run src/index.ts
```

### Development Mode

```bash
bun run dev
```

### Run Tests

```bash
bun run test
```

## Tools

### `cross_project_search`

Search across multiple project repositories for files, code, or content.

**Parameters:**
- `query` (required): Search query (supports grep-style patterns)
- `projects`: Specific projects to search (defaults to all discovered projects)
- `filePattern`: File pattern to filter results (e.g., '*.ts', '*.md')
- `caseSensitive`: Case-sensitive search (default: false)
- `maxResults`: Maximum results per project (default: 20)

**Example:**
```json
{
  "name": "cross_project_search",
  "arguments": {
    "query": "TODO",
    "projects": ["project-alpha", "project-beta"],
    "filePattern": "*.ts",
    "maxResults": 10
  }
}
```

### `unified_retrospective`

Retrieve retrospectives from multiple projects in a unified format.

**Parameters:**
- `project`: Specific project to fetch retros from (defaults to all)
- `startDate`: Start date in YYYY-MM-DD format
- `endDate`: End date in YYYY-MM-DD format
- `tags`: Filter by tags
- `limit`: Maximum number of retros to return (default: 50)

**Example:**
```json
{
  "name": "unified_retrospective",
  "arguments": {
    "startDate": "2026-04-01",
    "endDate": "2026-04-22",
    "limit": 10
  }
}
```

### `project_mapping`

Manage and query project-to-project relationships and dependencies.

**Parameters:**
- `action` (required): One of `list`, `get`, `create`, `update`, `delete`
- `sourceProject`: Source project name
- `targetProject`: Target project name
- `relationshipType`: One of `depends_on`, `extends`, `related_to`, `imports_from`, `exports_to`
- `metadata`: Additional metadata for the relationship

**Example (Create):**
```json
{
  "name": "project_mapping",
  "arguments": {
    "action": "create",
    "sourceProject": "project-alpha",
    "targetProject": "project-beta",
    "relationshipType": "depends_on",
    "metadata": {
      "description": "Project Alpha depends on Project Beta for core services"
    }
  }
}
```

### `health_check`

Check the health status of the project bridge server and connected project repositories.

**Parameters:**
- `detailed`: Include detailed health metrics (default: false)

**Example:**
```json
{
  "name": "health_check",
  "arguments": {
    "detailed": true
  }
}
```

## Project Discovery

The server automatically discovers all project directories within the configured workspace root. It does not require a hardcoded list of projects to function.

## Project Mappings Storage

Project relationships are stored in a local JSON file within the workspace root.

## License

ISC
