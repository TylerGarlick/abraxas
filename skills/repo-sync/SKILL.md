# Repo Sync Skill

## Purpose
Keeps all Mission Control repositories in sync with the latest skills, content, and configurations. When a skill is updated, a new file is created, or content changes, this skill ensures those changes propagate to the correct GitHub repositories automatically.

## When to Use
Triggered:
1. **Automatically** when any skill is created or updated (via a post-write hook)
2. **Manually** when T says "sync repos" or "push latest to all repos"
3. **On a schedule** via the repo-sync cron job (e.g., every 4 hours or after each briefing)

## Repositories Under Management

| `tylergarlick/mary-jane` | All skills (SKILL.md files), MEMORY.md, workspace config | **Auto** on skill change |
| `tylergarlick/mission-control` | Scripts, skills, bootstrap files, cron-setup | **Auto** on skill/script change |
| `tylergarlick/research` | Daily briefings (YYYY/MM/DD/*.md) | **Auto** after briefing generation |
| `tylergarlick/biz-plans` | Business plans (YYYY/MM/DD/*.md) | **Auto** after biz-ops analysis |
| `tylergarlick/outerspace` | Outerspace-specific content | **Manual** (project-specific) |
| `tylergarlick/curiosity-hour` | Curiosity Hour content | **Manual** (project-specific) |
| `tylergarlick/abraxas` | Abraxas code and tests | **Manual** (via separate software factory) |

**Default: Auto push on every change.** T is only involved when there's a conflict (git push fails due to divergent history).

## Configuration File

**Location:** `/home/ubuntu/.openclaw/workspace/mission-control/repo-sync-config.json`

```json
{
  "repos": {
    "mary-jane": {
      "path": "/home/ubuntu/.openclaw/skills",
      "pushStrategy": "auto",
      "includes": ["skills/**/*", "MEMORY.md", "AGENTS.md", "SOUL.md"]
    },
    "mission-control": {
      "path": "/home/ubuntu/.openclaw/workspace/mission-control",
      "pushStrategy": "auto",
      "includes": ["scripts/**/*", "skills/**/*", "cron-setup/**/*", "bootstrap.sh", "README.md"]
    },
    "research": {
      "path": "/home/ubuntu/.openclaw/skills/briefing/output",
      "pushStrategy": "auto",
      "includes": ["YYYY/MM/DD/*.md"],
      "cron": "0 6,18 * * *"
    },
    "biz-plans": {
      "path": "/home/ubuntu/.openclaw/skills/biz-ops/output",
      "pushStrategy": "auto",
      "includes": ["YYYY/MM/DD/*.md"],
      "cron": "0 6,18 * * *"
    }
  },
  "git": {
    "user": "TylerGarlick",
    "email": "tyler@tylergarlick.com",
    "defaultBranch": "main"
  }
}
```

## How It Works

### The Sync Process

1. **Detect changes** — Compare local files against last known state
2. **Identify affected repos** — Which repos need updates based on what changed
3. **Stage changes** — `git add` only the changed files
4. **Commit with message** — Meaningful commit message: `sync: update <skill/file> YYYY-MM-DD`
5. **Push** — `git push` to the appropriate repo

### Change Detection
Use file modification timestamps and/or git diff:
```bash
# Find recently modified files
find /home/ubuntu/.openclaw/skills -name "*.md" -mtime -1
find /home/ubuntu/.openclaw/workspace/mission-control/scripts -name "*.js" -mtime -1
```

### Per-Repo Sync Logic

#### Skills Sync (→ mary-jane + mission-control)
When any skill is created or updated:
```bash
SKILL_PATH="/home/ubuntu/.openclaw/skills/<skill-name>/SKILL.md"
if [ -f "$SKILL_PATH" ]; then
  # Push to mary-jane skills/
  cp "$SKILL_PATH" ~/projects/mary-jane/skills/<skill-name>/
  git add skills/<skill-name>/
  git commit -m "sync: update <skill-name> skill $(date +%Y-%m-%d)"
  git push
fi
```

#### Briefings Sync (→ research, biz-plans)
After briefing or biz-ops generation:
```bash
# Check for new briefing files
NEW_FILES=$(find /home/ubuntu/.openclaw/skills/briefing/output -name "*.md" -mtime -0.5)
for file in $NEW_FILES; do
  # Copy to correct YYYY/MM/DD in research repo
  cp "$file" ~/projects/research/$(basename $(dirname $file))/$(basename $file)
  git add .
  git commit -m "sync: $(basename $file) $(date +%Y-%m-%d)"
  git push
