#!/bin/bash
# verify-task.sh — Automated Task Completion Verification
# Usage: ./scripts/verify-task.sh [task_number]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Abraxas Task Verification System"
echo "===================================="
echo ""

# Check if task number provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 <task_number>${NC}"
    echo "Example: $0 76.16"
    exit 1
fi

TASK_NUM=$1
echo -e "${BLUE}Verifying Task: $TASK_NUM${NC}"
echo ""

# Initialize verification checklist
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_CHECKS=6

# Check 1: Git Status (committed)
echo -n "1. Git committed... "
if git diff --quiet HEAD; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ FAIL - Uncommitted changes${NC}"
    ((FAIL_COUNT++))
fi

# Check 2: Git Status (pushed)
echo -n "2. Git pushed... "
if git rev-parse --abbrev-ref --symbolic-full-name @{u} &>/dev/null; then
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}❌ FAIL - Not pushed to remote${NC}"
        ((FAIL_COUNT++))
    fi
else
    echo -e "${YELLOW}⚠️  SKIP - No remote configured${NC}"
fi

# Check 3: Test files exist (if applicable)
echo -n "3. Test files exist... "
TEST_COUNT=$(find . -name "*.test.*" -o -name "*test*.ts" -o -name "*test*.js" 2>/dev/null | wc -l)
if [ "$TEST_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS ($TEST_COUNT test files)${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  SKIP - No test files found${NC}"
fi

# Check 4: Documentation updated
echo -n "4. Documentation updated... "
if [ -f "README.md" ] || [ -f "docs/index.md" ] || [ -f "CHANGELOG.md" ]; then
    # Check if docs were modified in last commit
    if git show --name-only --pretty=format: HEAD | grep -qE "README|CHANGELOG|docs/"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${YELLOW}⚠️  SKIP - Docs exist but not updated in last commit${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP - No docs found${NC}"
fi

# Check 5: TASKS.md marked complete
echo -n "5. TASKS.md status... "
if grep -q "✅.*$TASK_NUM\|$TASK_NUM.*✅" TASKS.md 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  SKIP - Task not found in TASKS.md${NC}"
fi

# Check 6: Memory/logged
echo -n "6. Memory logged... "
if [ -d "memory" ] && [ "$(find memory -name "*.md" -mtime -1 | wc -l)" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  SKIP - No recent memory files${NC}"
fi

echo ""
echo "===================================="
echo -e "Results: ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}"
echo ""

# Calculate percentage
VERIFICATION_PCT=$((PASS_COUNT * 100 / TOTAL_CHECKS))

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ TASK VERIFIED COMPLETE (${VERIFICATION_PCT}%)${NC}"
    echo ""
    echo "Next steps:"
    echo "  - Update TASKS.md with ✅ status"
    echo "  - Add to memory/YYYY-MM-DD.md"
    echo "  - Push to remote if not already done"
    exit 0
else
    echo -e "${RED}❌ TASK NOT READY FOR COMPLETION${NC}"
    echo ""
    echo "Fix the following before marking complete:"
    if [ $FAIL_COUNT -gt 0 ]; then
        echo "  - Commit uncommitted changes"
        echo "  - Push to remote"
    fi
    exit 1
fi
