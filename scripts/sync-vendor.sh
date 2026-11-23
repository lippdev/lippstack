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
node - "$dest" <<'NODE'
const fs = require('fs');
const path = require('path');
const dest = process.argv[2];
for (const name of ['prototype', 'review-animations', 'unslop-ui']) {
  const file = path.join(dest, name, 'SKILL.md');
  let text = fs.readFileSync(file, 'utf8');
  if (name === 'unslop-ui') {
    text = text.replace(/Use when asked to clean up,[\s\S]*?as a final pass once you finish building or restyling a screen\./, 'Only runs when explicitly requested.');
    if (!text.includes('disable-model-invocation: true')) text = text.replace(/^(description: .*)$/m, '$1\ndisable-model-invocation: true');
  }
  text = text.replace(/^(description: )(.+)$/m, (_, prefix, value) => {
    if (/only runs when explicitly/i.test(value)) return prefix + value;
    const sentence = ' Only runs when explicitly requested.';
    return prefix + (value.endsWith('"') ? value.slice(0, -1) + sentence + '"' : value + sentence);
  });
  if (!/^description: .*only runs when explicitly/im.test(text)) throw new Error(`Missing explicit invocation description in ${file}`);
  fs.writeFileSync(file, text);
}
for (const name of ['animate', 'gestures']) {
  const file = path.join(dest, name, 'SKILL.md');
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace('stop and read `../pick-ui-library/SKILL.md` to pick one', 'use `pick-ui-library` if installed, or choose an accessible established library yourself');
  text = text.replace('When unsure, read `../pick-ui-library/SKILL.md`.', 'When unsure, use `pick-ui-library` if installed, or evaluate accessible libraries yourself.');
  if (text.includes('`../pick-ui-library/SKILL.md`')) throw new Error(`Unexpected missing skill reference in ${file}`);
  fs.writeFileSync(file, text);
}
NODE

echo "Bump design-skills in its plugin.json and in .claude-plugin/marketplace.json."
