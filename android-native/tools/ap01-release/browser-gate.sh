#!/usr/bin/env bash
set -euo pipefail
export PYTHONDONTWRITEBYTECODE=1
cd "$(dirname "$0")/../.."
if [[ "${GITHUB_ACTIONS:-false}" == "true" ]]; then
  # GitHub hosted runner is ephemeral. No user devices/files are accessed.
  VENV="${RUNNER_TEMP:-/tmp}/atms-ap01-browser-gate-venv"
  python3 -m venv "$VENV"
  "$VENV/bin/python" -m pip install --disable-pip-version-check --quiet 'playwright==1.57.0'
  "$VENV/bin/python" -m playwright install --with-deps chromium
  PYTHON="$VENV/bin/python"
else
  PYTHON="${ATMS_QA_PYTHON:-python3}"
fi
"$PYTHON" -c 'import playwright.async_api' || { echo 'AP-01 QA FAILED: Playwright unavailable' >&2; exit 1; }
"$PYTHON" tools/ap01-release/integration.py
"$PYTHON" tools/ap01-release/navigation.py
