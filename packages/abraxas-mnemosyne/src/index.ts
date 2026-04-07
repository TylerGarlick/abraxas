// abraxas-mnemosyne-server.ts v1.0
// MCP-compliant Session Continuity Server for Abraxas
// Phase 7: Session Continuity implementation

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const HOME = os.homedir();
const ABRAXAS_DIR = path.join(HOME, '.abraxas');
const SESSIONS_DIR = path.join(ABRAXAS_DIR, '.sessions');
const ACTIVE_DIR = path.join(SESSIONS_DIR, 'active');
const RECENT_DIR = path.join(SESSIONS_DIR, 'recent');
const ARCHIVED_DIR = path.join(SESSIONS_DIR, 'archived');
const INDEX_FILE = path.join(ABRAXAS_DIR, 'index.json');
const CONFIG_FILE = path.join(ABRAXAS_DIR, 'config.json');

interface Session {
  id: string;
  title: string;
  created: string;
  modified: string;
  status: 'active' | 'closed' | 'recent' | 'archived';
  content: string;
  metadata: {
    total_turns?: number;
    tags?: string[];
  };
  links: {
    janus: string[];
    mnemon: string[];
    logos: string[];
    kairos: string[];
    manual: string[];
  };
}

interface IndexData {
  version: string;
  last_updated: string;
  sessions: SessionSummary[];
  metadata: {
    total_sessions: number;
    active_count: number;
    recent_count: number;
    archived_count: number;
  };
}

interface SessionSummary {
  id: string;
  title: string;
  created: string;
  modified: string;
  status: 'active' | 'closed' | 'recent' | 'archived';
  link_count: number;
}

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

function readIndex(): IndexData {
  if (!fs.existsSync(INDEX_FILE)) {
    return {
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      sessions: [],
      metadata: {
        total_sessions: 0,
        active_count: 0,
        recent_count: 0,
        archived_count: 0
      }
    };
  }
  const data = fs.readFileSync(INDEX_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeIndex(data: IndexData): void {
  const tempFile = INDEX_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, INDEX_FILE);
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

export const tools = {
  session_save: {
    name: 'session_save',
    description: 'Save current session to persistent storage with auto-extraction of cross-skill IDs',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Session title'
        },
        content: {
          type: 'string',
          description: 'Full session transcript/content'
        },
        metadata: {
          type: 'object',
          description: 'Optional metadata (total_turns, tags)'
        }
      },
      required: ['title', 'content']
    }
  },

  session_load: {
    name: 'session_load',
    description: 'Load a session by ID from active, recent, or archived storage',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session ID to load'
        }
      },
      required: ['session_id']
    }
  },

  session_list: {
    name: 'session_list',
    description: 'List all sessions with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status: active, recent, archived, or all',
          enum: ['active', 'recent', 'archived', 'all']
        },
        limit: {
          type: 'number',
          description: 'Maximum number of sessions to return (default: 20)',
          default: 20
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination (default: 0)',
          default: 0
        }
      }
    }
  },

  session_archive: {
    name: 'session_archive',
    description: 'Archive a session by moving it from active to archived storage',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session ID to archive'
        }
      },
      required: ['session_id']
    }
  },

  session_export: {
    name: 'session_export',
    description: 'Export a session in the specified format',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session ID to export'
        },
        format: {
          type: 'string',
          description: 'Export format: json, markdown, or text',
          enum: ['json', 'markdown', 'text'],
          default: 'markdown'
        }
      },
      required: ['session_id']
    }
  },

  index_update: {
    name: 'index_update',
    description: 'Perform atomic operations on the session index',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Operation: add, update, or remove',
          enum: ['add', 'update', 'remove']
        },
        session_id: {
          type: 'string',
          description: 'Session ID for the operation'
        },
        data: {
          type: 'object',
          description: 'Data for add/update operations'
        }
      },
      required: ['operation', 'session_id']
    }
  },

  session_link_add: {
    name: 'session_link_add',
    description: 'Manually add a cross-skill link to a session',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session ID to link from'
        },
        target_id: {
          type: 'string',
          description: 'Target artifact ID (e.g., jl-20260310-abc123)'
        },
        link_type: {
          type: 'string',
          description: 'Type of link: janus, mnemon, logos, kairos, or manual',
          enum: ['janus', 'mnemon', 'logos', 'kairos', 'manual'],
          default: 'manual'
        }
      },
      required: ['session_id', 'target_id']
    }
  },

  session_link_validate: {
    name: 'session_link_validate',
    description: 'Validate that a target artifact exists',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'Session ID (for context)'
        },
        target_id: {
          type: 'string',
          description: 'Target artifact ID to validate'
        }
      },
      required: ['session_id', 'target_id']
    }
  },

  session_links_list: {
    name: 'session_links_list',
    description: 'List all cross-skill links for a session',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session ID'
        }
      },
      required: ['session_id']
    }
  }
};

