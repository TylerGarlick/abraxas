#!/usr/bin/env node
/**
 * Knowledge Base - Manages searchable knowledge
 * Trigger: "knowledge base", "MJ KB"
 */

const fs = require('fs');
const path = require('path');

const KB_DIR = path.join(process.env.HOME || '/tmp', '.knowledge-base');
const ENTRY_TYPES = ['brand', 'process', 'reference', 'template', 'note'];

function ensureDir() {
  if (!fs.existsSync(KB_DIR)) {
    fs.mkdirSync(KB_DIR, { recursive: true });
  }
}

function createEntry(title, content, type = 'note', tags = []) {
  ensureDir();
  
  const id = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const filename = `${id}.md`;
  const filepath = path.join(KB_DIR, filename);
  
  const entry = {
    id,
    title,
    type,
    tags,
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  
  const markdown = `# ${title}\n\n${content}\n\n---\n*KB ID: ${id}*\n*Type: ${type}*\n*Tags: ${tags.join(', ')}*\n`;
  
  fs.writeFileSync(filepath, markdown);
  
  return entry;
}

function searchEntries(query) {
  ensureDir();
  
  const files = fs.readdirSync(KB_DIR).filter(f => f.endsWith('.md'));
  const results = [];
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(KB_DIR, file), 'utf-8');
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerContent.includes(lowerQuery)) {
      const lines = content.split('\n');
      const title = lines[0].replace(/^#\s*/, '');
      const idMatch = content.match(/\*KB ID: ([^\*]+)\*/);
      const typeMatch = content.match(/\*Type: ([^\*]+)\*/);
      const tagsMatch = content.match(/\*Tags: ([^\*]+)\*/);
      
      results.push({
        id: idMatch ? idMatch[1] : file,
        title,
        type: typeMatch ? typeMatch[1] : 'unknown',
        tags: tagsMatch ? tagsMatch[1].split(', ') : [],
        relevance: lowerContent.split(lowerQuery).length - 1
      });
    }
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  return results;
}

function listEntries(type = null) {
  ensureDir();
  
  const files = fs.readdirSync(KB_DIR).filter(f => f.endsWith('.md'));
  const entries = [];
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(KB_DIR, file), 'utf-8');
    const lines = content.split('\n');
    const title = lines[0].replace(/^#\s*/, '');
    const idMatch = content.match(/\*KB ID: ([^\*]+)\*/);
    const typeMatch = content.match(/\*Type: ([^\*]+)\*/);
    const tagsMatch = content.match(/\*Tags: ([^\*]+)\*/);
    
    const entry = {
      id: idMatch ? idMatch[1] : file,
      title,
      type: typeMatch ? typeMatch[1] : 'unknown',
      tags: tagsMatch ? tagsMatch[1].split(', ') : []
    };
    
    if (!type || entry.type === type) {
      entries.push(entry);
    }
  }
  
  return entries;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Knowledge Base - Manage searchable knowledge');
    console.log('Usage: node knowledge-base.js [command] [args]');
    console.log('Commands: create, search, list');
    return;
  }
  
  const command = args[0] || 'list';
  
  if (command === 'create') {
    const title = args.slice(1, -1).join(' ') || 'Untitled';
    const content = require('fs').readFileSync(0, 'utf-8').trim();
    const result = createEntry(title, content);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'search') {
    const query = args.slice(1).join(' ');
    const result = searchEntries(query);
    console.log(JSON.stringify(result, null, 2));
  } else {
    const result = listEntries();
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createEntry, searchEntries, listEntries, KB_DIR, ENTRY_TYPES };
