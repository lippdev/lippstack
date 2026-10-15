#!/usr/bin/env bash
# Installs lippstack on macOS and Linux. Run it from the repo folder.
#
#   ./setup.sh                              Claude Code: mods, skills and plugins
#   ./setup.sh --agents codex,gemini-cli    also the skills for other agents (npx skills)
#
# Agent ids: codex, gemini-cli, kimi-code-cli, opencode, cursor, github-copilot, ...
# ('*' for every agent the skills CLI knows). Mods are Claude Code only.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"

LIPPSTACK_PLUGINS="savvy-progress stage-bar done-ping where-line guardrails design-skills po-skills eng-skills"
# Dean Peters' PM skills (CC BY-NC-SA 4.0): only the ones we use, out of 77.
PM_SKILLS="user-story user-story-splitting epic-breakdown-advisor epic-hypothesis
  prd-development prioritization-advisor roadmap-planning discovery-process
  jobs-to-be-done problem-statement incoming-request-advisor stakeholder-mapping"
OFFICIAL_PLUGINS="hookify claude-md-management session-report playwright"

agents=""
while [ $# -gt 0 ]; do
  case "$1" in
    --agents) agents="${2:-}"; shift 2 ;;
    --agents=*) agents="${1#--agents=}"; shift ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1 (see ./setup.sh --help)" >&2; exit 1 ;;
  esac
done

install_claude() {
  echo "==> Registering lippstack marketplace..."
  claude plugin marketplace add "$here"

  echo "==> Installing lippstack plugins and skills..."
  for plugin in $LIPPSTACK_PLUGINS; do
    claude plugin install "${plugin}@lippstack"
  done

  # Third-party plugin, pulled from its own GitHub repo so it stays current.
  echo "==> Installing ponytail..."
  claude plugin install ponytail@lippstack

  echo "==> Registering PM skills marketplace..."
  claude plugin marketplace add deanpeters/Product-Manager-Skills
  for skill in $PM_SKILLS; do
    claude plugin install "$skill@pm-skills"
  done

  # Anthropic's official plugins.
  echo "==> Registering official plugins..."
  claude plugin marketplace add anthropics/claude-plugins-official
  for plugin in $OFFICIAL_PLUGINS; do
    claude plugin install "$plugin@claude-plugins-official"
  done

  # Built into Claude Code: nothing to download, it only has to be switched on.
  echo "==> Enabling built-in plugins..."
  claude plugin enable cc-plugin-you-should-know@builtin
}

install_agents() {
  if ! command -v npx >/dev/null 2>&1; then
    echo "Error: --agents needs Node.js (npx) to run the skills CLI." >&2
    exit 1
  fi
  local flags=() a
  IFS=',' read -r -a list <<< "$agents"
  for a in "${list[@]}"; do flags+=(-a "$a"); done

  echo "==> Installing lippstack skills for: $agents"
  npx -y skills add "$here" -g "${flags[@]}" --skill '*' -y
  echo "==> Installing ponytail for: $agents"
  npx -y skills add DietrichGebert/ponytail -g "${flags[@]}" --skill '*' -y
  echo "==> Installing PM skills for: $agents"
  local pm=() s
  for s in $PM_SKILLS; do pm+=(-s "$s"); done
  npx -y skills add deanpeters/Product-Manager-Skills -g "${flags[@]}" "${pm[@]}" -y
}

if command -v claude >/dev/null 2>&1; then
  install_claude
elif [ -z "$agents" ]; then
  echo "Error: 'claude' CLI is not found in PATH. Install Claude Code, or use --agents for other agents." >&2
  exit 1
else
  echo "==> 'claude' not found: skipping Claude Code, installing skills only."
fi

if [ -n "$agents" ]; then install_agents; fi

echo ""
echo "Done! Restart your agent, or run /reload-plugins in an open Claude Code session."