export async function executeSessionSave(title: string, content: string, metadata: any = {}): Promise<any> {
  ensureDirectories();

  const id = generateSessionId();
  const now = new Date().toISOString();
  const links = extractCrossSkillIds(content);

  const session: Session = {
    id,
    title,
    created: now,
    modified: now,
    status: 'active',
    content,
    metadata,
    links: {
      ...links,
      manual: []
    }
  };

  const filePath = path.join(ACTIVE_DIR, `${id}.json`);
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(session, null, 2));
  fs.renameSync(tempPath, filePath);

  const index = readIndex();
  index.sessions.push({
    id,
    title,
    created: now,
    modified: now,
    status: 'active',
    link_count: links.janus.length + links.mnemon.length + links.logos.length + links.kairos.length
  });
  index.last_updated = now;
  index.metadata.total_sessions++;
  index.metadata.active_count++;
  writeIndex(index);

  return {
    success: true,
    session_id: id,
    created: now,
    links_detected: {
      janus: links.janus.length,
      mnemon: links.mnemon.length,
      logos: links.logos.length,
      kairos: links.kairos.length
    }
  };
}

export async function executeSessionLoad(sessionId: string): Promise<any> {
  const dirs = [ACTIVE_DIR, RECENT_DIR, ARCHIVED_DIR];
  
  for (const dir of dirs) {
    const filePath = path.join(dir, `${sessionId}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  }

  return { error: 'Session not found', session_id: sessionId };
}

export async function executeSessionList(status: string = 'all', limit: number = 20, offset: number = 0): Promise<any> {
  const index = readIndex();
  
  let sessions = index.sessions;
  
  if (status !== 'all') {
    sessions = sessions.filter(s => s.status === status);
  }

  sessions = sessions.slice(offset, offset + limit);

  return {
    sessions,
    total: index.sessions.length,
    returned: sessions.length,
    offset,
    limit
  };
}

export async function executeSessionArchive(sessionId: string): Promise<any> {
  const index = readIndex();
  const sessionIndex = index.sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return { error: 'Session not found', session_id: sessionId };
  }

  const session = index.sessions[sessionIndex];
  
  const activePath = path.join(ACTIVE_DIR, `${sessionId}.json`);
  const archivedPath = path.join(ARCHIVED_DIR, `${sessionId}.json`);

  if (fs.existsSync(activePath)) {
    fs.renameSync(activePath, archivedPath);
  }

  session.status = 'archived';
  session.modified = new Date().toISOString();
  index.sessions[sessionIndex] = session;
  index.metadata.active_count--;
  index.metadata.archived_count++;
  index.last_updated = new Date().toISOString();
  writeIndex(index);

  return {
    success: true,
    session_id: sessionId,
    status: 'archived'
  };
}

export async function executeSessionExport(sessionId: string, format: string = 'markdown'): Promise<any> {
  const session = await executeSessionLoad(sessionId);
  
  if (session.error) {
    return session;
  }

  let output: string;

  switch (format) {
    case 'json':
      output = JSON.stringify(session, null, 2);
      break;
    case 'markdown':
      output = `# ${session.title}\n\n**ID:** ${session.id}\n**Created:** ${session.created}\n**Modified:** ${session.modified}\n**Status:** ${session.status}\n\n## Links\n\n- Janus: ${session.links.janus.join(', ') || 'None'}\n- Mnemon: ${session.links.mnemon.join(', ') || 'None'}\n- Logos: ${session.links.logos.join(', ') || 'None'}\n- Kairos: ${session.links.kairos.join(', ') || 'None'}\n\n## Content\n\n${session.content}`;
      break;
    case 'text':
      output = `${session.title}\n\nID: ${session.id}\nCreated: ${session.created}\nStatus: ${session.status}\n\n${session.content}`;
      break;
    default:
      return { error: 'Invalid format' };
  }

  return {
    session_id: sessionId,
    format,
    content: output
  };
}

export async function executeIndexUpdate(operation: string, sessionId: string, data: any = {}): Promise<any> {
  const index = readIndex();
  const now = new Date().toISOString();

  switch (operation) {
    case 'add':
      index.sessions.push({
        id: sessionId,
        title: data.title || 'Untitled',
        created: now,
        modified: now,
        status: data.status || 'active',
        link_count: 0
      });
      break;
    
    case 'update':
      const idx = index.sessions.findIndex(s => s.id === sessionId);
      if (idx !== -1) {
        index.sessions[idx] = { ...index.sessions[idx], ...data, modified: now };
      }
      break;
    
    case 'remove':
      index.sessions = index.sessions.filter(s => s.id !== sessionId);
      break;
  }

  index.last_updated = now;
  index.metadata.total_sessions = index.sessions.length;
  index.metadata.active_count = index.sessions.filter(s => s.status === 'active').length;
  index.metadata.recent_count = index.sessions.filter(s => s.status === 'recent').length;
  index.metadata.archived_count = index.sessions.filter(s => s.status === 'archived').length;
  writeIndex(index);

  return { success: true, operation, session_id: sessionId };
}

export const toolsRegistry = {
  'session_save': executeSessionSave,
  'session_load': executeSessionLoad,
  'session_list': executeSessionList,
  'session_archive': executeSessionArchive,
  'session_export': executeSessionExport,
  'index_update': executeIndexUpdate,
  'session_link_add': executeSessionLinkAdd,
  'session_link_validate': executeSessionLinkValidate,
  'session_links_list': executeSessionLinksList
};

export const serverConfig = {
  name: 'abraxas-mnemosyne',
  version: '1.0.0',
  description: 'Abraxas Mnemosyne MCP server - Session continuity',
  features: {
    lazyLoading: true,
    skills2: true
  }
};

// C2: Manual Linking Implementation

const ID_FORMAT_REGEX = /^(jl|mb|lg|kr|mnemo)-\d{8}-[a-z0-9]{3,}$/i;

export async function executeSessionLinkAdd(sessionId: string, targetId: string, linkType: string = 'manual'): Promise<any> {
  const dirs = [ACTIVE_DIR, RECENT_DIR, ARCHIVED_DIR];
  let sessionPath: string | null = null;
  
  for (const dir of dirs) {
    const p = path.join(dir, `${sessionId}.json`);
    if (fs.existsSync(p)) {
      sessionPath = p;
      break;
    }
  }

  if (!sessionPath) {
    return { error: 'Session not found', session_id: sessionId };
  }

  const data = fs.readFileSync(sessionPath, 'utf-8');
  const session: Session = JSON.parse(data);

  const validTypes = ['janus', 'mnemon', 'logos', 'kairos', 'manual'];
  if (!validTypes.includes(linkType)) {
    return { error: 'Invalid link type', valid_types: validTypes };
  }

  if (!ID_FORMAT_REGEX.test(targetId)) {
    return { 
      error: 'Invalid ID format',
      expected_format: 'prefix-YYYYMMDD-xxxxxx',
      valid_prefixes: ['jl', 'mb', 'lg', 'kr', 'mnemo']
    };
  }

  if (!session.links[linkType as keyof typeof session.links].includes(targetId)) {
    session.links[linkType as keyof typeof session.links].push(targetId);
    session.modified = new Date().toISOString();
    
    const tempPath = sessionPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(session, null, 2));
    fs.renameSync(tempPath, sessionPath);

    const index = readIndex();
    const idx = index.sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      index.sessions[idx].link_count = 
        session.links.janus.length + session.links.mnemon.length + 
        session.links.logos.length + session.links.kairos.length + session.links.manual.length;
      index.last_updated = new Date().toISOString();
      writeIndex(index);
    }
  }

  return {
    success: true,
    session_id: sessionId,
    link_added: targetId,
    link_type: linkType
  };
}

