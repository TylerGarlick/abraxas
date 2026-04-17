# Sovereign Channel Filtering

**Bead:** abraxas-x16

## Overview

Sovereign Channel Filtering restricts write operations on the Abraxas Dream Reservoir to authorized Discord channels only. This prevents unauthorized systems or users from injecting data into the knowledge graph.

## Configuration

### Environment Variable (Primary)

Set in `.env.sovereign`:

```bash
SOVEREIGN_CHANNELS=1492380897167540325
```

Multiple channels can be comma-separated:

```bash
SOVEREIGN_CHANNELS=1492380897167540325,9876543210987654321
```

### Config File (Fallback)

`config/sovereign-channels.json`:

```json
{
  "sovereignChannels": [
    "1492380897167540325"
  ],
  "description": "Whitelist of Discord channel IDs authorized for write operations"
}
```

## Protected Operations

All write mutations now require a `channelId` parameter:

### GraphQL API

```graphql
mutation {
  startDreamCycle(
    prompt: "Explore the nature of consciousness"
    seedConcepts: ["qualia", "awareness"]
    channelId: "1492380897167540325"  # Required
  ) {
    id
    timestamp
  }
}
```

**Protected Mutations:**
- `startDreamCycle`
- `createHypothesis`
- `translateHypothesisToConcept`
- `archiveHypothesis`
- `groundConcept`

### MCP Tools

```typescript
{
  name: "create_hypothesis",
  arguments: {
    sessionId: "31926",
    rawPatternRepresentation: "Pattern detected...",
    noveltyScore: 0.8,
    coherenceScore: 0.7,
    creativeDrivers: ["ANALOGICAL_LEAP"],
    channelId: "1492380897167540325"  // Required
  }
}
```

**Protected Tools:**
- `start_dream_cycle`
- `create_hypothesis`
- `translate_hypothesis_to_concept`
- `ground_concept`

## Validation Behavior

### Success Case

```
✅ Channel 1492380897167540325 is authorized
→ Write operation proceeds
→ channelId stored with document for provenance
```

### Failure Cases

```
❌ Unauthorized: channelId is required for write operations
   (when channelId is missing)

❌ Unauthorized: Channel 1234567890123456789 is not authorized
   (when channelId is not in whitelist)
```

## Testing

Run the test suite:

```bash
cd /root/.openclaw/workspace/abraxas
bun run tests/sovereign-channel-test.ts
```

**Test Coverage:**
1. ✅ Sovereign channel acceptance
2. ✅ Unauthorized channel rejection
3. ✅ Missing channelId rejection
4. ✅ startDreamCycle with valid channel
5. ✅ startDreamCycle with invalid channel
6. ✅ createHypothesis with valid channel
7. ✅ translateHypothesisToConcept with valid channel
8. ✅ groundConcept with valid channel

## Implementation Details

### Validation Function

```typescript
function validateSovereignChannel(channelId: string | undefined): void {
  if (!channelId) {
    throw new Error('Unauthorized: channelId is required for write operations');
  }
  if (!SOVEREIGN_CHANNELS.has(channelId)) {
    throw new Error(`Unauthorized: Channel ${channelId} is not authorized`);
  }
}
```

### Files Modified

| File | Changes |
|------|---------|
| `config/sovereign-channels.json` | New: Channel whitelist |
| `.env.sovereign` | New: Environment config |
| `api/schema.graphql` | Added `channelId` to all mutations |
| `api/service/index.ts` | Added validation middleware |
| `mcp/src/server.ts` | Added validation + new write tools |
| `tests/sovereign-channel-test.ts` | New: Comprehensive test suite |

## Adding New Sovereign Channels

1. Edit `.env.sovereign` or `config/sovereign-channels.json`
2. Add the Discord channel ID
3. Restart the API service and MCP server

Example:
```bash
# .env.sovereign
SOVEREIGN_CHANNELS=1492380897167540325,1111222233334444555
```

## Security Notes

- Channel IDs are stored in plaintext config (not secrets)
- Validation happens at the API/MCP layer before database writes
- Read/query operations are NOT restricted
- Each document stores its originating `channelId` for audit/provenance
