#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_ROOT}"
set -a
source .env.local
set +a
exec npm run ops:scheduled -- --skip-relay --skip-green-a "$@"
