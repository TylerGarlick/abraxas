const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper to execute OpenClaw CLI commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { encoding: 'utf8', timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Parse subagents list output into structured data
function parseSubagents(output) {
  const agents = [];
  const lines = output.split('\n').filter(line => line.trim());
  
  // Skip header line if present
  const dataLines = lines.filter(line => !line.startsWith('ID') && !line.startsWith('---'));
  
  dataLines.forEach(line => {
    // Parse tabular or structured output
    const parts = line.split(/\s+/).filter(p => p);
    if (parts.length >= 3) {
      agents.push({
        id: parts[0] || 'unknown',
        name: parts[1] || 'unnamed',
        status: 'Active',
        task: parts.slice(2).join(' ') || 'No task',
        runtime: 'N/A',
        type: 'subagent'
      });
    }
  });
  
  return agents;
}

// Parse sessions list output into structured data
function parseSessions(output) {
  const sessions = [];
  const lines = output.split('\n').filter(line => line.trim());
  
  // Skip header line if present
  const dataLines = lines.filter(line => !line.startsWith('SESSION') && !line.startsWith('---'));
  
  dataLines.forEach(line => {
    const parts = line.split(/\s+/).filter(p => p);
    if (parts.length >= 2) {
      sessions.push({
        id: parts[0] || 'unknown',
        name: parts[1] || 'main',
        status: 'Active',
        task: parts.slice(2).join(' ') || 'Idle',
        runtime: 'N/A',
        type: 'session'
      });
    }
  });
  
  return sessions;
}

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const [subagentsOutput, sessionsOutput] = await Promise.all([
      runCommand('subagents action=list').catch(() => ''),
      runCommand('sessions_list').catch(() => '')
    ]);
    
    const subagents = parseSubagents(subagentsOutput);
    const sessions = parseSessions(sessionsOutput);
    
    // Combine all agents
    const allAgents = [...subagents, ...sessions];
    
    // Add timestamp
    const status = {
      timestamp: new Date().toISOString(),
      totalAgents: allAgents.length,
      agents: allAgents
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🖥️  Agent Monitor Dashboard running on http://localhost:${PORT}`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/api/status`);
});
