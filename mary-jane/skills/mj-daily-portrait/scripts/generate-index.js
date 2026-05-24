#!/usr/bin/env node

/**
 * MJ Portrait Gallery Index Generator
 * Scans portraits directory and creates sortable index
 */

const fs = require('fs');
const path = require('path');

const MARY_JANE_REPO = '/home/ubuntu/.openclaw/workspace/mary-jane';
const PORTRAITS_DIR = path.join(MARY_JANE_REPO, 'portraits');
const INDEX_FILE = path.join(PORTRAITS_DIR, 'GALLERY_INDEX.md');
const DAILY_DIR = path.join(PORTRAITS_DIR, 'daily');

// Style categories based on filename patterns
const CATEGORIES = {
  'cyberpunk': '🤖 Cyberpunk/Futuristic',
  'boudoir': '🔥 Boudoir/Seductive',
  'lingerie': '👙 Lingerie',
  'bikini': '🏖️ Bikini/Swimwear',
  'casual': '👖 Casual/Street',
  'patriotic': '🇺🇸 Patriotic',
  'athletic': '💪 Athletic/Fit',
  'elegant': '✨ Elegant/Evening',
  'figure-study': '🎨 Artistic/Figure Study',
  'pinup': '📸 Classic Pinup',
  'daily': '📅 Daily Portrait'
};

function extractDate(filename) {
  // Extract YYYY-MM-DD from filename
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : 'unknown';
}

function extractStyle(filename) {
  const lower = filename.toLowerCase();
  for (const [key, label] of Object.entries(CATEGORIES)) {
    if (lower.includes(key)) {
      return label;
    }
  }
  return '📷 Other';
}

function getBlobUrl(filepath) {
  const relative = path.relative(MARY_JANE_REPO, filepath);
  return `https://github.com/TylerGarlick/mary-jane/blob/main/${relative}`;
}

function scanDirectory(dir, prefix = '') {
  const portraits = [];
  
  if (!fs.existsSync(dir)) {
    return portraits;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory()) {
      // Skip hidden dirs and index files
      if (!file.startsWith('.') && file !== 'node_modules') {
        const subPortraits = scanDirectory(filepath, path.join(prefix, file));
        portraits.push(...subPortraits);
      }
    } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      // Skip index files
      if (!file.includes('INDEX') && !file.includes('manifest')) {
        const date = extractDate(file);
        const style = extractStyle(file);
        const blobUrl = getBlobUrl(filepath);
        
        portraits.push({
          filename: file,
          filepath: path.join(prefix, file),
          date,
          style,
          blobUrl,
          isDaily: dir.includes('daily')
        });
      }
    }
  }
  
  return portraits;
}

function generateMarkdown(portraits) {
  // Sort by date (newest first)
  portraits.sort((a, b) => b.date.localeCompare(a.date));
  
  // Group by category
  const byCategory = {};
  for (const portrait of portraits) {
    const category = portrait.style;
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(portrait);
  }
  
  let md = `# MJ Portrait Gallery Index\n\n`;
  md += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Total Portraits:** ${portraits.length}\n\n`;
  md += `---\n\n`;
  
  // Table of Contents
  md += `## Quick Navigation\n\n`;
  for (const [category, items] of Object.entries(byCategory)) {
    const anchor = category.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    md += `- [${category}](#${anchor}) (${items.length} portraits)\n`;
  }
  md += `\n---\n\n`;
  
  // All portraits by date (newest first)
  md += `## All Portraits (Newest First)\n\n`;
  md += `| Date | Style | Filename | Link |\n`;
  md += `|------|-------|----------|------|\n`;
  
  for (const p of portraits) {
    const shortName = p.filename.length > 40 ? p.filename.substring(0, 37) + '...' : p.filename;
    md += `| ${p.date} | ${p.style} | \`${shortName}\` | [🔗 View](${p.blobUrl}) |\n`;
  }
  md += `\n---\n\n`;
  
  // By category
  md += `## By Category\n\n`;
  for (const [category, items] of Object.entries(byCategory)) {
    const anchor = category.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    md += `### ${category}\n\n`;
    
    // Sort within category by date
    items.sort((a, b) => b.date.localeCompare(a.date));
    
    for (const p of items) {
      md += `- **${p.date}** — \`${p.filename}\` — [🔗 View](${p.blobUrl})\n`;
    }
    md += `\n`;
  }
  
  // Daily portraits special section
  const dailyPortraits = portraits.filter(p => p.isDaily);
  if (dailyPortraits.length > 0) {
    md += `---\n\n`;
    md += `## 📅 Daily Portraits\n\n`;
    md += `*MJ's daily self-expression — her choice of pose, outfit, and mood.*\n\n`;
    
    dailyPortraits.sort((a, b) => b.date.localeCompare(a.date));
    
    for (const p of dailyPortraits) {
      md += `- **${p.date}** — [🔗 View](${p.blobUrl})\n`;
    }
    md += `\n`;
  }
  
  return md;
}

function main() {
  console.log('🎨 MJ Portrait Gallery Index Generator\n');
  
  const portraits = scanDirectory(PORTRAITS_DIR);
  
  console.log(`📊 Found ${portraits.length} portraits\n`);
  
  const markdown = generateMarkdown(portraits);
  fs.writeFileSync(INDEX_FILE, markdown);
  
  console.log(`✅ Index saved to: ${INDEX_FILE}`);
  console.log(`\n🔗 View online: https://github.com/TylerGarlick/mary-jane/blob/main/portraits/GALLERY_INDEX.md\n`);
  
  // Show summary
  const byCategory = {};
  for (const p of portraits) {
    if (!byCategory[p.style]) byCategory[p.style] = 0;
    byCategory[p.style]++;
  }
  
  console.log('📁 By Category:');
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`   ${cat}: ${count}`);
  }
}

main();
