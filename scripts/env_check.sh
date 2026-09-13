#!/usr/bin/env bash
set -euo pipefail
echo "The-Hive env check"
echo "numeral=137451921129154222"
echo "date_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
command -v node >/dev/null && node --version || echo "node: missing"
command -v npm >/dev/null && npm --version || echo "npm: missing"
test -f package.json && echo "package.json: present" || echo "package.json: missing"
test -d .github/workflows && echo "workflows: present" || echo "workflows: missing"
echo "status=ok"
exit 0