done
```

## The Sync Script

**Location:** `/home/ubuntu/.openclaw/workspace/mission-control/scripts/sync-repos.js`

```javascript
#!/usr/bin/env node
/**
 * sync-repos.js
 * Syncs local changes to all managed GitHub repositories.
 * 
 * Usage: node sync-repos.js [repo-name]
 *   repo-name: optional - sync only specific repo
 * 
 * Detects changes and pushes to appropriate repos.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(__dirname, '../repo-sync-config.json');
const SKILLS_DIR = '/home/ubuntu/.openclaw/skills';
const MC_DIR = '/home/ubuntu/.openclaw/workspace/mission-control';

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function gitAddCommitPush(repoDir, message) {
  try {
    execSync(`cd ${repoDir} && git add -A && git commit -m "${message}" && git push`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    // If nothing to commit, git exits with 1
    if (err.message.includes('nothing to commit')) return null;
    console.error(`Push failed: ${err.message}`);
    return false;
  }
}

function syncSkills(config) {
  const skillDirs = fs.readdirSync(SKILLS_DIR).filter(f => 
    fs.statSync(path.join(SKILLS_DIR, f)).isDirectory()
  );
  
  // Clone mary-jane if not present
  const maryJaneDir = '/tmp/sync-mary-jane';
  if (!fs.existsSync(maryJaneDir)) {
    execSync(`git clone https://github.com/TylerGarlick/mary-jane.git ${maryJaneDir}`, { stdio: 'pipe' });
  }
  
  for (const skill of skillDirs) {
    const skillFile = path.join(SKILLS_DIR, skill, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    
    const destDir = path.join(maryJaneDir, 'skills', skill);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(skillFile, path.join(destDir, 'SKILL.md'));
  }
  
  const pushed = gitAddCommitPush(maryJaneDir, `sync: update skills ${new Date().toISOString().split('T')[0]}`);
  if (pushed === true) console.log('✅ mary-jane synced');
  else if (pushed === null) console.log('ℹ️  mary-jane: nothing to sync');
}

function syncMissionControl(config) {
  const mcCloneDir = '/tmp/sync-mission-control';
  // Clone or pull
  if (!fs.existsSync(mcCloneDir)) {
    execSync(`git clone https://github.com/TylerGarlick/mission-control.git ${mcCloneDir}`, { stdio: 'pipe' });
  }
  
  // Copy scripts
  const scriptsSrc = path.join(MC_DIR, 'scripts');
  const scriptsDest = path.join(mcCloneDir, 'scripts');
  fs.mkdirSync(scriptsDest, { recursive: true });
  for (const file of fs.readdirSync(scriptsSrc)) {
    if (file.endsWith('.js')) {
      fs.copyFileSync(path.join(scriptsSrc, file), path.join(scriptsDest, file));
    }
  }
  
  // Copy skills
  const skillsSrc = SKILLS_DIR;
  const skillsDest = path.join(mcCloneDir, 'skills');
  fs.mkdirSync(skillsDest, { recursive: true });
  for (const skill of fs.readdirSync(skillsSrc).filter(f => fs.statSync(path.join(skillsSrc, f)).isDirectory())) {
    const skillFile = path.join(skillsSrc, skill, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      const destDir = path.join(skillsDest, skill);
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(skillFile, path.join(destDir, 'SKILL.md'));
    }
  }
  
  const pushed = gitAddCommitPush(mcCloneDir, `sync: update mission-control ${new Date().toISOString().split('T')[0]}`);
  if (pushed === true) console.log('✅ mission-control synced');
  else if (pushed === null) console.log('ℹ️  mission-control: nothing to sync');
}

function syncRepo(repoName, config) {
  if (repoName === 'all') {
    syncSkills(config);
    syncMissionControl(config);
    return;
  }
  
  const repo = config.repos[repoName];
  if (!repo) {
    console.error(`Unknown repo: ${repoName}`);
    return;
  }
  
  if (repoName === 'mary-jane') syncSkills(config);
  else if (repoName === 'mission-control') syncMissionControl(config);
  else console.log(`Repo ${repoName} sync not yet implemented`);
}

const [, , repoName] = process.argv;
const config = loadConfig();
syncRepo(repoName || 'all', config);
```

## Cron Job

**Schedule:** Every 4 hours (catches any missed automatic syncs)
**Payload:** `node sync-repos.js all`

## Integration with Other Skills

### After skill-creator creates a skill:
1. skill-creator saves SKILL.md to `/home/ubuntu/.openclaw/skills/<skill-name>/SKILL.md`
2. skill-creator runs `node sync-repos.js mary-jane` to push to GitHub
3. skill-creator runs `node sync-repos.js mission-control` to update bootstrap repo

### After briefing generates:
1. briefing skill saves output to `YYYY/MM/DD/` directory
2. briefing skill runs `node sync-repos.js research` to push

### After biz-ops generates:
1. biz-ops skill saves output
2. biz-ops skill runs `node sync-repos.js biz-plans` to push

## Definition of Done
- [ ] `repo-sync-config.json` created with all managed repos
- [ ] `scripts/sync-repos.js` created and working
- [ ] At least one repo successfully synced via the script
- [ ] Skill committed to mission-control bootstrap repo
- [ ] Skill documented in MEMORY.md

## Memory Note
This skill was created on 2026-03-24. Update MEMORY.md skills table when created.
