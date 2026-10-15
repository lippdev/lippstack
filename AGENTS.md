# AGENTS.md

Instructions for any coding agent (Claude Code, Codex, Gemini CLI, Kimi, OpenCode, Cursor…) working on this repo. `CLAUDE.md` and `GEMINI.md` point here.

## What this repo is

A Claude Code plugin marketplace (`.claude-plugin/marketplace.json`) whose skills also install into other agents through the `npx skills` CLI.

```
plugins/<name>/.claude-plugin/plugin.json   manifest of each plugin
plugins/<skills plugin>/skills/<skill>/SKILL.md   Agent Skills: portable to any agent
plugins/<mod>/hooks/register.ts(x)          mods: Claude Code hooks, not portable
plugins/<mod>/tests/*.test.ts               mod tests (claude plugin test)
plugins/design-skills/                      vendored by scripts/sync-vendor.sh; don't edit by hand
setup.sh / setup.ps1                        installers (macOS+Linux / Windows)
scripts/check.mjs                           consistency checks CI runs
```

## Rules

- **Versions move together.** Any change under `plugins/<name>/` bumps its `version` in both `plugins/<name>/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`. Patch for wording and fixes, minor for new skills or behaviour.
- **A new plugin** goes in `marketplace.json`, `setup.sh` (`LIPPSTACK_PLUGINS`), `setup.ps1` (`$lippPlugins`), and the README: its table and the "Or by hand" block. `scripts/check.mjs` fails if one is missing.
- **Skills stay agent-neutral.** `SKILL.md` needs `name` (equal to its folder; lowercase, digits, hyphens; ≤ 64) and `description` (≤ 1024 chars). Don't depend on one agent's tools without a fallback: subagents → "or do it yourself in a fresh pass"; ponytail → "if installed"; Jira → "an Atlassian MCP server". `disable-model-invocation: true` only works in Claude Code, so also say in the `description` that the skill runs only when explicitly asked.
- **Mods** are Claude Code only (TypeScript against the `claude-code` hooks API). Every mod has tests.
- **Vendored skills** (`plugins/design-skills/skills/*`) are refreshed by `scripts/sync-vendor.sh`, which overwrites local edits. A weekly workflow opens a PR when upstream changes.
- **Installers** must keep working on macOS (bash 3.2), Linux and Windows PowerShell 5.1+. In `setup.ps1`, run native commands through `Invoke-Native`/`Invoke-Claude` so a failure stops the script.
- Write README and skill prose in plain English, short sentences, no marketing.

## Verify before committing

```bash
node scripts/check.mjs                      # manifests, versions, skill frontmatter, installers, links
claude plugin validate .                    # marketplace; also each plugins/<name>
claude plugin test plugins/<mod>            # for each mod you touched
bash -n setup.sh                            # and shellcheck setup.sh if you have it
npx -y skills add . --list                  # every skill is still discoverable for other agents
```

CI (`.github/workflows/ci.yml`) runs all of this plus a real install of `setup.sh` / `setup.ps1` on Ubuntu, macOS and Windows.
