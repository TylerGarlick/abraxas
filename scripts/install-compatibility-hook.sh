#!/bin/bash
# install-compatibility-hook.sh
# Installs the git pre-commit hook for compatibility checking

set -e

HOOK_DIR=".git/hooks"
HOOK_PATH="$HOOK_DIR/pre-commit"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing compatibility pre-commit hook..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOK_DIR"

# Check if hook already exists
if [ -f "$HOOK_PATH" ]; then
    echo "Warning: $HOOK_PATH already exists."
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Create the pre-commit hook
cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
# Pre-commit hook: Run compatibility audit
# Skip with: git commit --no-verify

echo "Running compatibility audit..."

# Check if compatibility-keeper agent exists
if [ -f ".claude/agents/compatibility-keeper.md" ]; then
    echo "[compat-keeper] Claude Code agents present"
fi

# Check if .opencode directory exists
if [ -d ".opencode" ]; then
    echo "[compat-keeper] OpenCode variants present"
    
    # Check for drift (simple check - agent count mismatch)
    CLAUDE_AGENTS=$(find .claude/agents -name "*.md" 2>/dev/null | wc -l)
    OPENCODE_AGENTS=$(find .opencode/agent -name "*.md" 2>/dev/null | wc -l)
    
    if [ "$CLAUDE_AGENTS" != "$OPENCODE_AGENTS" ]; then
        echo "[compat-keeper] WARNING: Agent count mismatch (Claude: $CLAUDE_AGENTS, OpenCode: $OPENCODE_AGENTS)"
        echo "[compat-keeper] Run '/sync' with compatibility-keeper to update"
    fi
else
    echo "[compat-keeper] No .opencode/ directory found - run '/sync' to generate variants"
fi

echo "[compat-keeper] Audit complete"
EOF

# Make the hook executable
chmod +x "$HOOK_PATH"

echo "✓ Installed pre-commit hook at $HOOK_PATH"
echo ""
echo "The hook will run compatibility checks before each commit."
echo "To bypass the hook: git commit --no-verify -m 'message'"
echo ""
echo "To uninstall: rm $HOOK_PATH"
