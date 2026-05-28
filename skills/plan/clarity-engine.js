#!/usr/bin/env node
/**
 * clarity-engine.js
 * 
 * Core engine for converting unknowns to knowns via Socratic questioning.
 * Uses high-leverage questions to maximize unknowns resolved per query.
 * 
 * Usage:
 *   node clarity-engine.js start "Build me a dashboard"
 *   node clarity-engine.js status
 *   node clarity-engine.js answer 1 "Server health monitoring"
 */

const fs = require('fs');
const path = require('path');

// Storage
const CLARITY_DIR = path.join(__dirname, '..', 'storage');
const CLARITY_FILE = path.join(CLARITY_DIR, 'clarity-ledger.jsonl');
const CURRENT_FILE = path.join(CLARITY_DIR, 'current-session.json');

// Ensure storage exists
if (!fs.existsSync(CLARITY_DIR)) {
  fs.mkdirSync(CLARITY_DIR, { recursive: true });
}

// Unknown categories with leverage scores
const UNKNOWN_CATEGORIES = {
  GOAL: { weight: 5, keywords: ['goal', 'objective', 'achieve', 'solve', 'purpose'] },
  AUDIENCE: { weight: 4, keywords: ['audience', 'user', 'customer', 'people', 'team', 'who'] },
  SCOPE: { weight: 4, keywords: ['include', 'exclude', 'scope', 'limit'] },
  FORMAT: { weight: 3, keywords: ['format', 'platform', 'web', 'mobile', 'app', 'api', 'type'] },
  SUCCESS: { weight: 5, keywords: ['done', 'complete', 'success', 'finish', 'working', 'test'] },
  RESOURCES: { weight: 2, keywords: ['resource', 'budget', 'tool', 'stack', 'tech'] },
  TIMELINE: { weight: 3, keywords: ['time', 'deadline', 'when', 'schedule', 'weeks', 'days', 'urgent'] },
  DATA: { weight: 3, keywords: ['data', 'content', 'information', 'input', 'source'] }
};

/**
 * Extract unknowns from a user request
 * Only extracts if the category is NOT already addressed
 */
function extractUnknowns(request, existingUnknowns = []) {
  const unknowns = [];
  const lowerRequest = request.toLowerCase();
  let id = 1;
  
  // Check if we already have answers for each category
  const hasCategory = (cat) => existingUnknowns.some(u => 
    u.category === cat && u.status === 'resolved'
  );
  
  // Goal - only if not already resolved
  if (!hasCategory('GOAL') && !hasAnswer(lowerRequest, UNKNOWN_CATEGORIES.GOAL.keywords)) {
    unknowns.push({
      id: id++,
      category: 'GOAL',
      question: 'What exactly should this do / achieve?',
      leverage: 5,
      status: 'unknown',
      source: 'initial'
    });
  }
  
  // Audience
  if (!hasCategory('AUDIENCE') && !hasAnswer(lowerRequest, UNKNOWN_CATEGORIES.AUDIENCE.keywords)) {
    unknowns.push({
      id: id++,
      category: 'AUDIENCE',
      question: 'Who is the primary user / audience?',
      leverage: 4,
      status: 'unknown',
      source: 'initial'
    });
  }
  
  // Format
  if (!hasCategory('FORMAT') && !hasAnswer(lowerRequest, UNKNOWN_CATEGORIES.FORMAT.keywords)) {
    unknowns.push({
      id: id++,
      category: 'FORMAT',
      question: 'What format / platform / output is expected?',
      leverage: 3,
      status: 'unknown',
      source: 'initial'
    });
  }
  
  // Success criteria
  if (!hasCategory('SUCCESS') && !hasAnswer(lowerRequest, UNKNOWN_CATEGORIES.SUCCESS.keywords)) {
    unknowns.push({
      id: id++,
      category: 'SUCCESS',
      question: 'How will we know when this is complete / successful?',
      leverage: 5,
      status: 'unknown',
      source: 'initial'
    });
  }
  
  // Timeline
  if (!hasCategory('TIMELINE') && !hasAnswer(lowerRequest, UNKNOWN_CATEGORIES.TIMELINE.keywords)) {
    unknowns.push({
      id: id++,
      category: 'TIMELINE',
      question: 'What is the timeline / deadline?',
      leverage: 3,
      status: 'unknown',
      source: 'initial'
    });
  }
  
  // Data
  if (!hasCategory('DATA') && !hasAnswer(lowerRequest, UNKNOWN_CATEGORIES.DATA.keywords)) {
    unknowns.push({
      id: id++,
      category: 'DATA',
      question: 'What data / content is needed?',
      leverage: 3,
      status: 'unknown',
      source: 'initial'
    });
  }
  
  return unknowns;
}

