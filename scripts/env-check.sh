#!/usr/bin/env bash
set -euo pipefail
# Continuity env probe — source-only authority. Numeral 137451921129154222.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "[env-check] root=${ROOT}"
echo "[env-check] host=$(hostname 2>/dev/null || echo unknown)"
echo "[env-check] pwd=$(pwd)"
required=(README.md .github/workflows)
for p in "${required[@]}"; do
  if [[ ! -e "${ROOT}/${p}" ]]; then
    echo "[env-check] MISSING ${p}" >&2
    exit 1
  fi
done
echo "[env-check] ok — refuse-null"
