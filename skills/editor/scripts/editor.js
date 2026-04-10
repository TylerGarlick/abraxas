#!/usr/bin/env node
/**
 * Editor - Reviews and improves written content
 * Trigger: "edit", "MJ edit"
 */

const EDIT_MODES = ['review', 'suggest', 'apply'];

function analyzeContent(content) {
  const issues = [];
  const suggestions = [];
  
  // Basic analysis - in production would use NLP
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const words = content.split(/\s+/);
  
  // Check for common issues
  if (words.length > 50 && sentences.some(s => s.split(/\s+/).length > 30)) {
    issues.push({
      type: 'sentence_length',
      severity: 'warning',
      message: 'Some sentences are very long. Consider breaking them up.'
    });
  }
  
  // Check for passive voice indicators (simplified)
  const passivePatterns = /\b(is|are|was|were|been|being)\s+\w+ed\b/gi;
  const passiveMatches = content.match(passivePatterns);
  if (passiveMatches && passiveMatches.length > 2) {
    suggestions.push({
      type: 'passive_voice',
      message: 'Consider using more active voice'
    });
  }
  
  return {
    stats: {
      words: words.length,
      sentences: sentences.length,
      paragraphs: content.split(/\n\n+/).length,
      avgSentenceLength: Math.round(words.length / sentences.length)
    },
    issues,
    suggestions
  };
}

function editContent(content, mode = 'suggest') {
  const analysis = analyzeContent(content);
  const result = {
    mode,
    original: content,
    analysis,
    edits: [],
    edited: content
  };
  
  if (mode === 'review') {
    result.status = 'reviewed';
  } else if (mode === 'suggest') {
    result.status = 'suggestions_ready';
  } else if (mode === 'apply') {
    // Apply would make actual changes
    result.status = 'applied';
  }
  
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Editor - Review and improve content');
    console.log('Usage: node editor.js [mode] < content.txt');
    console.log('Modes:', EDIT_MODES.join(', '));
    return;
  }
  
  const mode = args[0] || 'suggest';
  
  // Read from stdin
  const content = require('fs').readFileSync(0, 'utf-8').trim();
  
  const result = editContent(content, mode);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { editContent, analyzeContent, EDIT_MODES };
