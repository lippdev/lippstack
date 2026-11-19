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
sync felipebasurto/unslop-ui skills/unslop-ui unslop-ui

# Keep the explicit invocation restriction for agents that ignore the Claude flag.
node - "$dest/unslop-ui/SKILL.md" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const text = fs.readFileSync(file, 'utf8');
const updated = text.replace(/^(description: )(.+)$/m, (_, prefix, value) => {
  if (/only runs when explicitly/i.test(value)) return prefix + value;
  const sentence = ' Only runs when explicitly requested.';
  return prefix + (value.endsWith('"') ? value.slice(0, -1) + sentence + '"' : value + sentence);
});
if (updated === text && !/only runs when explicitly/i.test(text)) throw new Error(`Missing description in ${file}`);
fs.writeFileSync(file, updated);
NODE

echo "Bump design-skills in its plugin.json and in .claude-plugin/marketplace.json."
