#!/bin/bash
# Sequential multi-model test runner

MODELS=(
  "glm-5:glm-5:cloud"
  "gemma3-27b:gemma3:27b-cloud"
  "qwen3.5:qwen3.5:cloud"
  "gpt-oss-120b:gpt-oss:120b-cloud"
  "gpt-oss-20b:gpt-oss:20b-cloud"
  "minimax-m2.7:minimax-m2.7:cloud"
)

RESULTS_DIR="/root/.openclaw/workspace/abraxas/tests/results"
RESEARCH_DIR="/root/.openclaw/workspace/abraxas/research"
TEST_FILE="/root/.openclaw/workspace/abraxas/tests/test_abraxas_v2_7dim_nometa.py"

mkdir -p $RESULTS_DIR

echo "=========================================="
echo "ABRAXAS v2 MULTI-MODEL TEST SUITE"
echo "=========================================="

for entry in "${MODELS[@]}"; do
  MODEL_ID="${entry%%:*}"
  MODEL_NAME="${entry##*:}"
  
  echo ""
  echo "Testing: $MODEL_ID ($MODEL_NAME)"
  echo "----------------------------------------"
  
  # Update model in test file
  sed -i "s/MODEL = \"[^\"]*\"/MODEL = \"$MODEL_NAME\"/" $TEST_FILE
  
  # Clear old result files
  rm -f $RESEARCH_DIR/abraxas-v2-test-results-*.json 2>/dev/null
  
  # Run test
  START=$(date +%s)
  timeout 600 python3 -u $TEST_FILE 2>&1
  EXIT=$?
  END=$(date +%s)
  ELAPSED=$((END - START))
  
  echo ""
  echo "Completed in ${ELAPSED}s (exit: $EXIT)"
  
  # Find and copy result
  RESULT=$(ls -t $RESEARCH_DIR/abraxas-v2-test-results-*.json 2>/dev/null | head -1)
  if [ -n "$RESULT" ]; then
    cp "$RESULT" "$RESULTS_DIR/$MODEL_ID/result.json"
    SCORE=$(python3 -c "import json; d=json.load(open('$RESULT')); print(f\"{d.get('composite_score', d.get('overall_score', 0)):.1%}\")" 2>/dev/null)
    echo "Score: $SCORE"
  else
    echo "WARNING: No result file found!"
  fi
  
  echo "----------------------------------------"
done

echo ""
echo "=========================================="
echo "ALL MODELS COMPLETE"
echo "=========================================="
