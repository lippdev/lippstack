#!/usr/bin/env bash
# Installs the lippstack mods on macOS and Linux. Run it from the repo folder.
set -euo pipefail

# Check for claude CLI
if ! command -v claude >/dev/null 2>&1; then
  echo "Error: 'claude' CLI is not found in PATH. Please install Claude Code first." >&2
  exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"

echo "==> Registering lippstack marketplace..."
claude plugin marketplace add "$here"

echo "==> Installing lippstack plugins and skills..."
for plugin in \
  savvy-progress stage-bar done-ping where-line \
  design-skills po-skills eng-skills; do
  claude plugin install "${plugin}@lippstack"
done

# Third-party plugin, pulled from its own GitHub repo so it stays current.
echo "==> Installing ponytail..."
claude plugin install ponytail@lippstack

# Dean Peters' PM skills (CC BY-NC-SA 4.0): from their own marketplace, only the ones we use.
echo "==> Registering PM skills marketplace..."
claude plugin marketplace add deanpeters/Product-Manager-Skills
for skill in \
  user-story user-story-splitting epic-breakdown-advisor epic-hypothesis \
  prd-development prioritization-advisor roadmap-planning discovery-process \
  jobs-to-be-done problem-statement incoming-request-advisor stakeholder-mapping; do
  claude plugin install "$skill@pm-skills"
done

# Anthropic's official plugins.
echo "==> Registering official plugins..."
claude plugin marketplace add anthropics/claude-plugins-official
for plugin in hookify claude-md-management session-report playwright; do
  claude plugin install "$plugin@claude-plugins-official"
done

# Built into Claude Code: nothing to download, it only has to be switched on.
echo "==> Enabling built-in plugins..."
claude plugin enable cc-plugin-you-should-know@builtin

echo ""
echo "Done! Restart Claude Code, or run /reload-plugins in an open session."
