#!/usr/bin/env bash
set -euo pipefail
echo "[sSoS] env-check The-Hive"
echo "numeral=137451921129154222"
test -f README.md && test -f package.json && test -f App.tsx
echo "ok"
