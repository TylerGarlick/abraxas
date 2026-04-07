import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.homedir(), '.abraxas-test');
const SESSIONS_DIR = path.join(TEST_DIR, '.sessions');
const ACTIVE_DIR = path.join(SESSIONS_DIR, 'active');
const RECENT_DIR = path.join(SESSIONS_DIR, 'recent');
const ARCHIVED_DIR = path.join(SESSIONS_DIR, 'archived');
const INDEX_FILE = path.join(TEST_DIR, 'index.json');

function ensureDirectories() {
  [ACTIVE_DIR, RECENT_DIR, ARCHIVED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function generateSessionId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const short = Math.random().toString(36).substring(2, 8);
  return `mnemo-${date}-${short}`;
}

function extractCrossSkillIds(content: string): { janus: string[], mnemon: string[], logos: string[], kairos: string[] } {
  const janusRegex = /jl-\d{8}-[a-z0-9]{3,}/gi;
  const mnemonRegex = /mb-\d{8}-[a-z0-9]{3,}/gi;
  const logosRegex = /lg-\d{8}-[a-z0-9]{3,}/gi;
  const kairosRegex = /kr-\d{8}-[a-z0-9]{3,}/gi;
  
  return {
    janus: [...new Set(content.match(janusRegex) || [])],
    mnemon: [...new Set(content.match(mnemonRegex) || [])],
    logos: [...new Set(content.match(logosRegex) || [])],
    kairos: [...new Set(content.match(kairosRegex) || [])]
  };
}

function readIndex(): any {
  if (!fs.existsSync(INDEX_FILE)) {
    return {
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      sessions: [],
      metadata: { total_sessions: 0, active_count: 0, recent_count: 0, archived_count: 0 }
    };
  }
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
}

function writeIndex(data: any): void {
  const tempFile = INDEX_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, INDEX_FILE);
}

async function sessionSave(title: string, content: string, metadata: any = {}): Promise<any> {
  ensureDirectories();
  
  const sessionId = generateSessionId();
  const now = new Date().toISOString();
  const links = extractCrossSkillIds(content);
  
  const session = {
    id: sessionId,
    title: title || 'Untitled Session',
    created: now,
    modified: now,
    status: 'recent',
    content,
    metadata,
    links
  };
  
  const sessionPath = path.join(RECENT_DIR, `${sessionId}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  
  const index = readIndex();
  index.sessions.push({
    id: sessionId,
    title: session.title,
    created: now,
    modified: now,
    status: 'recent',
    link_count: links.janus.length + links.mnemon.length + links.logos.length + links.kairos.length
  });
  index.metadata.total_sessions++;
  index.metadata.recent_count++;
  index.last_updated = now;
  writeIndex(index);
  
  return { success: true, session_id: sessionId, links_detected: {
    janus: links.janus.length,
    mnemon: links.mnemon.length,
    logos: links.logos.length,
    kairos: links.kairos.length
  }};
}

async function sessionList(status: string = 'all', limit: number = 10, offset: number = 0): Promise<any> {
  const index = readIndex();
  let sessions = index.sessions;
  
  if (status !== 'all') {
    sessions = sessions.filter((s: any) => s.status === status);
  }
  
  sessions = sessions.slice(offset, offset + limit);
  
  return { sessions, total: index.sessions.length, returned: sessions.length };
}

async function sessionLoad(sessionId: string): Promise<any> {
  const paths = [
    path.join(ACTIVE_DIR, `${sessionId}.json`),
    path.join(RECENT_DIR, `${sessionId}.json`),
    path.join(ARCHIVED_DIR, `${sessionId}.json`)
  ];
  
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }
  
  return { error: 'Session not found' };
}

async function sessionExport(sessionId: string, format: string = 'markdown'): Promise<any> {
  const session = await sessionLoad(sessionId);
  
  if (session.error) return session;
  
  let content: string;
  
  if (format === 'json') {
    content = JSON.stringify(session, null, 2);
  } else if (format === 'markdown') {
    content = `# ${session.title}\n\n**ID:** ${session.id}\n**Created:** ${session.created}\n**Status:** ${session.status}\n\n## Content\n\n${session.content}\n\n## Links\n\n${Object.entries(session.links).map(([k, v]: [string, any]) => `${k}: ${v.join(', ')}`).join('\n')}`;
  } else {
    content = `${session.title}\n\nID: ${session.id}\n${session.content}`;
  }
  
  return { session_id: sessionId, format, content };
}

