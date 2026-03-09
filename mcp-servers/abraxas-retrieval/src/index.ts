// abraxas-retrieval-server.ts
// MCP-compliant Retrieval Server for Abraxas
// Uses OpenCode SDK with DuckDuckGo + Tavily backends

import { WebSearchTool, WebFetchTool, FactCheckTool } from '@opencode/mcp-sdk'
import { duckDuckGoSearch, tavilyFetch, duckDuckGoExtract } from './tools/search'
import { directFetch, extractHTML } from './tools/fetch'

/**
 * Retrieval server configuration
 */
export const serverConfig = {
  name: 'abraxas-retrieval',
  description: 'Web search and document retrieval backend',
  version: '1.0.0',
  defaultLanguage: 'en-US',
  tools: {
    "web_search": duckDuckGoSearch,
    "web_fetch": directFetch,
    "fact_check": async ({ claim, threshold = 0.75 }) => {
      // Get search results from multiple sources
      const results = await duckDuckGoSearch(claim, 3)
      const snippets = results.map(r => extractHTML(r.url))
      
      // Use Tavily for detailed verification
      const factDetails = await tavilyFetch(claim)
      
      return {
        claim, 
        sources: [...results.map(r => r.url), factDetails.url],
        confidenceScore: Math.max(0.6, factDetails.relevance * 0.8),
        evidence: snippets.filter(html => html.length > 500)
      }
    }
  },
  cache: {
    enabled: true,
    defaultTTL: 10000000000 // 120 hours
  },
  apiVersion: 'mcp/v1'
}

const toolsRegistry = {
  'web_search': true,
  'web_fetch': true,
  'fact_check': true
}

export { serverConfig, toolsRegistry }