#!/usr/bin/env node
/**
 * Evening Briefing Generator
 * Generates a concise evening briefing with news, weather, and events.
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration from env
const CHANNEL = process.env.BRIEFING_CHANNEL || 'webchat';
const LOCATION = process.env.BRIEFING_LOCATION || 'London';
const TOPICS = (process.env.BRIEFING_TOPICS || 'top news').split(',');
const API_URL = process.env.OPENCLAW_API_URL || 'http://localhost:18789';

// Format date as "Mar 25"
function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get today's date string
function getDateStr() {
  const now = new Date();
  return formatDate(now);
}

// Fetch URL with Promise
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Get top news headlines via web search
async function getNews() {
  try {
    const https = require('https');
    // Use newsdata.io free tier or fallback to RSS
    // For now, use a simple approach with DuckDuckGo news
    const url = 'https://duckduckgo.com/html/?q=+site:news.google.com+OR+site:bbc.co.uk+news&kl=us-en';
    
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          // Simple extraction of headlines from HTML
          const headlines = [];
          const regex = /<a class="result__a"[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/g;
          let match;
          let count = 0;
          while ((match = regex.exec(data)) !== null && count < 3) {
            const text = match[1].replace(/<[^>]*>/g, '').trim();
            if (text && text.length > 20 && text.length < 200) {
              headlines.push(text);
              count++;
            }
          }
          if (headlines.length > 0) {
            resolve(headlines);
          } else {
            resolve(['Top stories from major news sources', 'Check news sites for latest updates', 'Local news may be available']);
          }
        });
      }).on('error', reject);
    });
  } catch (e) {
    console.error('News fetch failed:', e.message);
    return ['Could not fetch news', 'Check your internet connection', 'Try again later'];
  }
}

// Get weather from wttr.in
async function getWeather() {
  try {
    const url = `https://wttr.in/${encodeURIComponent(LOCATION)}?format=j1`;
    const data = await fetch(url);
    const json = JSON.parse(data);
    const current = json.current_condition[0];
    
    const temp = current.temp_C + '°C';
    const feels = current.FeelsLikeC + '°';
    const desc = current.weatherDesc?.[0]?.value || 'Unknown';
    const humid = current.humidity + '% humidity';
    const wind = current.windspeedKmph + ' km/h ' + current.winddir16Point;
    
    // Try nearest area name first, fallback to request query or location
    const areaName = json.nearest_area?.[0]?.areaName?.[0]?.value;
    const regionName = json.nearest_area?.[0]?.region?.[0]?.value;
    const locationName = areaName || regionName || LOCATION;
    
    return { desc, temp, feels, humid, wind, location: locationName };
  } catch (e) {
    console.error('Weather fetch failed:', e.message);
    return { desc: 'Unknown', temp: '--', feels: '--', humid: '--', wind: '--', location: LOCATION };
  }
}

// Get upcoming events (from cal command if available)
function getCalendar() {
  try {
    // Try to get calendar info - this is a placeholder
    // In a real setup, you'd integrate with a calendar API
    const result = execSync('cal -n 3 2>/dev/null || echo ""', { timeout: 5000, encoding: 'utf8' });
    // For now, return empty - calendar integration would need specific setup
    return [];
  } catch (e) {
    return [];
  }
}

// Format briefing message
function formatBriefing(dateStr, news, weather, events) {
  let msg = `🌆 **Evening Briefing — ${dateStr}**\n\n`;
  
  msg += `📰 **Top Stories**\n`;
  news.slice(0, 3).forEach((h, i) => {
    msg += `• ${h}\n`;
  });
  
  msg += `\n🌤️ **Weather (${weather.location})**\n`;
  msg += `${weather.desc}, ${weather.temp} (feels like ${weather.feels})\n`;
  msg += `${weather.wind}, ${weather.humid}\n`;
  
  if (events.length > 0) {
    msg += `\n📅 **Coming Up**\n`;
    events.forEach(e => msg += `• ${e}\n`);
  }
  
  const hour = new Date().getUTCHours();
  msg += `\n⏰ It’s ${hour}:00 UTC — have a good evening!`;
  
  return msg;
}

// Main
async function main() {
  console.error('Generating evening briefing...');
  
  const dateStr = getDateStr();
  const [news, weather] = await Promise.all([getNews(), getWeather()]);
  const events = getCalendar();
  
  const briefing = formatBriefing(dateStr, news, weather, events);
  
  // Output to stdout for capture
  console.log(briefing);
  
  // Also save to state for debugging
  const stateDir = '/home/ubuntu/.openclaw/skills/evening-briefing/state';
  const fs = require('fs');
  fs.writeFileSync(`${stateDir}/last-briefing.txt`, briefing);
  
  return briefing;
}

main().catch(e => {
  console.error('Briefing failed:', e);
  process.exit(1);
});
