#!/usr/bin/env bash
# Continuity mesh env + folder contract. No secrets printed.
set -euo pipefail
echo "[mesh] numeral=137451921129154222"
echo "[mesh] cwd=$(pwd)"
echo "[mesh] date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
for d in docs scripts .github/workflows; do
  if [[ -d "$d" ]]; then echo "[ok] $d"; else echo "[miss] $d"; fi
done
if command -v git >/dev/null 2>&1; then
  echo "[git] $(git rev-parse --short HEAD 2>/dev/null || echo detached)"
fi
echo "[mesh] non-null"
