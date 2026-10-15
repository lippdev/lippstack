# po-skills

Skills for the product side of the work: from idea to spec to plan.

| Skill | What it does |
| :- | :- |
| `brainstorming` | Asks questions one at a time until the idea is clear, with YC-style forcing questions (10-star vision, narrowest wedge, desperate specificity), sizes the work, and writes a design document for approval. Can open a local visual companion (on `localhost`) to compare mockups. |
| `writing-plans` | Turns an approved design into a plan of small tasks, each with files, names and tests, plus Decision Briefs and `shortcut:` debt tags that link to `ponytail-debt`, saved to `docs/plans/`. |
| `jira-stories` | Writes stories with Gherkin acceptance criteria from an epic, PRD or idea, in the project's own style, and creates them in Jira under the epic once you approve. |
| `release-notes` | Reads the Jira issues finished in a sprint, version or date range and writes two versions (team and business), then publishes to Confluence once you approve. |

`jira-stories` and `release-notes` need the Atlassian connector. They never create or publish anything before you say yes.

## Install

```
/plugin install po-skills --marketplace lippdev/lippstack
```

## Where they come from

`jira-stories` and `release-notes` are ours. `brainstorming` and `writing-plans` are adapted from [obra/superpowers](https://github.com/obra/superpowers) @ `bb92a77` (MIT, Jesse Vincent; the license sits in each skill folder), enriched with YC forcing questions and Ponytail debt integration. We left out the rest of Superpowers on purpose, including its start-of-session hook that makes Claude load a skill before every answer.

Because the rest is gone, these copies are edited:

- They point to each other as `po-skills:` instead of `superpowers:`.
- Specs go to `docs/specs/` and plans to `docs/plans/`.
- The worktree note is removed, and the end of `writing-plans` describes the two ways to run the plan (subagent-driven or in this session) inline instead of calling `subagent-driven-development` and `executing-plans`.
- `brainstorming` includes YC forcing questions (10-star, narrowest wedge, desperate specificity, elimination).
- `writing-plans` formats Decision Briefs and annotates intentional shortcuts with `shortcut:` comments for `ponytail-debt`.

So `scripts/sync-vendor.sh` does not touch them. To take a newer upstream version, copy it by hand and redo the edits above.
