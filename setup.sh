#!/usr/bin/env bash
# Installs the lippstack mods on this machine. Run it from the repo folder.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"

# Our marketplace (this folder) and the mods it ships.
claude plugin marketplace add "$here"
claude plugin install savvy-progress@lippstack
claude plugin install stage-bar@lippstack
claude plugin install done-ping@lippstack
claude plugin install where-line@lippstack
claude plugin install design-skills@lippstack
claude plugin install po-skills@lippstack

# Third-party plugin, pulled from its own GitHub repo so it stays current.
claude plugin install ponytail@lippstack

# Dean Peters' PM skills (CC BY-NC-SA 4.0): from their own marketplace, only the ones we use.
claude plugin marketplace add deanpeters/Product-Manager-Skills
for skill in \
  user-story user-story-splitting epic-breakdown-advisor epic-hypothesis \
  prd-development prioritization-advisor roadmap-planning discovery-process \
  jobs-to-be-done problem-statement incoming-request-advisor stakeholder-mapping; do
  claude plugin install "$skill@pm-skills"
done

# Anthropic's official plugins.
claude plugin marketplace add anthropics/claude-plugins-official
for plugin in hookify claude-md-management session-report playwright; do
  claude plugin install "$plugin@claude-plugins-official"
done

# Built into Claude Code: nothing to download, it only has to be switched on.
claude plugin enable cc-plugin-you-should-know@builtin

echo "Done. Restart Claude Code, or run /reload-plugins in an open session."
