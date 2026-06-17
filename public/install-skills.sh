#!/bin/sh
# install.sh — download the OpenInterpretability Claude Code skills into your skills directory.
#
# Usage:
#   curl -fsSL https://openinterp.org/install-skills.sh | sh
#   curl -fsSL https://openinterp.org/install-skills.sh | sh -s -- --project   # ./.claude/skills
#   curl -fsSL https://openinterp.org/install-skills.sh | sh -s -- --dir PATH  # custom destination
#
# It only writes SKILL.md files under the chosen directory. No code is executed, nothing phones home.
# Source: https://github.com/OpenInterpretability/openinterp-mcp/blob/main/skills/install.sh
set -eu

DEST="${CLAUDE_SKILLS_DIR:-${HOME}/.claude/skills}"
while [ $# -gt 0 ]; do
  case "$1" in
    --project) DEST="$(pwd)/.claude/skills" ;;
    --dir) shift; DEST="${1:?--dir needs a path}" ;;
    -h|--help) echo "usage: install.sh [--project | --dir PATH]"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

RAW="https://raw.githubusercontent.com/OpenInterpretability"
MCP="${RAW}/openinterp-mcp/main/skills"
LAB="${RAW}/openinterp-lab/main/skills"

# <skill-name> <raw-base-url> — 8 from openinterp-mcp (one per typed tool) + openinterp-lab
SKILLS="colab-attach ${MCP}
colab-status ${MCP}
capture-acts ${MCP}
list-probes ${MCP}
probe-eval ${MCP}
sae-lookup ${MCP}
steer ${MCP}
causality-protocol ${MCP}
openinterp-lab ${LAB}"

mkdir -p "$DEST"
printf 'Installing OpenInterpretability skills into %s\n' "$DEST"
ok=0; fail=0
printf '%s\n' "$SKILLS" | while IFS=' ' read -r name base; do
  [ -z "$name" ] && continue
  mkdir -p "$DEST/$name"
  if curl -fsSL "$base/$name/SKILL.md" -o "$DEST/$name/SKILL.md"; then
    printf '  installed  %s\n' "$name"
  else
    printf '  SKIPPED    %s (fetch failed)\n' "$name" >&2
  fi
done
printf 'Done. In Claude Code, run /skills to see them (restart the agent if needed).\n'
