#!/usr/bin/env bash
set -euo pipefail
echo "[hive-env] node=The-Hive"
command -v node >/dev/null && echo "[hive-env] node=$(node --version)" || echo "[hive-env] node missing (soft)"
command -v git >/dev/null && echo "[hive-env] git ok" || { echo missing git; exit 2; }
echo "[hive-env] PASS"
