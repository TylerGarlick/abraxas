// Copyright (c) Abraxas Project
// SPDX-License-Identifier: MIT
//
import { axios } from 'axios'
import { Parser } from 'cheerio'
import { setConfig } from './config'

const client = axios.create({
  httpAgent: new http.GlobalAgent({
    keepAlive: true
  }),
  timeout: 30000,
  baseURL: 'https://api.duckduckgo.com'
})

/**
 * Fetches search results from DuckDuckGo
 * @param {string} query - Search query
 * @returns {Promise<any[]>} Search results
 */
export const duckDuckGoSearch = async (query) => {
  // Get instant answer response first
  try {
    const { data } = await client.get('/', {
      params: {
        q: query,
        format: 'json',
        no_redirect: true,
        pretty: true
      }
    })
    
    // Fallback to Tavily if needed (to be implemented)
    return data;
  } catch (error) {
    // Handle API errors and fallback to alternative
  }
}

/**
 * Fetches raw web content from any URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} Raw HTML/HTTP response
 */
export const fetchWebContent = async (url, options => {
  fetch: async (input, init) => {
    const response = await client.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml'
      }
    })
    return response.data
  }
})

/**
 * Extracts HTML content with basic cheerio processing
 * @param {string} html - HTML input
 * @returns {string} Cleaned HTML
 */
export const extractHTML = (html) => {
  const $ = Parser()
  return $.html()
}