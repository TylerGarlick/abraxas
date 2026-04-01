#!/bin/bash
# Run all 6 models sequentially and save results

RESULTS_DIR="/tmp/abraxas-checkout/tests/results"
RESEARCH_DIR="/home/ubuntu/.openclaw/workspace/abraxas/research"
TEST_FILE="/tmp/abraxas-checkout/tests/test_abraxas_v2_7dim.py"

# Each entry: ID:ModelName
MODELS=(
  "glm-5:glm-5:cloud"
  "gemma3-27b:gemma3:27b-cloud"
  "qwen3.5:qwen3.5:cloud"
  "gpt-oss-120b:gpt-oss:120b-cloud"
  "gpt-oss-20b:gpt-oss:20b-cloud"
  "minimax-m2.7:minimax-m2.7:cloud"
)

for dir in glm-5 gemma3-27b qwen3.5 gpt-oss-120b gpt-oss-20b minimax-m2.7; do
  mkdir -p $RESULTS_DIR/$dir
done

echo "=========================================="
echo "ABRAXAS v2 - ALL 6 MODELS TEST SUITE"
echo "=========================================="

for entry in "${MODELS[@]}"; do
  # Split on first colon only
  MODEL_ID="${entry%%:*}"
  MODEL_NAME="${entry#*:}"
  
  echo ""
  echo ">>> Testing: $MODEL_ID ($MODEL_NAME)"
  echo "----------------------------------------"
  
  # Update model in test file - escape any special chars in MODEL_NAME
  ESCAPED_NAME=$(echo "$MODEL_NAME" | sed 's/[/&]\ /\\&/g')
  sed -i "s/MODEL = \"[^\"]*\"/MODEL = \"$ESCAPED_NAME\"/" $TEST_FILE
  
  echo "Model set to: $(grep '^MODEL ' $TEST_FILE)"
  
  # Clear old results
  rm -f $RESEARCH_DIR/abraxas-v2-test-results-*.json
  
  # Run test
  START=$(date +%s)
  timeout 600 python3 -u $TEST_FILE 2>&1 | tail -30
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
    echo ">>> $MODEL_ID: $SCORE"
  else
    echo ">>> $MODEL_ID: NO RESULT FILE"
  fi
  
  echo "----------------------------------------"
  
  # Small delay between models
  sleep 2
done

echo ""
echo "=========================================="
echo "ALL MODELS COMPLETE"
echo "=========================================="
