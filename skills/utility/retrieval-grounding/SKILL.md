---
name: retrieval-grounding
description: "Live external lookup — provides factual grounding through real-time source verification"
user-invokable: true
argument-hint: "<search|lookup|ground|status> [query]"
---

# Retrieval Grounding Layer

Live external lookup system that provides factual grounding through real-time source verification. This is the first tool-use dependency in the Abraxas stack — other skills can invoke it for fact-checking and source verification.

## Identity

Retrieval Grounding is the factual backbone of the Abraxas system. Unlike Honest (which labels confidence) or Veritas (which tracks resolutions), Retrieval actually performs the lookups. It is the "hands" that go fetch the facts.

This skill is typically invoked by other skills rather than directly by users, though users can also use it for ad-hoc verification.

## When to Use Retrieval Grounding

- Verifying factual claims in real-time
- Looking up documentation, API specs, or technical references
- Grounding claims before labeling with Janus
- Pre-flight verification before using /check

## Commands

### /retrieval search [query]

Search the web for relevant information.

**Usage:** `/retrieval search [query]`

**Example:**
```
/retrieval search Python asyncio best practices 2024
→ Returns top results with snippets and URLs
```

### /retrieval lookup [source]

Fetch and parse a specific source.

**Usage:** `/retrieval lookup [source]`

**Source types:**
- URLs (web pages, API docs)
- File paths (local repositories)
- DOI links (academic papers)

**Example:**
```
/retrieval lookup https://docs.python.org/3/library/asyncio.html
→ Fetches and summarizes key content
```

### /retrieval ground [claim]

Ground a specific claim by finding supporting or contradicting sources.

**Usage:** `/retrieval ground [claim]`

**Example:**
```
/retrieval ground Python GIL prevents true multithreading
→ Returns sources supporting or refuting the claim
```

### /retrieval status

Show current grounding session status.

**Usage:** `/retrieval status`

**Output:**
- Active queries
- Cached results
- API quota (if applicable)

## Integration Points

### With Honest

Retrieval can be invoked before Honest's `/check` to pre-fetch sources.

### With Janus Sol

Claims labeled [INFERRED] or [UNCERTAIN] can be grounded via Retrieval before being upgraded to [KNOWN].

### With Scribe

Retrieval results can be passed to Scribe for citation tracking.

### With Agon

Retrieval provides the factual foundation for adversarial reasoning.

## MCP Server Integration

This skill requires the `abraxas-retrieval` MCP server to function. The MCP server provides three tools:

### Available MCP Tools

| Tool | Function | Implementation |
|------|----------|-----------------|
| `web_search(query)` | Search the web via DuckDuckGo API | Returns results with title, URL, snippet |
| `web_fetch(url)` | Fetch and parse web content | Returns title, content (truncated to 5000 chars), status |
| `fact_check(claim)` | Verify a claim against sources | Returns confidence score, verdict, source URLs |

### Tool Response Schemas

#### web_search Response
```json
{
  "query": "search term",
  "results": [
    { "title": "...", "url": "...", "snippet": "..." }
  ],
  "source": "duckduckgo"
}
```

#### web_fetch Response
```json
{
  "url": "https://...",
  "title": "Page Title",
  "content": "Extracted text content...",
  "status": 200,
  "contentType": "text/html"
}
```

#### fact_check Response
```json
{
  "claim": "The claim to verify",
  "confidence": 0.85,
  "verdict": "LIKELY_SUPPORTED|INSUFFICIENT_EVIDENCE",
  "sources": [
    { "url": "...", "title": "...", "relevance": 0.9 }
  ]
}
```

### Configuration

The MCP server is located at:
- **Path:** `mcp-servers/abraxas-retrieval/`
- **Entry:** `src/index.js`
- **Run:** `npm start` from that directory

## Constraints

1. **Tool dependency** — Requires web/API access; degrades gracefully if unavailable
2. **Not authoritative** — Retrieves sources, does not verify accuracy of content
3. **Rate limited** — Respects API limits; caches results where possible

## Quality Checklist

- [ ] Sources are fetched from authoritative locations
- [ ] Results are relevant to the query
- [ ] Limitations are clearly stated when tools unavailable
- [ ] Cache is used appropriately to avoid redundant lookups