/**
 * Check if request contains an answer to a category
 */
function hasAnswer(request, keywords) {
  return keywords.some(kw => request.includes(kw));
}

/**
 * Rank unknowns by leverage (highest first)
 */
function rankByLeverage(unknowns) {
  return unknowns
    .filter(u => u.status === 'unknown')
    .sort((a, b) => b.leverage - a.leverage);
}

/**
 * Get the next best question (highest leverage unknown)
 */
function getNextQuestion(unknowns) {
  const ranked = rankByLeverage(unknowns);
  return ranked[0] || null;
}

/**
 * Apply epistemic label to an answer
 */
function applyLabel(value, confidence) {
  const truthLabel = value && value.length > 0 ? 'Sol' : 'Nox';
  return {
    value,
    truthLabel,
    confidenceLabel: confidence,
    source: 'User',
    timestamp: new Date().toISOString()
  };
}

/**
 * Save session state
 */
function saveSession(session) {
  fs.writeFileSync(CURRENT_FILE, JSON.stringify(session, null, 2));
  
  const line = JSON.stringify({
    sessionId: session.sessionId,
    request: session.request,
    status: session.status,
    timestamp: new Date().toISOString()
  }) + '\n';
  fs.appendFileSync(CLARITY_FILE, line);
}

/**
 * Load session state
 */
function loadSession(sessionId) {
  if (fs.existsSync(CURRENT_FILE)) {
    const session = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf8'));
    if (!sessionId || session.sessionId === sessionId) {
      return session;
    }
  }
  return null;
}

/**
 * Start a new clarity session
 */
function startSession(request) {
  const sessionId = Date.now().toString(36);
  const unknowns = extractUnknowns(request);
  
  const session = {
    sessionId,
    request,
    startedAt: new Date().toISOString(),
    unknowns,
    knowns: [],
    skipped: [],
    status: 'in_progress',
    iterations: 0
  };
  
  saveSession(session);
  return session;
}

/**
 * Answer a question
 */
function answerQuestion(sessionId, questionId, answer, confidence = 'Confident') {
  const session = loadSession(sessionId);
  if (!session) {
    return { error: 'Session not found. Start a new session first.' };
  }
  
  const question = session.unknowns.find(u => u.id === questionId);
  if (!question) {
    return { error: `Question ${questionId} not found` };
  }
  
  if (question.status !== 'unknown') {
    return { error: `Question ${questionId} is already ${question.status}` };
  }
  
  // Apply epistemic label
  const labeled = applyLabel(answer, confidence);
  
  // Move to knowns
  question.status = 'resolved';
  session.knowns.push({
    ...question,
    answer,
    ...labeled,
    answeredAt: new Date().toISOString()
  });
  
  // Don't extract new unknowns from answers - just answer the original 6 categories
  const newUnknowns = [];
  
  session.iterations++;
  
  // Check if complete
  const remaining = session.unknowns.filter(u => u.status === 'unknown');
  if (remaining.length === 0) {
    session.status = 'complete';
    session.completedAt = new Date().toISOString();
  }
  
  saveSession(session);
  
  return {
    sessionId: session.sessionId,
    answered: question,
    labeled,
    newUnknownsCount: newUnknowns.length,
    remaining: remaining.length,
    nextQuestion: getNextQuestion(session.unknowns),
    isComplete: session.status === 'complete'
  };
}

/**
 * Skip a question
 */