export async function executeSessionLinkValidate(sessionId: string, targetId: string): Promise<any> {
  const targetPrefix = targetId.split('-')[0].toLowerCase();
  const validPrefixes: Record<string, string> = {
    'jl': path.join(os.homedir(), '.abraxas', '.janus'),
    'mb': path.join(os.homedir(), '.abraxas', '.mnemon'),
    'lg': path.join(os.homedir(), '.abraxas', '.logos'),
    'kr': path.join(os.homedir(), '.abraxas', '.krisis'),
    'mnemo': path.join(os.homedir(), '.abraxas', '.sessions')
  };

  if (!validPrefixes[targetPrefix]) {
    return {
      valid: false,
      target_id: targetId,
      reason: 'Unknown prefix',
      valid_prefixes: Object.keys(validPrefixes)
    };
  }

  const targetDir = validPrefixes[targetPrefix];
  const exists = fs.existsSync(targetDir);

  return {
    valid: exists,
    target_id: targetId,
    prefix: targetPrefix,
    checked_location: targetDir
  };
}

export async function executeSessionLinksList(sessionId: string): Promise<any> {
  const session = await executeSessionLoad(sessionId);
  
  if (session.error) {
    return session;
  }

  const links = {
    janus: session.links.janus.map(id => ({ id, status: 'unknown' })),
    mnemon: session.links.mnemon.map(id => ({ id, status: 'unknown' })),
    logos: session.links.logos.map(id => ({ id, status: 'unknown' })),
    kairos: session.links.kairos.map(id => ({ id, status: 'unknown' })),
    manual: session.links.manual.map(id => ({ id, status: 'unknown' }))
  };

  return {
    session_id: sessionId,
    total_links: Object.values(links).flat().length,
    links
  };
}
