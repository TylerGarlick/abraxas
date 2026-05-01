---
name: research-engine
description: "High-performance research intelligence for web search, content synthesis, and iterative deep-dive investigations."
---

# Research Engine Skill

The Research Engine provides the tools necessary to expand the system's knowledge base through active information gathering and synthesis. It automates the process of discovering, fetching, and distilling information from the open web.

## Core Capabilities

The engine moves beyond simple search by implementing iterative discovery and structured synthesis.

### Web Search and Retrieval
The engine utilizes a multi-stage search process:
1. **Direct Search**: Uses specialized APIs to retrieve the most relevant snippets and URLs.
2. **Targeted Fetching**: Extracts full-page content, removing HTML noise and focusing on the primary textual body.
3. **Link Extraction**: Identifies a network of related resources for further deep-diving.

### Content Synthesis
The synthesize tool transforms disparate pieces of information into structured reports.
- **Mechanism**: Aggregates key points from multiple sources, cross-references them, and formats the output into an Executive, Technical, or Comprehensive report.
- **Verification**: Identifies failures in source retrieval and highlights gaps in the synthesized data.

### Iterative Deep-Dive Research
A multi-pass process that evolves from a broad question to specific, verified claims.
- **Iteration 1**: Broad landscape mapping via initial search.
- **Iteration 2**: Following specialized leads and focus areas identified in Iteration 1.
- **Iteration 3**: Verification phase—cross-referencing key claims across the discovered sources.

## Commands

### `web_search`
Search the web for current information.
- **Arguments**: `query` (required), `max_results` (optional).

### `web_fetch`
Extract content from a specific URL.
- **Arguments**: `url` (required), `extract_links` (optional).

### `synthesize_report`
Synthesize a report from multiple sources.
- **Arguments**: `topic` (required), `sources` (list of `{type, value}`), `report_format` (optional).

### `deep_dive_research`
Execute a multi-iteration research workflow.
- **Arguments**: `research_question` (required), `max_iterations` (optional), `require_verification` (optional), `focus_areas` (optional).

### `health_check`
Diagnostic status of the engine and its API dependencies.
- **Arguments**: `verbose` (optional).

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ ResearchEngineLogic).
- **Dependencies**: Uses `requests` for HTTP communication and `re` for HTML cleaning.
- **Connectivity**: Interfaces with Ollama's search API and Brave Search.
