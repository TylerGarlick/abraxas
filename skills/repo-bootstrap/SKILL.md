---
name: repo-bootstrap
description: |
  Analyzes any repository and adds a bootstrap system (bootstrap.sh, setup scripts, README instructions) to make it clone-and-setup ready. Use when T says "bootstrap this repo", "make it clone-and-setup", "add setup to this repo", or "repo-ify this project". Handles Node.js, Python, Go, and shell projects. Also used automatically by Mission Control when setting up new project repos.
---

# SKILL.md — Repo Bootstrap

## Purpose

Take any existing repository and add a complete bootstrap system that allows anyone to:
1. Clone the repo
2. Run `./bootstrap.sh`
3. Have a fully functional development environment

This skill "repo-ifies" projects—making them self-contained, reproducible, and beginner-friendly.

## When to Use

**Explicit triggers:**
- "MJ, bootstrap this repo"
- "make this repo clone-and-setup"
- "add bootstrap to this repo"
- "repo-ify this project"
- "add setup instructions"

**Automatic triggers:**
- Mission Control setting up a new project repo
- After creating a new repository with initial code
- When a project lacks setup documentation

## Prerequisites

1. Target repository exists on GitHub
2. Repository has some code/content (this skill adds infrastructure, not the project itself)
3. GitHub token available (from MEMORY.md or secrets-manager)

## What This Skill Produces

### 1. `bootstrap.sh` (required)
Executable shell script that:
- Auto-detects project type (Node.js, Python, Go, shell)
- Installs all dependencies
- Creates necessary directories and config files
- Validates setup succeeded
- Prints clear next steps

### 2. `README.md` (updated or created)
Contains:
```markdown
## Quick Start

```bash
git clone <repo-url>
cd <repo-name>
./bootstrap.sh
```

## Development

[appropriate commands for the project type]
```

### 3. `setup/` directory (optional, for complex projects)
Contains:
- `setup-node.sh` — Node.js-specific setup
- `setup-python.sh` — Python-specific setup
- `setup-go.sh` — Go-specific setup
- Template config files to be copied during bootstrap

### 4. `.bootstrap/` metadata (optional)
`bootstrap-meta.json` tracking:
- Project type detected
- Dependencies installed
- Last bootstrap date
- Expected environment (Node version, Python version, etc.)

## Implementation Steps

### Step 1 — Clone the Target Repo

```bash
TASK_ID=$(date +%s)
git clone https://github.com/<owner>/<repo>.git /tmp/repo-bootstrap-${TASK_ID}
cd /tmp/repo-bootstrap-${TASK_ID}
```

### Step 2 — Analyze the Repo

Detect project type by checking for these files in order:

| Priority | File | Project Type |
|----------|------|--------------|
| 1 | `package.json` | Node.js |
| 2 | `requirements.txt`, `setup.py`, `pyproject.toml` | Python |
| 3 | `go.mod` | Go |
| 4 | `Makefile` | Shell/Make |
| 5 | `*.sh` files in root | Shell script project |
| 6 | `Dockerfile` | Container project |

Also check for:
- `.env.example` or `.env.template` (environment variables needed)
- `docker-compose.yml` (may need Docker setup)
- `.node-version`, `.python-version`, `go.mod` (version requirements)

### Step 3 — Create `bootstrap.sh`

Write the script using templates below. Key requirements:
- Start with `#!/usr/bin/env bash`
- Use `set -e` for fail-fast
- Check prerequisites before installing
- Print status messages with emojis
- Handle errors gracefully
- Make it idempotent (safe to run twice)

### Step 4 — Create `setup/` Directory (if needed)

For simple projects, put everything in `bootstrap.sh`. For complex projects, create:
```
setup/
├── setup-node.sh      # npm install, node version check
├── setup-python.sh    # venv creation, pip install
├── setup-go.sh        # go mod download
└── templates/         # config templates to copy
    └── .env.example
```

### Step 5 — Update README.md

If README exists:
- Add "Quick Start" section at top if missing
- Add `./bootstrap.sh` to existing setup instructions
- Verify accuracy of existing instructions

If no README:
- Create minimal README with:
  - Project name and one-line description
  - Quick Start section
  - Development commands
  - License (if applicable)

### Step 6 — Commit and Push