function skipQuestion(sessionId, questionId, reason = '') {
  const session = loadSession(sessionId);
  if (!session) {
    return { error: 'Session not found' };
  }
  
  const question = session.unknowns.find(u => u.id === questionId);
  if (!question) {
    return { error: `Question ${questionId} not found` };
  }
  
  question.status = 'skipped';
  question.skipReason = reason;
  
  session.skipped.push({
    ...question,
    skippedAt: new Date().toISOString()
  });
  
  // Check if complete
  const remaining = session.unknowns.filter(u => u.status === 'unknown');
  if (remaining.length === 0) {
    session.status = 'complete';
    session.completedAt = new Date().toISOString();
  }
  
  saveSession(session);
  
  return {
    sessionId: session.sessionId,
    skipped: question,
    remaining: remaining.length,
    nextQuestion: getNextQuestion(session.unknowns),
    isComplete: session.status === 'complete'
  };
}

/**
 * Get session status
 */
function getStatus(sessionId) {
  const session = loadSession(sessionId);
  if (!session) {
    return { error: 'Session not found. Start a new session first.' };
  }
  
  const remaining = session.unknowns.filter(u => u.status === 'unknown');
  
  return {
    sessionId: session.sessionId,
    request: session.request,
    status: session.status,
    progress: {
      total: session.unknowns.length,
      resolved: session.knowns.length,
      skipped: session.skipped.length,
      remaining: remaining.length
    },
    nextQuestion: getNextQuestion(session.unknowns),
    iterations: session.iterations
  };
}

/**
 * Export final clarity map
 */
