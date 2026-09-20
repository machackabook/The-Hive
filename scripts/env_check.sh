#!/usr/bin/env bash
set -euo pipefail
echo "[hive-env] numeral=137451921129154222"
test -f App.tsx && echo App_tsx_ok
test -f package.json && echo package_ok
exit 0
