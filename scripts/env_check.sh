#!/usr/bin/env bash
set -euo pipefail
echo "[env-check] The-Hive numeral=137451921129154222"
echo "[env-check] time=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
for p in README.md package.json App.tsx server.ts SECURITY.md; do
  if [[ -e "$p" ]]; then echo "[ok] $p"; else echo "[miss] $p"; fi
done