function exportClarityMap(sessionId) {
  const session = loadSession(sessionId);
  if (!session) {
    return { error: 'Session not found' };
  }
  
  return {
    request: session.request,
    status: session.status,
    startedAt: session.startedAt,
    completedAt: session.completedAt || null,
    iterations: session.iterations,
    summary: {
      totalQuestions: session.unknowns.length,
      resolved: session.knowns.length,
      skipped: session.skipped.length,
      remaining: session.unknowns.filter(u => u.status === 'unknown').length
    },
    knowns: session.knowns.map(k => ({
      category: k.category,
      question: k.question,
      answer: k.answer,
      epistemicLabel: `${k.truthLabel} / ${k.confidenceLabel}`,
      source: k.source
    })),
    skipped: session.skipped.map(s => ({
      category: s.category,
      question: s.question,
      reason: s.skipReason
    })),
    unknowns: session.unknowns
      .filter(u => u.status === 'unknown')
      .map(u => ({
        id: u.id,
        category: u.category,
        question: u.question,
        leverage: u.leverage
      })),
    readyForImplementation: session.status === 'complete'
  };
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Clarity Engine CLI');
    console.log('='.repeat(60));
    console.log('Commands:');
    console.log('  start "request"     Start new clarity session');
    console.log('  status [sessionId]  Show current status');
    console.log('  answer [qid] [a]    Answer question by ID');
    console.log('  skip [qid] [reason] Skip question');
    console.log('  export [sessionId]  Export final clarity map');
    console.log('');
    console.log('Examples:');
    console.log('  node clarity-engine.js start "Build me a dashboard"');
    console.log('  node clarity-engine.js status mnnkkkvq');
    console.log('  node clarity-engine.js answer mnnkkkvq 1 "Server health monitoring"');
    console.log('  node clarity-engine.js export mnnkkkvq');
    process.exit(0);
  }
  
  switch (command) {
    case 'start': {
      const request = args.slice(1).join(' ');
      if (!request) {
        console.log('❌ Please provide a request: start "Build me a dashboard"');
        process.exit(1);
      }
      const session = startSession(request);
      const next = getNextQuestion(session.unknowns);
      
      console.log('\n🔍 UNKNOWN EXTRACTION');
      console.log('='.repeat(60));
      session.unknowns.forEach(u => {
        console.log(`├─ ${u.category}: ${u.question} [${u.status}] (L:${u.leverage})`);
      });
      
      console.log('\n❓ NEXT QUESTION (Leverage: ' + next?.leverage + ')');
      console.log('='.repeat(60));
      console.log('"' + next?.question + '"');
      console.log('\n📝 Session ID:', session.sessionId);
      console.log('\n💡 Answer with: answer ' + session.sessionId + ' [id] "[your answer]"');
      break;
    }
    
    case 'status': {
      const sessionId = args[1];
      const status = getStatus(sessionId);
      
      if (status.error) {
        console.log('❌', status.error);
        process.exit(1);
      }
      
      console.log('\n📊 CLARITY STATUS');
      console.log('='.repeat(60));
      console.log('Session:', status.sessionId);
      console.log('Request:', status.request);
      console.log('Status:', status.status);
      console.log('Progress:', `${status.progress.resolved}/${status.progress.total} resolved, ${status.progress.skipped} skipped, ${status.progress.remaining} remaining`);
      console.log('Iterations:', status.iterations);
      
      if (status.nextQuestion) {
        console.log('\n❓ NEXT QUESTION (Leverage: ' + status.nextQuestion.leverage + ')');
        console.log(`"${status.nextQuestion.question}"`);
        console.log('💡 Answer with: answer ' + status.sessionId + ' ' + status.nextQuestion.id + ' "[your answer]"');
      } else if (status.status === 'complete') {
        console.log('\n🎉 ALL UNKNOWNS RESOLVED');
      }
      break;
    }
    
    case 'answer': {
      const sessionId = args[1];
      const questionId = parseInt(args[2]);
      const answer = args.slice(3).join(' ');
      const confidence = args.includes('--uncertain') ? 'Uncertain' : 'Confident';
      
      if (!sessionId || !questionId || !answer) {
        console.log('❌ Usage: answer [sessionId] [questionId] "[answer]"');
        process.exit(1);
      }
      
      const result = answerQuestion(sessionId, questionId, answer, confidence);
      
      if (result.error) {
        console.log('❌', result.error);
        process.exit(1);
      }
      
      console.log('\n✅ ANSWERED');
      console.log('='.repeat(60));
      console.log('Question:', result.answered.question);
      console.log('Answer:', answer);
      console.log('Label:', `${result.labeled.truthLabel} / ${result.labeled.confidenceLabel}`);
      console.log('New unknowns from this answer:', result.newUnknownsCount);
      console.log('Remaining unknown questions:', result.remaining);
      
      if (result.isComplete) {
        console.log('\n🎉 ALL UNKNOWNS RESOLVED');
        console.log('\n📋 Export with: export', result.sessionId);
      } else if (result.nextQuestion) {
        console.log('\n❓ NEXT: answer', result.sessionId, result.nextQuestion.id, '"' + result.nextQuestion.question + '"');
      }
      break;
    }
    
    case 'skip': {
      const sessionId = args[1];
      const questionId = parseInt(args[2]);
      const reason = args.slice(3).join(' ') || 'User chose not to answer';
      
      const result = skipQuestion(sessionId, questionId, reason);
      
      if (result.error) {
        console.log('❌', result.error);
        process.exit(1);
      }
      
      console.log('\n⏭️ SKIPPED');
      console.log('='.repeat(60));
      console.log('Question:', result.skipped.question);
      console.log('Reason:', reason);
      console.log('Remaining unknown questions:', result.remaining);
      
      if (result.nextQuestion) {
        console.log('\n❓ NEXT: answer', result.sessionId, result.nextQuestion.id, '"' + result.nextQuestion.question + '"');
      }
      break;
    }
    
    case 'export': {
      const sessionId = args[1];
      const map = exportClarityMap(sessionId);
      
      if (map.error) {
        console.log('❌', map.error);
        process.exit(1);
      }
      
      console.log('\n📋 FINAL CLARITY MAP');
      console.log('='.repeat(60));
      console.log(JSON.stringify(map, null, 2));
      break;
    }
    
    default:
      console.log('Unknown command:', command);
      console.log('Run without arguments to see help.');
      process.exit(1);
  }
}

module.exports = {
  startSession,
  answerQuestion,
  skipQuestion,
  getStatus,
  exportClarityMap,
  extractUnknowns,
  getNextQuestion,
  loadSession
};
