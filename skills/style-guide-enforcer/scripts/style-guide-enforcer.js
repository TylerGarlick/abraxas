#!/usr/bin/env node
/**
 * Style Guide Enforcer - Validates content against style rules
 * Trigger: "check style", "MJ style"
 */

const DEFAULT_RULES = {
  passiveVoice: { allowed: false, severity: 'warning' },
  contractions: { allowed: true, severity: 'info' },
  sentenceLength: { max: 25, severity: 'warning' },
  paragraphLength: { max: 150, severity: 'info' },
  bulletStyle: { style: 'sentence', severity: 'info' },
  oxfordComma: { required: false, severity: 'info' },
  ampm: { use: false, severity: 'info' }
};

function checkStyle(content, rules = DEFAULT_RULES) {
  const violations = [];
  const lines = content.split('\n');
  
  // Check passive voice
  const passivePattern = /\b(is|are|was|were|been|being|be)\s+(\w+ed|written|done|made|seen)\b/gi;
  
  lines.forEach((line, i) => {
    let match;
    const passiveRegex = new RegExp(passivePattern.source, 'gi');
    while ((match = passiveRegex.exec(line)) !== null) {
      if (rules.passiveVoice && !rules.passiveVoice.allowed) {
        violations.push({
          line: i + 1,
          rule: 'passiveVoice',
          message: 'Passive voice detected',
          text: match[0],
          severity: rules.passiveVoice.severity
        });
      }
    }
    
    // Check sentence length
    const sentences = line.split(/[.!?]+\s*/);
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > rules.sentenceLength.max) {
        violations.push({
          line: i + 1,
          rule: 'sentenceLength',
          message: `Sentence too long (${words.length} words, max ${rules.sentenceLength.max})`,
          text: sentence.substring(0, 60) + '...',
          severity: rules.sentenceLength.severity
        });
      }
    });
  });
  
  // Check for bullet style consistency
  const bulletLines = lines.filter(l => l.trim().match(/^[-*•]|^(\d+)\./));
  if (bulletLines.length > 0) {
    const hasPeriods = bulletLines.some(l => l.trim().endsWith('.'));
    const hasNoPeriods = bulletLines.some(l => !l.trim().endsWith('.'));
    if (hasPeriods && hasNoPeriods) {
      violations.push({
        line: 0,
        rule: 'bulletStyle',
        message: 'Bullet style inconsistent (mix of with/without periods)',
        severity: 'warning'
      });
    }
  }
  
  // Summary
  const bySeverity = {
    error: violations.filter(v => v.severity === 'error'),
    warning: violations.filter(v => v.severity === 'warning'),
    info: violations.filter(v => v.severity === 'info')
  };
  
  return {
    totalViolations: violations.length,
    bySeverity,
    violations,
    passed: violations.filter(v => v.severity === 'error').length === 0
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Style Guide Enforcer - Check content against style rules');
    console.log('Usage: node style-guide-enforcer.js < content.txt');
    return;
  }
  
  const content = require('fs').readFileSync(0, 'utf-8').trim();
  const result = checkStyle(content);
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkStyle, DEFAULT_RULES };
