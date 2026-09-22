#!/usr/bin/env bash
set -euo pipefail
echo "[hive-env] numeral=137451921129154222"
echo "[hive-env] $(date -u +%Y-%m-%dT%H:%M:%SZ)"
command -v git >/dev/null && git --version || true
echo "[hive-env] ok"
