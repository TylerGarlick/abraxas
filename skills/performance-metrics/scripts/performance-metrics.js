#!/usr/bin/env node
/**
 * Performance Metrics - Tracks and reports performance data
 * Trigger: "metrics", "MJ metrics"
 */

const fs = require('fs');
const path = require('path');

const METRICS_DIR = path.join(process.env.HOME || '/tmp', '.content-metrics');
const METRIC_TYPES = ['views', 'engagement', 'conversion', 'social', 'seo'];

function ensureDir() {
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }
}

function recordMetric(type, value, metadata = {}) {
  ensureDir();
  
  const metricFile = path.join(METRICS_DIR, `${type}.json`);
  let metrics = [];
  
  if (fs.existsSync(metricFile)) {
    metrics = JSON.parse(fs.readFileSync(metricFile, 'utf-8'));
  }
  
  const entry = {
    id: `m_${Date.now()}`,
    type,
    value,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  metrics.push(entry);
  
  fs.writeFileSync(metricFile, JSON.stringify(metrics, null, 2));
  
  return { recorded: true, metric: entry };
}

function getMetrics(type, options = {}) {
  ensureDir();
  
  const metricFile = path.join(METRICS_DIR, `${type}.json`);
  
  if (!fs.existsSync(metricFile)) {
    return { type, metrics: [], total: 0 };
  }
  
  let metrics = JSON.parse(fs.readFileSync(metricFile, 'utf-8'));
  
  // Filter by date range if specified
  if (options.from || options.to) {
    metrics = metrics.filter(m => {
      const ts = new Date(m.timestamp);
      if (options.from && ts < new Date(options.from)) return false;
      if (options.to && ts > new Date(options.to)) return false;
      return true;
    });
  }
  
  // Calculate aggregates
  const values = metrics.map(m => m.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = values.length > 0 ? sum / values.length : 0;
  
  return {
    type,
    period: { from: options.from, to: options.to },
    total: metrics.length,
    sum,
    average: Math.round(avg * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values),
    metrics: metrics.slice(-100) // Last 100 entries
  };
}

function getSummary(options = {}) {
  const summary = {};
  
  for (const type of METRIC_TYPES) {
    try {
      summary[type] = getMetrics(type, options);
    } catch (e) {
      summary[type] = { error: e.message };
    }
  }
  
  return summary;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Performance Metrics - Track content performance');
    console.log('Usage: node performance-metrics.js [command] [args]');
    console.log('Commands: record, get, summary');
    return;
  }
  
  const command = args[0] || 'summary';
  
  if (command === 'record') {
    const type = args[1] || 'views';
    const value = parseFloat(args[2]) || 1;
    const result = recordMetric(type, value);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'get') {
    const type = args[1] || 'views';
    const result = getMetrics(type);
    console.log(JSON.stringify(result, null, 2));
  } else {
    const result = getSummary();
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { recordMetric, getMetrics, getSummary, METRICS_DIR, METRIC_TYPES };
