#!/usr/bin/env bash
# Refreshes the third-party skills copied into plugins/design-skills from upstream.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/plugins/design-skills/skills"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# repo, path of the skill inside it, skill name here
sync() {
  git clone -q --depth 1 "https://github.com/$1.git" "$tmp/$3"
  rm -rf "${dest:?}/${3:?}"
  cp -R "$tmp/$3/$2" "$dest/$3"
  cp "$tmp/$3/LICENSE" "$dest/$3/LICENSE"
  echo "$3 <- $1 @ $(git -C "$tmp/$3" rev-parse --short HEAD)"
}

sync emilkowalski/skills skills/apple-design apple-design
sync emilkowalski/skills skills/review-animations review-animations
sync emilkowalski/skills skills/break-ui break-ui
sync emilkowalski/skills skills/prototype prototype
sync emilkowalski/skills skills/animation-performance animation-performance
sync nutlope/hallmark skills/hallmark hallmark

echo "Update the commits in plugins/design-skills/README.md and bump the plugin version."
