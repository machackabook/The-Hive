#!/usr/bin/env bash
set -euo pipefail
# Continuity env-check — The-Hive stage 148
fail() { echo "ENV-CHECK FAIL: $*"; exit 1; }
[ -f README.md ] || fail "missing README.md"
git rev-parse HEAD >/dev/null 2>&1 || echo "WARN: not a git worktree in this runner"
SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
[ -n "$SHA" ] || fail "empty SHA / point-zero null refused"
echo "ENV-CHECK OK repo=The-Hive sha=$SHA numeral=137451921129154222 stage=148"
exit 0
