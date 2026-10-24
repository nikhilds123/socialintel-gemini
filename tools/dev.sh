#!/usr/bin/env bash
# Local run: build config.js from .env, serve on http://localhost:8000
set -euo pipefail
cd "$(dirname "$0")/.."
./tools/write-config.sh
exec python3 -m http.server 8000
