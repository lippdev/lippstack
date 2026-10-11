#!/usr/bin/env bash
# Installs the lippstack mods on this machine. Run it from the repo folder.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"

# Our marketplace (this folder) and the mods it ships.
claude plugin marketplace add "$here"
claude plugin install savvy-progress@lippstack
claude plugin install stage-bar@lippstack
claude plugin install design-skills@lippstack

# Third-party plugins, pulled from their own GitHub repos so they stay current.
claude plugin install superpowers@lippstack
claude plugin install ponytail@lippstack

# Built into Claude Code: nothing to download, it only has to be switched on.
claude plugin enable cc-plugin-you-should-know@builtin

echo "Done. Restart Claude Code, or run /reload-plugins in an open session."