```bash
git checkout -b chore/bootstrap-setup
git add bootstrap.sh README.md setup/ 2>/dev/null || true
git commit -m "Add clone-and-setup bootstrap system

- Auto-detects project type (Node.js, Python, Go, shell)
- bootstrap.sh handles dependency installation
- Updated README with quick start instructions"
git push -u origin chore/bootstrap-setup
```

Then create a PR:
```bash
gh pr create --title "Add bootstrap setup system" --body "Adds clone-and-setup capability" --base main
```

## Bootstrap Script Templates

### Universal Template (All Project Types)

```bash
#!/usr/bin/env bash
#
# bootstrap.sh — $(basename "$PWD") setup script
# Run after: git clone <repo>
#

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${CYAN}[BOOTSTRAP]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

log "Starting $(basename "$PWD") bootstrap..."

# Detect project type
detect_project() {
    if [ -f "package.json" ]; then
        echo "node"
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        echo "python"
    elif [ -f "go.mod" ]; then
        echo "go"
    elif [ -f "Makefile" ]; then
        echo "make"
    elif ls *.sh 2>/dev/null | head -1 | grep -q .; then
        echo "shell"
    else
        echo "unknown"
    fi
}

PROJECT_TYPE=$(detect_project)
log "Detected project type: $PROJECT_TYPE"

# Install dependencies based on project type
case "$PROJECT_TYPE" in
    node)
        log "Installing Node.js dependencies..."
        if command -v npm &> /dev/null; then
            npm install
            success "Node.js dependencies installed"
        else
            error "npm not found. Install Node.js first: https://nodejs.org"
        fi
        ;;
    python)
        log "Setting up Python environment..."
        if command -v python3 &> /dev/null; then
            # Create virtual environment if it doesn't exist
            if [ ! -d "venv" ]; then
                python3 -m venv venv
                success "Virtual environment created"
            fi
            
            # Activate and install
            source venv/bin/activate
            pip install --upgrade pip
            if [ -f "requirements.txt" ]; then
                pip install -r requirements.txt
            elif [ -f "setup.py" ]; then
                pip install -e .
            elif [ -f "pyproject.toml" ]; then
                pip install -e .
            fi
            success "Python dependencies installed"
        else
            error "python3 not found. Install Python 3 first."
        fi
        ;;
    go)
        log "Installing Go dependencies..."
        if command -v go &> /dev/null; then
            go mod download
            go mod tidy
            success "Go dependencies installed"
        else
            error "go not found. Install Go first: https://go.dev"
        fi
        ;;
    make)
        log "Running Make setup..."
        if command -v make &> /dev/null; then
            make setup 2>/dev/null || make install 2>/dev/null || true
            success "Make setup complete"
        else
            error "make not found"
        fi
        ;;
    shell)
        log "Setting up shell project..."
        for f in *.sh; do
            [ -f "$f" ] && chmod +x "$f"
        done
        success "Shell scripts made executable"
        ;;
    *)
        warn "Could not detect project type. Manual setup may be required."
        ;;
esac

# Create necessary directories
log "Creating directories..."
mkdir -p logs data temp 2>/dev/null || true
[ -d "src" ] && mkdir -p lib bin 2>/dev/null || true

# Copy environment template if exists
if [ -f ".env.example" ]; then
    if [ ! -f ".env" ]; then
        cp .env.example .env
        warn "Created .env from .env.example — edit before running!"
    fi
fi

# Final status
echo ""
log "Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env if created"
echo "  2. Run: $(get_start_command "$PROJECT_TYPE")"
echo ""

get_start_command() {
    case "$1" in
        node) echo "npm run dev" ;;
        python) echo "source venv/bin/activate && python main.py" ;;
        go) echo "go run ." ;;
        *) echo "./run.sh" ;;
    esac
}
```

### Node.js-Specific Template

```bash
#!/usr/bin/env bash
set -e

echo "=== Node.js Bootstrap ==="

# Check Node.js version if .node-version exists
if [ -f ".node-version" ]; then
    REQUIRED_NODE=$(cat .node-version)
    CURRENT_NODE=$(node -v 2>/dev/null | tr -d 'v')
    if [ "$REQUIRED_NODE" != "$CURRENT_NODE" ]; then
        echo "Note: Node.js $REQUIRED_NODE recommended (found $CURRENT_NODE)"
    fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check for optional tools
command -v npx &> /dev/null && echo "npx available"

# Print available scripts
echo ""
echo "Available npm scripts:"
npm run 2>/dev/null | grep -E "^\s+(dev|start|test)" || echo "  (none defined)"

echo ""
echo "✅ Bootstrap complete. Try: npm run dev"
```

