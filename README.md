# lippstack

[![CI](https://github.com/lippdev/lippstack/actions/workflows/ci.yml/badge.svg)](https://github.com/lippdev/lippstack/actions/workflows/ci.yml)

Mods and skills for Claude Code, tuned to how we work. The skills also run in Codex, Gemini CLI, Kimi, OpenCode, Cursor and other agents: see [Other agents](#other-agents-codex-gemini-cli-kimi-opencode-cursor).

By [Filipe Moreira](https://filipemoreira.top).

## Plugins

| Plugin | Type | What it does |
| :- | :- | :- |
| [savvy-progress](plugins/savvy-progress) | Mod | `/agents-info` opens a live panel of subagents with model, context, tokens and time, plus the account's plan quota (5-hour and weekly). Each tier gets its own pixel Clawd costume. |
| [stage-bar](plugins/stage-bar) | Mod | An animated bar above the prompt that tracks the stages of your task, one color per stage. Claude names the stages and moves the bar as it works. Try `/stages-demo`. |
| [done-ping](plugins/done-ping) | Mod | A notification when a task of a minute or more finishes, or when Claude is waiting for a permission or your answer (macOS Notification Center / Linux & Windows terminal notification channel). |
| [guardrails](plugins/guardrails) | Mod | Hooks, not requests: `/careful` (on by default) asks you before `rm -r`, `git reset --hard`, force-push, `DROP TABLE` and the like run; `/freeze <path>` refuses edits outside a folder. Works in bypass mode too. |
| [where-line](plugins/where-line) | Mod | A status line under the prompt: project, git branch, model and how full the context is (🟢 🟡 🔴). |

## Skills

| Plugin | Source | What it does |
| :- | :- | :- |
| [design-skills](plugins/design-skills) | Copied here | From [Emil Kowalski](https://github.com/emilkowalski/skills): `apple-design` (Apple-style motion, gestures and materials on the web), `review-animations`, `break-ui` (worst-case data) and `prototype` (several versions behind a picker). `hallmark` ([Nutlope](https://github.com/nutlope/hallmark), 2.0): pages that don't look AI-generated, with `audit` and `redesign`. |
| [po-skills](plugins/po-skills) | Ours, plus two adapted | `jira-stories` and `release-notes` (ours): stories into Jira, finished work into release notes on Confluence. `brainstorming` (enriched with YC forcing questions) and `writing-plans` (with Decision Briefs and Ponytail debt tracking) from [obra/superpowers](https://github.com/obra/superpowers). |
| [eng-skills](plugins/eng-skills) | Ours | Engineering, QA & delivery: `investigate` (systematic root cause debugging with the 3-strike rule), `qa` (exploratory verification across UI/API/CLI with mandatory regression tests), and `ship` (pre-flight checks, doc sync, PR). `freeze` and `careful` live in the guardrails mod. |
| ponytail | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Lazy senior dev mode: the simplest code that works. YAGNI, stdlib first, no unrequested abstractions. Commands `/ponytail-audit`, `/ponytail-review` and more. |
| humanizer | [blader/humanizer](https://github.com/blader/humanizer) | Rewrites AI-sounding text so it reads like the writer, without changing what it says. Based on Wikipedia's "Signs of AI writing". |
| video-editor-skills (opt-in) | [appariciojunior/video-editor-skills](https://github.com/appariciojunior/video-editor-skills) | Claude as a first-pass video editor in DaVinci Resolve Studio: cuts retakes and dead air from the transcript, keeps B-roll, scores, captions, motion graphics, YouTube export. Needs Resolve Studio, ffmpeg, Python and a speech-to-text API. **CC BY-NC 4.0: no commercial use.** |

`design-skills` is copied into this repo; refresh it with [scripts/sync-vendor.sh](scripts/sync-vendor.sh). `po-skills` and `eng-skills` are maintained in this repo. `ponytail`, `humanizer` and `video-editor-skills` are listed in our marketplace but install straight from their own repos, so they always get upstream updates. `video-editor-skills` is not copied here on purpose: its CC BY-NC 4.0 license does not match this repo's MIT, and it is only useful if you edit video in Resolve. So `setup.sh` and `setup.ps1` do not install it; add it when you want it.

### PM skills by Dean Peters

From [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills), installed from its own marketplace (`pm-skills`). It has 77 skills; [setup.sh](setup.sh) installs only these 12, so Claude does not have 77 descriptions to choose from on every request:

| Area | Skills |
| :- | :- |
| Backlog | `user-story`, `user-story-splitting`, `epic-breakdown-advisor`, `epic-hypothesis` |
| Spec and planning | `prd-development`, `prioritization-advisor`, `roadmap-planning` |
| Discovery | `discovery-process`, `jobs-to-be-done`, `problem-statement` |
| Stakeholders | `incoming-request-advisor`, `stakeholder-mapping` |

Add another with `claude plugin install <skill>@pm-skills`. They are CC BY-NC-SA 4.0: fine to use at work, not to resell, so we don't copy them into this repo.

### Official Anthropic plugins

From [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official), installed by [setup.sh](setup.sh):

| Plugin | What it does |
| :- | :- |
| `hookify` | Rules that warn or block, written in plain words: `/hookify Warn me before any rm -rf`. `/hookify` alone looks at the conversation for things you corrected. `/hookify:list` shows the rules |
| `claude-md-management` | Audits a project's `CLAUDE.md` and, with `/revise-claude-md`, adds what this session learned |
| `session-report` | An HTML report of where the tokens went: cache use, subagents, skills and the most expensive prompts |
| `playwright` | Lets Claude open a browser, click through a page, fill forms and take screenshots, to check what it built |

## Built-in mods we turn on

| Mod | What it does |
| :- | :- |
| `cc-plugin-you-should-know` | A side agent that reads what Claude writes and shows a note above the prompt when it spots something you might miss, such as a retry that could charge a customer twice. Off by default, it uses a bit more of the plan, and it stays quiet on a strong model unless it finds something. |

It ships inside Claude Code, so there is nothing to copy here: [setup.sh](setup.sh) / [setup.ps1](setup.ps1) just switches it on.

## Install

From a clone of this repo:

### macOS / Linux

```bash
./setup.sh
```

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

The `-ExecutionPolicy Bypass` applies only to this run; Windows blocks unsigned scripts by default.

### Or by hand

```bash
claude plugin marketplace add lippdev/lippstack
claude plugin install savvy-progress@lippstack
claude plugin install stage-bar@lippstack
claude plugin install done-ping@lippstack
claude plugin install where-line@lippstack
claude plugin install guardrails@lippstack
claude plugin install design-skills@lippstack
claude plugin install po-skills@lippstack
claude plugin install eng-skills@lippstack
claude plugin install ponytail@lippstack
claude plugin install humanizer@lippstack
claude plugin install video-editor-skills@lippstack   # optional: DaVinci Resolve video editing, non-commercial license
```

Then restart Claude Code, or run `/reload-plugins` in an open session.

### Other agents (Codex, Gemini CLI, Kimi, OpenCode, Cursor…)

The skills follow the open [Agent Skills](https://agentskills.io) format, so any agent that reads `SKILL.md` can use them. The mods can't: they run on Claude Code's own hooks.

| | Claude Code | Other agents |
| :- | :- | :- |
| Skills: `design-skills`, `po-skills`, `eng-skills`, ponytail, humanizer, PM skills | ✅ | ✅ |
| Mods: `savvy-progress`, `stage-bar`, `done-ping`, `where-line`, `guardrails` | ✅ | ❌ |
| Official Anthropic plugins, `cc-plugin-you-should-know` | ✅ | ❌ |

From a clone, add `--agents` with the agent ids. Claude Code is installed too when its CLI is present, and skipped when it isn't:

```bash
./setup.sh --agents codex,gemini-cli,kimi-code-cli
```

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1 -Agents codex,gemini-cli,kimi-code-cli
```

Or without a clone, with the [skills CLI](https://github.com/vercel-labs/skills) (needs Node.js):

```bash
npx skills add lippdev/lippstack -g                       # pick agents and skills interactively
npx skills add lippdev/lippstack -g -a codex -a opencode --skill '*' -y
npx skills add DietrichGebert/ponytail -g --skill '*'
npx skills add blader/humanizer -g --skill '*'
npx skills add appariciojunior/video-editor-skills -g --skill '*'   # optional
npx skills add deanpeters/Product-Manager-Skills -g -s user-story -s prd-development   # pick the PM skills you want
```

Common ids: `codex`, `gemini-cli`, `kimi-code-cli`, `opencode`, `cursor`, `github-copilot`, `windsurf`, `antigravity`; `'*'` targets every agent the CLI knows. A few things differ outside Claude Code: `/skill-name` may be spelled differently (Kimi uses `/skill:name`), skills that offer subagents fall back to doing the work in a fresh pass, and `jira-stories` / `release-notes` need an Atlassian MCP server in that agent.

## How to use

Skills load on their own when a request matches their description. To make sure one runs, name it in the request ("use user-story to…") or type `/` and pick it from the list; plugin skills show up as `plugin:skill`, for example `/po-skills:brainstorming` or `/eng-skills:investigate`.

### From idea to shipped feature

The skills are meant to be used in this order. Skip the steps a small task doesn't need: a one-line fix goes straight to step 7.

| Step | Use | Ask something like | You get |
| :- | :- | :- | :- |
| 1. Understand the ask | `incoming-request-advisor` | "A director sent this: … What are they really asking for?" | The literal ask separated from the job behind it, and the questions to send back |
| 2. Frame the problem | `problem-statement`, `jobs-to-be-done`, `discovery-process` | "Write a problem statement for investors who can't find their portfolio report" | Who has the problem, what it costs them, how you'd know it's solved |
| 3. Decide what to build | `prd-development`, `prioritization-advisor`, `roadmap-planning` | "Turn this into a PRD" / "Help me prioritize these 8 items for Q1" | A PRD with success criteria; a framework picked for your context and a ranked list |
| 4. Shape the work | `epic-hypothesis`, `epic-breakdown-advisor`, `jira-stories` | "Break epic INV-120 into stories and create them in Jira" | Stories with Gherkin criteria in the team's style, created under the epic after you approve |
| 5. Design the build | `brainstorming` | "Let's build an export-to-PDF button for the report" | Questions one at a time with YC forcing perspectives (10-star, narrowest wedge, elimination), a size for the work, and a design doc in `docs/specs/` |
| 6. Plan the build | `writing-plans` | "Write the plan for the approved design" | Small tasks with files, names and tests in `docs/plans/`, plus Decision Briefs and Ponytail `shortcut:` debt tags |
| 7. Build it | `ponytail` (always on), `/freeze`, `investigate` | "Run the plan" / "investigate why the worker crashes" | Smallest code that does the job. When debugging: Iron Law (root cause first, 3-strike rule) and scope freezing |
| 8. Verify it | `qa`, `/ponytail-review`, `hallmark audit`, `break-ui` | "QA this new endpoint" / "break the portfolio card" / "/ponytail-review" | Adversarial exploration beyond happy path; mandatory automated regression tests for any bug found; visual & code reviews |
| 9. Ship it | `ship` | "Ship this feature" | Pre-flight git cleanliness, full test pass, Diataxis doc synchronization, atomic commit, push and PR |
| 10. Tell people | `release-notes`, `humanizer` | "Release notes for sprint 42 of INV" / "humanize the PR description" | A team version and a business version, published to Confluence after you approve; then text that doesn't read as AI-written |

### Product (PM skills)

- Give context in the first message, such as product, user, constraint and deadline; the skills skip the questions you already answered.
- Most of them run as a short interview when you arrive with nothing ("use prd-development") and as a straight draft when you paste material ("use prd-development on these meeting notes: …").
- `stakeholder-mapping` before a big alignment meeting: list the people and it ranks who to talk to first and how.
- The other 65 skills in the library (pricing, TAM/SAM/SOM, positioning, SWOT, end-of-life…) are one install away: `claude plugin install <skill>@pm-skills`. The full list is in [their README](https://github.com/deanpeters/Product-Manager-Skills#readme).

### Jira and Confluence

Both need the Atlassian connector, and both show you the result before touching Jira or Confluence.

- `jira-stories` reads a few recent stories in the project first and copies their language, title style and labels. Give it an epic key, a PRD or a paragraph. It checks for duplicates under the epic and never fills in estimates or assignees on its own.
- `release-notes` takes a sprint, a fix version or dates. It lists what it left out (sub-tasks, spikes, tech debt) so you can pull an item back in, and can save the Confluence page as a draft.

### Brainstorming and plans

- `brainstorming` asks one question at a time. It uses YC-style forcing questions to uncover the **10-star vision**, the **narrowest wedge** (minimum slice of value), and what can be **eliminated** completely.
- It reads the project before its first question. Before it writes anything, it lays out two or three ways to build it, with the trade-offs and a recommendation, and you pick one.
- It then sizes the work: a quick task is just done, a small change gets a short design doc, and a project gets the full one in `docs/specs/`. Both record the approaches considered and the one you chose.
- For anything visual it can open a local page (`localhost`) with mockups side by side.
- `writing-plans` produces bite-sized, testable tasks in `docs/plans/`. If architectural trade-offs or intentional shortcuts are taken, it frames a Decision Brief and marks the code with `shortcut: <reason>`, connecting straight into `ponytail-debt`.
- At the end it asks how to run the plan: **subagent-driven** (one fresh agent per task plus review) or **native** (this session does it, review at the end).

### Engineering, QA and Delivery (`eng-skills`)

Professional development practices built directly into the agent workflow:

| Command / Skill | Methodology |
| :- | :- |
| `investigate` | **The Iron Law of Debugging**: No fixes without proven root cause. Traces data flow backward. Enforces the **3-strike rule**: if 3 fix attempts fail, the agent hard-stops, admits the mental model was incomplete, and asks for guidance instead of thrashing. |
| `qa` | **Exploratory Verification**: Systematically tests beyond the happy path (empty values, hostile inputs, duplicate clicks, interruptions). Enforces the **Golden Regression Rule**: every bug found must have an automated test that fails before the fix and passes after. |
| `ship` | **Pre-flight & Delivery** (only when you call `/ship`): Synchronizes base branch, runs tests and typechecks, performs a Diataxis documentation sanity check (ensuring README/specs/docs match code changes), creates an atomic commit and opens a PR. |

`/freeze <path>` and `/careful` come from the `guardrails` mod: hooks enforce them, so they hold even in bypass mode.

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

### Humanizer

Takes text an AI wrote and rewrites it so it reads like a person wrote it, keeping the meaning. It is built on Wikipedia's "Signs of AI writing" and checks for 26 patterns. The five strongest: "not X but Y", one-line closers ("Let that sink in."), sayings that sound deep, a staged run-up ("Here's the thing."), and arguing with no one. It edits for human readers. It is not a way to beat AI detectors, and the author says detectors still flag most of its output.

In Claude Code it answers to `/humanizer:humanizer`; other agents use `/humanizer`. You can also just ask in plain language.

| Say or type | What happens |
| :- | :- |
| `/humanizer:humanizer` and paste text | Rewrites the text and keeps what it says. Doesn't invent facts |
| "Humanize the prose in docs/launch-post.md" | Rewrites a file's prose |
| Add a sample of your own writing | The rewrite follows your voice instead of a generic one |

Where it fits in the workflow:

- **Step 10, tell people.** Run it on the team and business versions of the release notes, and on the PR description `ship` writes, before you publish.
- **Steps 3 to 6, documents.** PRDs, problem statements and design docs written by an agent pick up the same tics. One pass before you share them with people outside the session.
- **Messages and posts.** Emails to stakeholders, announcements, LinkedIn, README intros: anything with your name on it.
- **Don't run it on code, specs or plans** that an agent will read next. They need precision, not a voice.

It only edits text you point it at. Nothing runs by itself.

### Video (optional)

`video-editor-skills` is not installed by `setup.sh`. Install it with `claude plugin install video-editor-skills@lippstack` when you want it.

You film and decide the taste; Claude does the first pass in DaVinci Resolve Studio. Raw footage is never modified, and Resolve only gets new timelines and clips. It needs Resolve Studio, ffmpeg, Python 3.9+ and a speech-to-text API with word timestamps.

| Say | What happens |
| :- | :- |
| "Set up my video editor" | `video-editor-setup`: workspace folders, keys kept out of the chat, your Resolve template, the small scripts to build first |
| "Edit the new video" | `edit-video`: transcribes `raw video/`, cuts retakes and dead air with vlog pacing, keeps B-roll, builds the timeline in Resolve |
| "Add captions" / "graphics" / "music" | `captions`, `motion-overlays` (Remotion, optional Figma) and `music-and-sound` (Epidemic Sound MCP, optional) |
| "Export for YouTube" | `youtube-export`: Deliver settings for good quality without huge files |

It fits the workflow beside step 10: use it for the video that goes with a release (demo, class, vlog), then run `humanizer` on the title, description and captions text. The license is CC BY-NC 4.0, so keep it out of anything you sell.

### Design

| Ask | What happens |
| :- | :- |
| "Build a landing page for …" | `hallmark` asks once about material, audience, use and tone, deals a theme and a page structure that isn't the usual hero → 3 cards → CTA, and runs its lint (`sloplint`, needs Node) until clean before handing it over. Given a URL or a running app, it screenshots the real product instead of mocking it |
| `hallmark audit <file or folder>` | A ranked list of what looks generated. Edits nothing |
| `hallmark redesign <target>` | New visual layer, same routes, copy and brand. Asks before deleting anything |
| "Lock the system" (after a hallmark build) | Saves the design as a `design.md`; later pages reuse it |
| "Make this sheet feel like iOS" | `apple-design`: springs, gestures, interruptible transitions, materials, reduced motion |
| "Review the animations here" | `review-animations`: a strict review of the motion code |
| "Break the portfolio card" | `break-ui`: renders the component with worst-case data (long names, empty lists, huge numbers) behind a toggle and lists what broke |
| "Use prototype for a hold-to-delete button" | `prototype`: several genuinely different versions behind a picker. Runs only when named |

### Mods

- `/agents-info` opens or closes the panel of subagents and plan quota.
- The stage bar appears by itself on tasks with 3 or more steps. `/stages-demo` shows it.
- `done-ping` needs nothing: walk away during a long task and you get a notification when it's done or stuck on a question. Change the threshold and sound in `/config`. On macOS the first one may ask for permission; on Linux and Windows it depends on the terminal supporting notifications.
- `guardrails` asks before a destructive command runs; `/careful off` silences it for the session. `/freeze src/auth` keeps edits inside that folder until `/freeze off`.
- `where-line` sits under the prompt. When the dot turns 🔴, finish up or start a new session before the context compacts.
- `/hookify` when Claude keeps doing something you don't want; `session-report` when you want to know where the plan went.

## Credits

`savvy-progress` is a fork of [johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit/tree/main/plugins/savvy-progress), MIT licensed. Its original license is kept in [plugins/savvy-progress/LICENSE](plugins/savvy-progress/LICENSE).
