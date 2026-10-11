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

## How to use

Skills load on their own when a request matches their description. To make sure one runs, name it in the request ("use user-story to…") or type `/` and pick it from the list; plugin skills show up as `plugin:skill`, for example `/po-skills:brainstorming`.

### From idea to shipped feature

The skills are meant to be used in this order. Skip the steps a small task doesn't need: a one-line fix goes straight to step 5.

| Step | Use | Ask something like | You get |
| :- | :- | :- | :- |
| 1. Understand the ask | `incoming-request-advisor` | "A director sent this: … What are they really asking for?" | The literal ask separated from the job behind it, and the questions to send back |
| 2. Frame the problem | `problem-statement`, `jobs-to-be-done`, `discovery-process` | "Write a problem statement for investors who can't find their portfolio report" | Who has the problem, what it costs them, how you'd know it's solved |
| 3. Decide what to build | `prd-development`, `prioritization-advisor`, `roadmap-planning` | "Turn this into a PRD" / "Help me prioritize these 8 items for Q1" | A PRD with success criteria; a framework picked for your context and a ranked list |
| 4. Shape the work | `epic-hypothesis`, `epic-breakdown-advisor`, `user-story`, `user-story-splitting` | "Break this epic into stories with Gherkin acceptance criteria" | Stories small enough for a sprint, each with testable criteria |
| 5. Design the build | `brainstorming` | "Let's build an export-to-PDF button for the report" | Questions one at a time, a size for the work, and a design doc in `docs/specs/` for approval |
| 6. Plan the build | `writing-plans` | "Write the plan for the approved design" | Small tasks with files, names and tests, in `docs/plans/`, and a choice of how to run them |
| 7. Build it | `ponytail` (always on) | "Run the plan" | The smallest code that does the job, and a closing line on what was skipped and the risk |
| 8. Check it | `/ponytail-review`, `hallmark audit` | "/ponytail-review" / "hallmark audit src/pages/home" | A ranked list of problems, nothing edited |

### Product (PM skills)

- Give context in the first message, such as product, user, constraint and deadline; the skills skip the questions you already answered.
- Most of them run as a short interview when you arrive with nothing ("use prd-development") and as a straight draft when you paste material ("use prd-development on these meeting notes: …").
- `stakeholder-mapping` before a big alignment meeting: list the people and it ranks who to talk to first and how.
- The other 65 skills in the library (pricing, TAM/SAM/SOM, positioning, SWOT, end-of-life…) are one install away: `claude plugin install <skill>@pm-skills`. The full list is in [their README](https://github.com/deanpeters/Product-Manager-Skills#readme).

### Brainstorming and plans

- `brainstorming` asks one question at a time. Answer briefly; say "skip the questions" to go straight to a draft.
- It sizes the work first: a quick task is just done, a small one is agreed in chat, and only a project gets a written design.
- For anything visual it can open a local page (`localhost`) with mockups side by side. It asks first.
- `writing-plans` ends by asking how to run the plan: **subagent-driven** (one fresh agent per task plus a review after each, slower and more thorough) or **native** (this session does it, one review at the end, faster and cheaper).

### Ponytail

On by default in every session, at the `full` level.

| Say or type | What happens |
| :- | :- |
| `/ponytail lite` | Builds what you asked, and names the smaller option in one line |
| `/ponytail full` | The default: smallest complete change |
| `/ponytail ultra` | Also pushes back on parts of the request the need doesn't justify, before building |
| "stop ponytail" / "normal mode" | Turns it off for the session |
| `/ponytail-review` | Reviews the current change: logic, safety, load, tests, lines that aren't needed |
| `/ponytail-audit` | The same review over the whole repo, ranked |
| `/ponytail-debt` | Lists every `shortcut:` comment it left, as a debt ledger |
| `/ponytail-gain`, `/ponytail-help` | Benchmark numbers; quick reference |

### Design

| Ask | What happens |
| :- | :- |
| "Build a landing page for …" | `hallmark` picks a theme and a page structure that isn't the usual hero → 3 cards → CTA, and scores the result before handing it over |
| `hallmark audit <file or folder>` | A ranked list of what looks generated. Edits nothing |
| `hallmark redesign <target>` | New visual layer, same routes, copy and brand. Asks before deleting anything |
| `hallmark study <URL or screenshot>` | Pulls out the structure, type and colors of a design you like; can save them as a `design.md` |
| "Make this sheet feel like iOS" / "review the animations here" | `apple-design`: springs, gestures, interruptible transitions, materials, reduced motion |

### Mods

- `/agents-info` opens or closes the panel of subagents and plan quota.
- The stage bar appears by itself on tasks with 3 or more steps. `/stages-demo` shows it.

## Credits

`savvy-progress` is a fork of [johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit/tree/main/plugins/savvy-progress), MIT licensed. Its original license is kept in [plugins/savvy-progress/LICENSE](plugins/savvy-progress/LICENSE).

`apple-design` (Emil Kowalski) and `hallmark` (Hallmark contributors) are MIT licensed; their licenses sit in each skill folder. `brainstorming` and `writing-plans` come from Superpowers (Jesse Vincent, MIT); the license sits in each skill folder. `ponytail` (Dietrich Gebert, MIT) is not copied here. The PM skills (Dean Peters, CC BY-NC-SA 4.0) are not copied here either.
