# Abraxas Retrieval MCP Server

Web search and document retrieval backend for the Abraxas system.

## Overview

This MCP server provides three tools for factual grounding:
- `web_search` — Search the web via DuckDuckGo API
- `web_fetch` — Fetch and parse web content
- `fact_check` — Verify claims against sources

## Installation

```bash
cd mcp-servers/abraxas-retrieval
npm install
```

## Usage

### Running the Server

```bash
npm start
```

### Using as a Module

```javascript
import { webSearch, webFetch, factCheck } from './src/index.js';

// Search the web
const results = await webSearch('TypeScript programming');
console.log(results);

// Fetch a specific URL
const page = await webFetch('https://www.typescriptlang.org/');
console.log(page.title, page.content);

// Check a claim
const check = await factCheck('TypeScript is a superset of JavaScript');
console.log(check.verdict, check.confidence);
```

## Tool Schemas

### web_search

**Input:**
```json
{
  "query": "search term",
  "limit": 5
}
```

**Output:**
```json
{
  "query": "search term",
  "results": [
    { "title": "...", "url": "...", "snippet": "..." }
  ],
  "source": "duckduckgo"
}
```

### web_fetch

**Input:**
```json
{
  "url": "https://example.com"
}
```

**Output:**
```json
{
  "url": "https://example.com",
  "title": "Page Title",
  "content": "Extracted text...",
  "status": 200,
  "contentType": "text/html"
}
```

### fact_check

**Input:**
```json
{
  "claim": "claim to verify"
}
```

**Output:**
```json
{
  "claim": "claim to verify",
  "confidence": 0.85,
  "verdict": "LIKELY_SUPPORTED|INSUFFICIENT_EVIDENCE",
  "sources": [
    { "url": "...", "title": "...", "relevance": 0.9 }
  ]
}
```

## Configuration

The server uses:
- **DuckDuckGo API** for web search (free, no API key required)
- **Cheerio** for HTML parsing

## Integration

This server integrates with the `retrieval-grounding` skill in Abraxas. See `skills/retrieval-grounding/SKILL.md` for details.
