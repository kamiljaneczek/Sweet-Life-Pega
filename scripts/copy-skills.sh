#!/usr/bin/env bash
set -euo pipefail

# Copy skills from shared pega-skills repo into this project's .claude/skills/
SOURCE="/dev_workspace/pega-skills/skills/"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$SCRIPT_DIR/.claude/skills/"

if [[ ! -d "$SOURCE" ]]; then
  echo "Error: Source directory not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$TARGET"

if command -v rsync &>/dev/null; then
  rsync -av --delete "$SOURCE" "$TARGET"
else
  echo "rsync not found, falling back to cp -r"
  rm -rf "$TARGET"*
  cp -r "$SOURCE"* "$TARGET"
fi

echo ""
echo "Skills synced to $TARGET:"
ls -1 "$TARGET"