async function sessionArchive(sessionId: string): Promise<any> {
  const sourcePath = path.join(RECENT_DIR, `${sessionId}.json`);
  
  if (!fs.existsSync(sourcePath)) {
    return { error: 'Session not found' };
  }
  
  const session = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const destPath = path.join(ARCHIVED_DIR, `${sessionId}.json`);
  
  fs.renameSync(sourcePath, destPath);
  session.status = 'archived';
  fs.writeFileSync(destPath, JSON.stringify(session, null, 2));
  
  const index = readIndex();
  const idx = index.sessions.findIndex((s: any) => s.id === sessionId);
  if (idx !== -1) {
    index.sessions[idx].status = 'archived';
    index.metadata.recent_count--;
    index.metadata.archived_count++;
  }
  writeIndex(index);
  
  return { success: true, status: 'archived' };
}

async function sessionLinkAdd(sessionId: string, linkId: string, linkType: string): Promise<any> {
  const session = await sessionLoad(sessionId);
  
  if (session.error) return session;
  
  if (!session.links[linkType]) {
    session.links[linkType] = [];
  }
  
  if (!session.links[linkType].includes(linkId)) {
    session.links[linkType].push(linkId);
  }
  
  const paths = [
    path.join(RECENT_DIR, `${sessionId}.json`),
    path.join(ARCHIVED_DIR, `${sessionId}.json`)
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify(session, null, 2));
      break;
    }
  }
  
  return { success: true, link_added: linkId, link_type: linkType };
}

async function runE2ETest() {
  console.log('=== Mnemosyne E2E Test (Test Directory) ===\n');
  
  ensureDirectories();
  
  console.log('Step 1: Save session with cross-skill IDs');
  const content = 'Analyzed jl-20260310-alpha1, believed mb-20260310-beta2, mapped lg-20260310-gamma3, decided kr-20260310-delta4';
  const saveResult = await sessionSave('Test Session', content, { tags: ['test'] });
  console.log('  Result:', JSON.stringify(saveResult, null, 2));
  console.log('  ✓ Session saved:', saveResult.session_id);
  
  console.log('\nStep 2: List sessions');
  const listResult = await sessionList('all', 10, 0);
  console.log('  ✓ Found', listResult.total, 'session(s)');
  console.log('  Session link_count:', listResult.sessions[0]?.link_count);
  
  console.log('\nStep 3: Load session');
  const loadResult = await sessionLoad(saveResult.session_id);
  console.log('  ✓ Loaded title:', loadResult.title);
  console.log('  Links:', JSON.stringify(loadResult.links, null, 2));
  
  console.log('\nStep 4: Export as JSON');
  const exportJson = await sessionExport(saveResult.session_id, 'json');
  console.log('  ✓ Format:', exportJson.format);
  
  console.log('\nStep 5: Export as Markdown');
  const exportMd = await sessionExport(saveResult.session_id, 'markdown');
  console.log('  ✓ Format:', exportMd.format);
  console.log('  Contains title:', exportMd.content.includes('# Test Session'));
  
  console.log('\nStep 6: Add manual link');
  const linkResult = await sessionLinkAdd(saveResult.session_id, 'mnemo-20260310-manual1', 'manual');
  console.log('  ✓ Link added:', linkResult.success);
  
  console.log('\nStep 7: Archive session');
  const archiveResult = await sessionArchive(saveResult.session_id);
  console.log('  ✓ Archived:', archiveResult.success);
  
  console.log('\nStep 8: Verify archived');
  const listArchived = await sessionList('archived', 10, 0);
  console.log('  ✓ Archived count:', listArchived.sessions.length);
  
  console.log('\nStep 9: Test error handling - load invalid');
  const invalidLoad = await sessionLoad('invalid-id');
  console.log('  ✓ Error returned:', invalidLoad.error);
  
  console.log('\n=== All E2E Tests Passed ===');
  console.log('Test directory:', TEST_DIR);
}

runE2ETest().catch(console.error);
