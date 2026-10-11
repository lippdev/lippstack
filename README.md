# lippstack

Mods and skills for Claude Code, tuned to how we work.

## Plugins

| Plugin | Type | What it does |
| :- | :- | :- |
| [savvy-progress](plugins/savvy-progress) | Mod | `/agents-info` opens a live panel of subagents with model, context, tokens and time, plus the account's plan quota (5-hour and weekly). Each tier gets its own pixel Clawd costume. |
| [stage-bar](plugins/stage-bar) | Mod | An animated bar above the prompt that tracks the stages of your task, one color per stage. Claude names the stages and moves the bar as it works. Try `/stages-demo`. |

## Skills

| Plugin | Source | What it does |
| :- | :- | :- |
| [design-skills](plugins/design-skills) | Copied here | `apple-design` ([Emil Kowalski](https://github.com/emilkowalski/skills)): Apple-style motion, gestures and materials on the web. `hallmark` ([Nutlope](https://github.com/nutlope/hallmark)): pages that don't look AI-generated, with `audit`, `redesign` and `study`. |
| [po-skills](plugins/po-skills) | Copied and adapted | `brainstorming` and `writing-plans` from [obra/superpowers](https://github.com/obra/superpowers): idea to approved design, design to step-by-step plan. Without the rest of Superpowers or its start-of-session hook. |
| ponytail | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Lazy senior dev mode: the simplest code that works. YAGNI, stdlib first, no unrequested abstractions. Commands `/ponytail-audit`, `/ponytail-review` and more. |

`design-skills` is copied into this repo; refresh it with [scripts/sync-vendor.sh](scripts/sync-vendor.sh). `po-skills` is edited by hand, see [its README](plugins/po-skills/README.md). `ponytail` is listed in our marketplace but installs straight from its own repo, so it always gets upstream updates.

### PM skills by Dean Peters

From [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills), installed from its own marketplace (`pm-skills`). It has 77 skills; [setup.sh](setup.sh) installs only these 12, so Claude does not have 77 descriptions to choose from on every request:

| Area | Skills |
| :- | :- |
| Backlog | `user-story`, `user-story-splitting`, `epic-breakdown-advisor`, `epic-hypothesis` |
| Spec and planning | `prd-development`, `prioritization-advisor`, `roadmap-planning` |
| Discovery | `discovery-process`, `jobs-to-be-done`, `problem-statement` |
| Stakeholders | `incoming-request-advisor`, `stakeholder-mapping` |

Add another with `claude plugin install <skill>@pm-skills`. They are CC BY-NC-SA 4.0: fine to use at work, not to resell, so we don't copy them into this repo.

## Built-in mods we turn on

| Mod | What it does |
| :- | :- |
| `cc-plugin-you-should-know` | A side agent that reads what Claude writes and shows a note above the prompt when it spots something you might miss, such as a retry that could charge a customer twice. Off by default, it uses a bit more of the plan, and it stays quiet on a strong model unless it finds something. |

It ships inside Claude Code, so there is nothing to copy here: [setup.sh](setup.sh) just switches it on.

## Install

One step, from a clone of this repo:

```bash
./setup.sh
```

Or by hand:

```bash
claude plugin marketplace add <owner>/lippstack
claude plugin install savvy-progress@lippstack
claude plugin install stage-bar@lippstack
claude plugin install design-skills@lippstack
claude plugin install po-skills@lippstack
claude plugin install ponytail@lippstack
```

Then restart Claude Code, or run `/reload-plugins` in an open session.

## Credits

`savvy-progress` is a fork of [johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit/tree/main/plugins/savvy-progress), MIT licensed. Its original license is kept in [plugins/savvy-progress/LICENSE](plugins/savvy-progress/LICENSE).

`apple-design` (Emil Kowalski) and `hallmark` (Hallmark contributors) are MIT licensed; their licenses sit in each skill folder. `brainstorming` and `writing-plans` come from Superpowers (Jesse Vincent, MIT); the license sits in each skill folder. `ponytail` (Dietrich Gebert, MIT) is not copied here. The PM skills (Dean Peters, CC BY-NC-SA 4.0) are not copied here either.
