// Copyright (c) Abraxas Project
// SPDX-License-Identifier: MIT
/* istanbul ignore file */
// MCP Server Specification for Abraxas Retrieval
// Uses multiple backends: DuckDuckGo, Tavily

const DEFAULT_TOOLS = [
  'web_search',
  'web_fetch',
  'fact_check'
];

/**
 * Tool Validation
 * @param {string} toolName - Name of the MCP tool
 */
exports.isToolValid = (toolName) => {
  return DEFAULT_TOOLS.includes(toolName);
}

/**
 * Caching Configuration
 * @returns {object} Caching configuration
 */
exports.getCacheConfig = () => {
  return {
    enabled: process.env.ENV === 'development' ? true : process.env.CACHE_ENABLED === 'true',
    ttl: process.env.CACHE_TTL || '36000000', // 10 hours default
    prefix: process.env.CACHE_PREFIX || 'abraxas_cache_'
  };
}