# eng-skills

Engineering, QA, and delivery skills for lippstack: from debugging to verification and shipping.

| Skill | What it does |
| :- | :- |
| `investigate` | Systematic root-cause debugging. Enforces the Iron Law (no code edits without verified root cause) and the 3-strike rule to stop thrashing. |
| `qa` | Exploratory verification for Web UI, APIs, CLIs, and workers. Enforces the Golden Regression Rule: every discovered bug gets an automated regression test that fails before the fix and passes after. |
| `ship` | Pre-flight release checklist: git status check, full test suite pass, Diataxis documentation sanity check, atomic commit, and PR creation. |

`freeze` and `careful` moved to the [guardrails](../guardrails) mod, where hooks enforce them.

## Install

```
/plugin install eng-skills --marketplace lippdev/lippstack
```
