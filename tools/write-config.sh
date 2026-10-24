#!/usr/bin/env bash
# Writes config.js from GEMINI_API_KEY / GEMINI_MODEL (env vars, or .env if present).
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then set -a; . ./.env; set +a; fi
node -e 'process.stdout.write("window.SI_CONFIG="+JSON.stringify({geminiKey:process.env.GEMINI_API_KEY||"",geminiModel:process.env.GEMINI_MODEL||"gemini-3.8-flash"})+";\n")' > config.js
echo "config.js written (key ${GEMINI_API_KEY:+set}${GEMINI_API_KEY:-MISSING})" | sed 's/AIza[^ )]*/***/'
