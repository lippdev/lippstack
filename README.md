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
| superpowers | [obra/superpowers](https://github.com/obra/superpowers) | Brainstorming, written plans, TDD, systematic debugging, code review, worktrees, subagent-driven work. |
| ponytail | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Lazy senior dev mode: the simplest code that works. YAGNI, stdlib first, no unrequested abstractions. Commands `/ponytail-audit`, `/ponytail-review` and more. |

`design-skills` is copied into this repo; refresh it with [scripts/sync-vendor.sh](scripts/sync-vendor.sh). `superpowers` and `ponytail` are listed in our marketplace but install straight from their own repos, so they always get upstream updates.

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
claude plugin install superpowers@lippstack
claude plugin install ponytail@lippstack
```

Then restart Claude Code, or run `/reload-plugins` in an open session.

## Credits

`savvy-progress` is a fork of [johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit/tree/main/plugins/savvy-progress), MIT licensed. Its original license is kept in [plugins/savvy-progress/LICENSE](plugins/savvy-progress/LICENSE).

`apple-design` (Emil Kowalski) and `hallmark` (Hallmark contributors) are MIT licensed; their licenses sit in each skill folder. `superpowers` (Jesse Vincent) and `ponytail` (Dietrich Gebert) are MIT and are not copied here.
