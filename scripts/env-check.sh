#!/usr/bin/env bash
set -euo pipefail
# Continuity env-check — refuse empty SHA / missing README / point-zero null
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail() { echo "ENV-CHECK FAIL: $*"; exit 1; }
[[ -f "$ROOT/README.md" ]] || fail "README.md missing"
[[ -s "$ROOT/README.md" ]] || fail "README.md empty"
git -C "$ROOT" rev-parse HEAD >/dev/null 2>&1 || fail "no git SHA"
SHA=$(git -C "$ROOT" rev-parse HEAD)
[[ "$SHA" != "0000000000000000000000000000000000000000" ]] || fail "point-zero null SHA"
echo "ENV-CHECK OK sha=$SHA numeral=137451921129154222"
