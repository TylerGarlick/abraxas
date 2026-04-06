#!/bin/bash
# Start server, run tests, then stop

echo "🔮 Starting Abraxas Demo Server..."
node server.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
sleep 2

echo ""
echo "🧪 Running API Tests..."
echo ""

# Test 1: Test cases endpoint
echo "Test 1: GET /api/test-cases"
curl -s http://localhost:3000/api/test-cases | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('Status: OK');
console.log('Test cases:', data.length);
data.forEach(tc => console.log('  -', tc.claim));
"

echo ""
echo "Test 2: POST /api/verify (2 + 2 = 4)"
curl -s -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"claim":"2 + 2 = 4"}' | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('Confidence:', data.verification.confidence);
console.log('Result:', data.verification.result);
console.log('Labels:', data.labels.map(l => l.label).join(', '));
data.verification.steps.forEach(s => console.log('  Step', s.step + ':', s.description));
"

echo ""
echo "Test 3: POST /api/verify (2 + 2 = 5)"
curl -s -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"claim":"2 + 2 = 5"}' | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('Confidence:', data.verification.confidence);
console.log('Result:', data.verification.result);
console.log('Labels:', data.labels.map(l => l.label).join(', '));
"

echo ""
echo "Test 4: POST /api/verify (3x + 7 = 22)"
curl -s -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"claim":"3x + 7 = 22"}' | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('Confidence:', data.verification.confidence);
console.log('Computed:', data.verification.computed);
data.verification.steps.forEach(s => console.log('  Step', s.step + ':', s.description, '→', s.result || ''));
"

echo ""
echo "Test 5: GET /api/comparison"
curl -s http://localhost:3000/api/comparison | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('Dimensions:', data.dimensions.length);
console.log('Features:', data.features.length);
data.dimensions.slice(0,2).forEach(d => console.log('  ' + d.name + ': Abraxas=' + d.abraxas));
"

echo ""
echo "✅ All tests complete!"

# Stop server
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null
echo "Done."
