#!/usr/bin/env bash
# Install macOS launchd jobs for VGS scheduled ops.
# Usage: ./scripts/install-vgs-launchd.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENTS_DIR="${HOME}/Library/LaunchAgents"
LOG_DIR="${HOME}/Library/Logs"
OPS_SCRIPT="${REPO_ROOT}/scripts/cron/run-vgs-scheduled-ops.sh"
QUARTERLY_SCRIPT="${REPO_ROOT}/scripts/cron/run-vgs-quarterly-stale-batch.sh"
OPS_PLIST="${AGENTS_DIR}/no.minveg.vgs-scheduled-ops.plist"
QUARTERLY_PLIST="${AGENTS_DIR}/no.minveg.vgs-quarterly-stale-batch.plist"

chmod +x "${OPS_SCRIPT}" "${QUARTERLY_SCRIPT}"
mkdir -p "${AGENTS_DIR}" "${LOG_DIR}"

write_plist() {
  local path="$1"
  local label="$2"
  local script_path="$3"
  local months="$4"

  cat >"${path}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${script_path}</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
${months}
  </array>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/${label}.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/${label}.err.log</string>
</dict>
</plist>
EOF
}

OPS_MONTHS='    <dict><key>Month</key><integer>1</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Month</key><integer>7</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>'

QUARTERLY_MONTHS='    <dict><key>Month</key><integer>2</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Month</key><integer>5</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Month</key><integer>8</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Month</key><integer>11</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>'

write_plist "${OPS_PLIST}" "no.minveg.vgs-scheduled-ops" "${OPS_SCRIPT}" "${OPS_MONTHS}"
write_plist "${QUARTERLY_PLIST}" "no.minveg.vgs-quarterly-stale-batch" "${QUARTERLY_SCRIPT}" "${QUARTERLY_MONTHS}"

for plist in "${OPS_PLIST}" "${QUARTERLY_PLIST}"; do
  label="$(/usr/libexec/PlistBuddy -c 'Print :Label' "${plist}")"
  launchctl bootout "gui/$(id -u)/${label}" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "${plist}"
  launchctl enable "gui/$(id -u)/${label}"
done

echo "Installed:"
echo "  ${OPS_PLIST} (Jan 1 + Jul 1, 03:00 — full ops)"
echo "  ${QUARTERLY_PLIST} (Feb/May/Aug/Nov 1, 03:00 — stale-draft batch)"
echo "Logs: ${LOG_DIR}/no.minveg.vgs-*.log"
