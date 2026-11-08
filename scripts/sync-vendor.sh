#!/usr/bin/env bash
# Refreshes the third-party skills copied into plugins/design-skills from upstream.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/plugins/design-skills/skills"
readme="$root/plugins/design-skills/README.md"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# repo, path of the skill inside it, skill name here
sync() {
  git clone -q --depth 1 "https://github.com/$1.git" "$tmp/$3"
  rm -rf "${dest:?}/${3:?}"
  cp -R "$tmp/$3/$2" "$dest/$3"
  cp "$tmp/$3/LICENSE" "$dest/$3/LICENSE"
  sha="$(git -C "$tmp/$3" rev-parse --short=7 HEAD)"
  # keep the commit in the README table row of this skill in step
  perl -pi -e 's/\@ `[0-9a-f]{7,}`/\@ `'"$sha"'`/ if /^\| `\Q'"$3"'\E` \|/' "$readme"
  echo "$3 <- $1 @ $sha"
}

sync emilkowalski/skills skills/apple-design apple-design
sync emilkowalski/skills skills/review-animations review-animations
sync emilkowalski/skills skills/break-ui break-ui
sync emilkowalski/skills skills/prototype prototype
sync emilkowalski/skills skills/animation-performance animation-performance
sync emilkowalski/skills skills/animate animate
sync emilkowalski/skills skills/choreograph choreograph
sync emilkowalski/skills skills/gestures gestures
sync emilkowalski/skills skills/remove-animations remove-animations
sync nutlope/hallmark skills/hallmark hallmark

echo "Bump design-skills in its plugin.json and in .claude-plugin/marketplace.json."
