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

## Technical Notes

This skill requires external tool access (web search, API calls). If tools are unavailable:
- Return a warning that grounding cannot be performed
- Suggest manual verification methods
- Do not fabricate sources

## Constraints

1. **Tool dependency** — Requires web/API access; degrades gracefully if unavailable
2. **Not authoritative** — Retrieves sources, does not verify accuracy of content
3. **Rate limited** — Respects API limits; caches results where possible

## Quality Checklist

- [ ] Sources are fetched from authoritative locations
- [ ] Results are relevant to the query
- [ ] Limitations are clearly stated when tools unavailable
- [ ] Cache is used appropriately to avoid redundant lookups
