#!/bin/bash
# run-constitution-tests.sh — Run all constitution enforcement tests
# 
# Usage: ./run-constitution-tests.sh
#
# Tests verify that "Math is derived, not asserted" is enforced.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
ERGON_GATE="$SKILL_DIR/scripts/ergon-gate.js"

echo "============================================"
echo "  logos-math Constitution Test Suite"
echo "  Mandate: Math is derived, not asserted."
echo "============================================"
echo ""

PASS=0
FAIL=0

run_test() {
  local name="$1"
  local claim="$2"
  local expected="$3"  # "pass" or "block"
  
  echo -n "Testing: $name... "
  
  if output=$(node "$ERGON_GATE" verify "$claim" 2>&1); then
    actual="pass"
  else
    actual="block"
  fi
  
  if [ "$actual" = "$expected" ]; then
    echo "✓ PASS"
    PASS=$((PASS + 1))
  else
    echo "✗ FAIL (expected $expected, got $actual)"
    echo "  Claim: $claim"
    FAIL=$((FAIL + 1))
  fi
}

echo "--- Verification Tests ---"
echo ""

# Tests that should PASS
run_test "CONST-003: Arithmetic with derivation" "137 + 243 = 380" "pass"
run_test "CONST-006: Linear equation" "3x + 7 = 22" "pass"
run_test "CONST-007: Integral" "integral of x from 0 to 2 = 2" "pass"
run_test "CONST-008: Probability" "P(3 heads in 5 flips) = 10/32" "pass"
run_test "CONST-009: Eigenvalues" "eigenvalues of [[2,1],[1,2]]" "pass"
run_test "CONST-010: Floating point" "0.1 + 0.2 = 0.3" "pass"

echo ""
echo "--- Block Tests ---"
echo ""

# Tests that should BLOCK
run_test "CONST-001: Pure assertion" "e^π > π^e" "block"
run_test "CONST-002: Answer without derivation" "The answer is 42" "block"
run_test "CONST-004: Wrong answer" "2 + 2 = 5" "block"

echo ""
echo "============================================"
echo "  Results: $PASS passed, $FAIL failed"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi

exit 0
