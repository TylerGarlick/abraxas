#!/bin/bash
# Sequential multi-model test runner with fixed sed

MODELS=(
  "glm-5:glm-5:cloud"
  "gemma3-27b:gemma3:27b-cloud"
  "qwen3.5:qwen3.5:cloud"
  "gpt-oss-120b:gpt-oss:120b-cloud"
  "gpt-oss-20b:gpt-oss:20b-cloud"
  "minimax-m2.7:minimax-m2.7:cloud"
)

RESULTS_DIR="/tmp/abraxas-checkout/tests/results"
RESEARCH_DIR="/home/ubuntu/.openclaw/workspace/abraxas/research"
TEST_FILE="/tmp/abraxas-checkout/tests/test_abraxas_v2_7dim.py"

mkdir -p $RESULTS_DIR/glm-5 $RESULTS_DIR/gemma3-27b $RESULTS_DIR/qwen3.5 $RESULTS_DIR/gpt-oss-120b $RESULTS_DIR/gpt-oss-20b $RESULTS_DIR/minimax-m2.7

echo "=========================================="
echo "ABRAXAS v2 MULTI-MODEL TEST SUITE"
echo "=========================================="

for entry in "${MODELS[@]}"; do
  MODEL_ID="${entry%%:*}"
  MODEL_NAME="${entry##*:}"
  
  echo ""
  echo "Testing: $MODEL_ID ($MODEL_NAME)"
  echo "----------------------------------------"
  
  # Verify model name is valid
  echo "Model name: $MODEL_NAME"
  grep "MODEL = " $TEST_FILE
  
  # Clear old result files to get fresh ones
  rm -f $RESEARCH_DIR/abraxas-v2-test-results-*.json 2>/dev/null
  
  # Run test with timeout
  START=$(date +%s)
  timeout 600 python3 $TEST_FILE 2>&1 | grep -E "(Testing|Hallucination|Calibration|Sycophancy|Sol/Nox|Uncertainty|Agon|User Trust|Reasoning|Epistemic|Source|Contradiction|Belief|Meta-|COMPOSITE|Results saved|Error|Traceback)" | head -30
  EXIT=$?
  END=$(date +%s)
  ELAPSED=$((END - START))
  
  echo "Elapsed: ${ELAPSED}s (exit: $EXIT)"
  
  # Find the result file (most recent)
  RESULT=$(ls -t $RESEARCH_DIR/abraxas-v2-test-results-*.json 2>/dev/null | head -1)
  if [ -n "$RESULT" ]; then
    cp "$RESULT" "$RESULTS_DIR/$MODEL_ID/result.json"
    SCORE=$(python3 -c "import json; d=json.load(open('$RESULT')); print(f\"{d.get('composite_score', d.get('overall_score', 0)):.1%}\")" 2>/dev/null)
    echo "Score: $SCORE"
  else
    echo "WARNING: No result file found!"
  fi
done

echo ""
echo "=========================================="
echo "ALL MODELS COMPLETE"
echo "=========================================="
