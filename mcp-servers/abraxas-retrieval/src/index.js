import axios from 'axios';
import * as cheerio from 'cheerio';

const DUCKDUCKGO_API = 'https://api.duckduckgo.com';
const TAVILY_API = 'https://api.tavily.com';

export const tools = {
  name: 'abraxas-retrieval',
  version: '1.0.0',
  tools: ['web_search', 'web_fetch', 'fact_check']
};

export async function webSearch(query, limit = 5) {
  try {
    // Try DuckDuckGo JSON API first
    const response = await axios.get(DUCKDUCKGO_API, {
      params: {
        q: query,
        format: 'json',
        no_redirect: 1,
        skip_disambig: 1
      }
    });

    const data = response.data;
    const results = [];

    // Use Abstract if available
    if (data.AbstractText) {
      results.push({
        title: data.AbstractHeading || 'Summary',
        url: data.AbstractURL || '',
        snippet: data.AbstractText
      });
    }

    // Use Answer if available
    if (data.Answer) {
      results.push({
        title: 'Answer',
        url: data.AnswerType === 'calc' ? '' : '',
        snippet: data.Answer
      });
    }

    // Use RelatedTopics if available
    if (data.RelatedTopics?.length > 0) {
      for (const item of data.RelatedTopics.slice(0, limit)) {
        if (item.Text && item.FirstURL) {
          results.push({
            title: item.Text.split(' - ')[0] || 'No title',
            url: item.FirstURL,
            snippet: item.Text
          });
        }
      }
    }

    // Fallback: scrape DuckDuckGo HTML if no API results
    if (results.length === 0) {
      return await scrapeDuckDuckGo(query, limit);
    }

    return {
      query,
      results: results.slice(0, limit),
      source: 'duckduckgo'
    };
  } catch (error) {
    // Fallback to scraping on error
    try {
      return await scrapeDuckDuckGo(query, limit);
    } catch (scrapeError) {
      return {
        query,
        results: [],
        error: error.message,
        source: 'duckduckgo'
      };
    }
  }
}

async function scrapeDuckDuckGo(query, limit = 5) {
  const results = [];
  
  try {
    // Scrape HTML results from DuckDuckGo
    const response = await axios.get('https://html.duckduckgo.com/html/', {
      params: { q: query },
      headers: { 'User-Agent': 'Abraxas-Retrieval/1.0' }
    });

    const $ = cheerio.load(response.data);
    
    // Parse result__a class for links, result__snippet class for snippets
    $('a.result__a').each((i, el) => {
      if (i >= limit) return;
      
      const $el = $(el);
      const url = $el.attr('href');
      const title = $el.text();
      
      // Find sibling snippet
      const $snippet = $el.closest('.result').find('.result__snippet').first();
      const snippet = $snippet.text() || title;
      
      if (url && title) {
        results.push({ title, url, snippet });
      }
    });
  } catch (e) {
    // Return empty results on failure
  }

  return {
    query,
    results,
    source: 'duckduckgo-scrape'
  };
}

export async function webFetch(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Abraxas-Retrieval/1.0',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const title = $('title').first().text() || '';
    const body = $('body').text().substring(0, 5000);

    return {
      url,
      title: title.trim(),
      content: body.trim(),
      status: response.status,
      contentType: response.headers['content-type']
    };
  } catch (error) {
    return {
      url,
      error: error.message,
      status: 0
    };
  }
}

export async function factCheck(claim) {
  const searchResult = await webSearch(claim, 3);
  
  const sources = [];
  for (const result of searchResult.results.slice(0, 2)) {
    // Extract actual URL from DuckDuckGo redirect
    let url = result.url;
    if (url.includes('uddg=')) {
      const match = url.match(/uddg=([^&]+)/);
      if (match) {
        url = decodeURIComponent(match[1]);
      }
    }
    
    if (!url || url.startsWith('//')) {
      url = 'https:' + url;
    }
    
    if (url.startsWith('http')) {
      const fetchResult = await webFetch(url);
      if (fetchResult.content && !fetchResult.error) {
        sources.push({
          url: result.url,
          title: result.title,
          relevance: calculateRelevance(claim, fetchResult.content)
        });
      }
    }
  }

  const avgRelevance = sources.length > 0 
    ? sources.reduce((a, b) => a + b.relevance, 0) / sources.length 
    : 0;

  return {
    claim,
    confidence: avgRelevance,
    verdict: avgRelevance > 0.6 ? 'LIKELY_SUPPORTED' : 'INSUFFICIENT_EVIDENCE',
    sources
  };
}

function calculateRelevance(claim, content) {
  const claimWords = claim.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();
  let matches = 0;
  
  for (const word of claimWords) {
    if (word.length > 3 && contentLower.includes(word)) {
      matches++;
    }
  }
  
  return Math.min(1, matches / Math.max(1, claimWords.length - 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Abraxas Retrieval MCP Server');
  console.log('Available tools: web_search, web_fetch, fact_check');
  
  const testSearch = await webSearch('TypeScript');
  console.log('Test search:', JSON.stringify(testSearch, null, 2));
}
