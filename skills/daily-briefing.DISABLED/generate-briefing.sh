#!/bin/bash
# Daily Briefing Generator
# Creates morning and evening briefings in the research repository

set -e

REPO="/home/ubuntu/.openclaw/projects/outerspace/research"
DATE=$(date +%Y-%m-%d)
YEAR=$(date +%Y)
MONTH=$(date +%m)
DAY=$(date +%d)
TIMESTAMP=$(date +"%I:%M %p %Z")

# Create directory
DIR="${REPO}/${YEAR}/${MONTH}/${DAY}"
mkdir -p "$DIR"

# Weather for 84015
WEATHER=$(curl -s "https://wttr.in/84015?format=j1" 2>/dev/null)

if [ -n "$WEATHER" ]; then
  TEMP=$(echo "$WEATHER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current_condition'][0]['temp_F'] + '°F / ' + d['current_condition'][0]['temp_C'] + '°C')" 2>/dev/null || echo "unavailable")
  FEELS=$(echo "$WEATHER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current_condition'][0]['FeelsLikeF'] + '°F')" 2>/dev/null || echo "unavailable")
  DESC=$(echo "$WEATHER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current_condition'][0]['weatherDesc'][0]['value'])" 2>/dev/null || echo "unknown")

  # Clothing suggestion based on temp
  TEMP_F=$(echo "$WEATHER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current_condition'][0]['temp_F'])" 2>/dev/null || echo "60")

  if [ "$TEMP_F" -lt 20 ]; then
    CLOTHING="Heavy coat, insulated layers, gloves, hat"
  elif [ "$TEMP_F" -lt 35 ]; then
    CLOTHING="Coat, warm layers, gloves recommended"
  elif [ "$TEMP_F" -lt 55 ]; then
    CLOTHING="Jacket or coat, layers"
  elif [ "$TEMP_F" -lt 70 ]; then
    CLOTHING="Light jacket or sweater"
  elif [ "$TEMP_F" -lt 85 ]; then
    CLOTHING="Short sleeves, light layers"
  else
    CLOTHING="Shorts, light breathable clothing, hydration"
  fi
else
  TEMP="unavailable"
  FEELS="unavailable"
  DESC="unavailable"
  CLOTHING="check manually"
fi

# News search function (uses ddg CLI — NDJSON output)
search_news() {
  local query="$1"
  local limit="${2:-5}"
  ddg --json "$query" 2>/dev/null | python3 -c "
import sys, json
count = 0
for line in sys.stdin:
    line = line.strip()
    if not line or count >= $limit:
        continue
    try:
        d = json.loads(line)
        if 'title' in d and 'url' in d:
            print(f'- {d[\"title\"]}: {d[\"url\"]}')
            count += 1
    except:
        pass
if count == 0:
    print('- No results found')
" 2>/dev/null || echo "- No results for: $query"
}

# Generate morning briefing
generate_morning() {
  cat > "${DIR}/morning-briefing.md" << EOF
# Morning Briefing — ${DATE} ${TIMESTAMP}

## Weather (84015) 🌤️
**Conditions:** ${DESC}
**Temp:** ${TEMP}
**Feels like:** ${FEELS}
**Clothing:** ${CLOTHING}

## News

### AI News
$(search_news "AI artificial intelligence news" 5)

### Technology News
$(search_news "technology news today" 5)

### Jungian News
$(search_news "Jung psychology news" 5)

### Abraxas News
$(search_news "Abraxas mythology philosophy news" 5)

### Relevant News
$(search_news "interesting news today" 5)
EOF
  echo "Morning briefing created: ${DIR}/morning-briefing.md"
}

# Generate evening briefing
generate_evening() {
  cat > "${DIR}/evening-briefing.md" << EOF
# Evening Briefing — ${DATE} ${TIMESTAMP}

## Weather (84015) 🌙
**Conditions:** ${DESC}
**Temp:** ${TEMP}
**Feels like:** ${FEELS}

## News

### AI News
$(search_news "AI artificial intelligence news today" 5)

### Technology News
$(search_news "technology news today" 5)

### Jungian News
$(search_news "Jung psychology news" 5)

### Abraxas News
$(search_news "Abraxas mythology philosophy news" 5)

### Relevant News
$(search_news "interesting news today" 5)
EOF
  echo "Evening briefing created: ${DIR}/evening-briefing.md"
}

# Determine which briefing to generate
BRIEFING_TYPE="${1:-morning}"
if [ "$BRIEFING_TYPE" = "evening" ]; then
  generate_evening
else
  generate_morning
fi