### Python-Specific Template

```bash
#!/usr/bin/env bash
set -e

echo "=== Python Bootstrap ==="

# Detect Python project files
if [ -f "requirements.txt" ]; then
    REQUIREMENTS="requirements.txt"
elif [ -f "setup.py" ]; then
    REQUIREMENTS="setup.py"
elif [ -f "pyproject.toml" ]; then
    REQUIREMENTS="pyproject.toml"
fi

# Create virtual environment
VENV_DIR="venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate and install
echo "Installing dependencies..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip

if [ -n "$REQUIREMENTS" ]; then
    pip install -r "$REQUIREMENTS"
fi

# Install dev dependencies if in dev mode
if [ "${1:-}" = "--dev" ]; then
    pip install pytest pytest-cov black flake8
fi

echo ""
echo "✅ Bootstrap complete."
echo "Active virtual environment with: source $VENV_DIR/bin/activate"
```

### Go-Specific Template

```bash
#!/usr/bin/env bash
set -e

echo "=== Go Bootstrap ==="

# Download dependencies
echo "Downloading Go modules..."
go mod download
go mod tidy

# Verify build
echo "Verifying build..."
go build -v ./...

echo ""
echo "✅ Bootstrap complete. Try: go run ."
```

## README.md Template

```markdown
# Project Name

Brief description of what this project does.

## Quick Start

```bash
git clone <repository-url>
cd <project-name>
./bootstrap.sh
```

## Development

### Available Commands

| Command | Description |
|---------|-------------|
| `./bootstrap.sh` | Install dependencies and setup environment |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |

### Manual Setup

If `bootstrap.sh` fails:

```bash
# Node.js projects
npm install

# Python projects
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Go projects
go mod download
```

## Project Structure

```
.
├── bootstrap.sh      # Setup script
├── package.json      # Node.js dependencies
├── src/              # Source code
└── README.md         # This file
```

## License

MIT
```

## Definition of Done

- [ ] `bootstrap.sh` exists and is executable (`chmod +x`)
- [ ] `bootstrap.sh` successfully installs all dependencies
- [ ] `bootstrap.sh` handles errors gracefully (doesn't fail silently)
- [ ] `README.md` has "Quick Start" section with `git clone` and `./bootstrap.sh`
- [ ] README.md has appropriate development commands for project type
- [ ] Changes committed to a feature branch (`chore/bootstrap-setup`)
- [ ] PR created or branch pushed to origin
- [ ] Bootstrap tested in clean environment (or explicitly documented if not)

## Repo Type Detection Reference

### Node.js Detection
```bash
# Primary indicators
[ -f "package.json" ]

# Check for npm/yarn/pnpm
[ -f "yarn.lock" ] && echo "uses yarn"
[ -f "pnpm-lock.yaml" ] && echo "uses pnpm"

# Version file
[ -f ".nvmrc" ] && cat .nvmrc
```

### Python Detection
```bash
# Primary indicators
[ -f "requirements.txt" ]
[ -f "setup.py" ]
[ -f "pyproject.toml" ]

# Version file
[ -f ".python-version" ] && cat .python-version

# Check for virtual environment
[ -d "venv" ] || [ -d ".venv" ]
```

### Go Detection
```bash
# Primary indicators
[ -f "go.mod" ]

# Version from go.mod
head -1 go.mod | grep -oP 'go \K[0-9.]+'
```

### Shell Project Detection
```bash
# Many shell scripts in root
ls -1 *.sh 2>/dev/null | wc -l

# Makefile
[ -f "Makefile" ]
```

## Error Handling Patterns

```bash
# Check for required command
command -v <cmd> &> /dev/null || error "<cmd> not found. Install..."

# Check file exists
[ -f "file" ] || error "file not found"

# Check directory exists
[ -d "dir" ] || mkdir -p "dir"

# Try command, capture output
if OUTPUT=$(command 2>&1); then
    success "Command succeeded"
else
    warn "Command failed: $OUTPUT"
fi
```

## Skill Location

- **Primary:** `/home/ubuntu/.openclaw/skills/repo-bootstrap/SKILL.md`
- **Distribution:** Committed to `tylergarlick/mission-control` bootstrap repo
- **Last Updated:** 2026-03-24
