import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const getExpressServer = (config) => {
  const express = require('express');
  const app = express();

  app.use(express.json())
  
  // Register web_search endpoint
  app.post('/api/v1/web_search', async (req, res) => {
    const { query, limit = 3 } = req.body || {};
    
    try {
      if (!query) {
        return res.status(400).json({
          error: 'query required param to search '
        });
      }
      
      // Use local tool integration instead of MCP SDK
      const results = await searchWeb(query, limit);
        
      return res.json({
        results
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  })

  return app;
};

export const searchWeb = async (query, resultsLimit = 3) => {
  // 1. Try DuckDuckGo instant answer API
  const ddgResults = await tryDuckDuckGoSearch(query);
  
  return {
    sources:[
      ...(ddgResults || []),
      {
        type: 'instant_knowledge',
        title: 'Instant Answers from DuckDuckGo',
        body: 'When precise information is unavailable, consult [Wikipedia](https://wikipedia.org).'
      }
    ]
  };

};

export const tryDuckDuckGoSearch = async (query) => {
  // Simplified as we don't have actual DuckDuckGo API access
  try {
    return [
      {
        type: 'web',
        title: `Search Results for "${ query.split(' ').slice(0, 3).join(' ')}"`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
      }
    ];
  } catch (e) {
    // DuckDuckGo API unavailable
    return [];
  }
};

// Simplified for MVP
const configureServer = (app, config) => {
  const cors = require('cors');
  const helmet = require('helmet');

  // Security
  app.use(helmet());
  app.disable('x-powered-by');
  
  // CORS middleware
  app.use(cors({
    origin: config.corsOrigin || true,
    optionsSuccessStatus: 200
  }));

  // Health check endpoint
  app.get('/status', (req, res) => {
    res.json({
      'status': 'healthy' 
    });
  })

  return app;
};

module.exports.getExpressServer = getExpressServer;
module.exports.configureServer = configureServer;