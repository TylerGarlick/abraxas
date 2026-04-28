# Sovereign Core MCP Server

MCP Server for Sovereign Orchestration providing tools for patch management, configuration, and system state auditing.

## Tools

### `sovereign_patcher`

Apply vetted updates to the sovereign system.

**Parameters:**
- `patchId` (required): Identifier for the patch to apply
- `validateOnly` (optional): If true, only validate without applying
- `force` (optional): Force apply even if validation warnings exist

**Example:**
```json
{
  "name": "sovereign_patcher",
  "arguments": {
    "patchId": "patch-001",
    "validateOnly": true
  }
}
```

### `config_management`

Manage sovereign configuration settings.

**Parameters:**
- `action` (required): One of `get`, `set`, `list`, `validate`, `reset`
- `key` (optional): Configuration key (required for get/set)
- `value` (optional): Configuration value (required for set)
- `section` (optional): Configuration section to filter or target

**Examples:**
```json
// Get a config value
{
  "name": "config_management",
  "arguments": {
    "action": "get",
    "key": "sovereign.version"
  }
}

// List all config
{
  "name": "config_management",
  "arguments": {
    "action": "list"
  }
}
```

### `system_state_audit`

Audit and verify the current system state.

**Parameters:**
- `checkType` (optional): One of `full`, `version`, `config`, `integrity`, `dependencies`
- `verbose` (optional): Include detailed output

**Example:**
```json
{
  "name": "system_state_audit",
  "arguments": {
    "checkType": "full",
    "verbose": true
  }
}
```

### `health_check`

Check the health status of the sovereign core server.

**Parameters:**
- `detailed` (optional): Include detailed health metrics

**Example:**
```json
{
  "name": "health_check",
  "arguments": {
    "detailed": true
  }
}
```

## Development

### Install Dependencies

```bash
bun install
```

### Build

```bash
bun run build
```

### Development Mode

```bash
bun run dev
```

### Run Tests

```bash
bun run test
```

### Start Server

```bash
bun run start
```

## Architecture

The server uses the Model Context Protocol (MCP) SDK to expose tools via stdio transport. Each tool is implemented as an async function that returns structured JSON responses.

## License

ISC
