# design-skills

Third-party design skills, copied here so they install with the rest of lippstack.

| Skill | Source | What it does |
| :- | :- | :- |
| `apple-design` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) @ `e8a175d` | Apple's approach to interface design and physical motion, for the web: springs, gestures, sheets, materials, type. |
| `review-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/review-animations) @ `e8a175d` | Reviews motion code against a high bar. Flags by default; approval is earned. |
| `break-ui` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/break-ui) @ `e8a175d` | Feeds a component worst-case data (long names, empty lists, huge numbers, emoji) behind a toggle and reports what broke, with fixes. |
| `prototype` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/prototype) @ `e8a175d` | Builds several genuinely different versions of a UI piece behind a live picker so you choose one. Only runs when called by name. |
| `hallmark` | [nutlope/hallmark](https://github.com/nutlope/hallmark) @ `13ac0ec` | Pushes generated pages away from the generic AI look. Also has `audit`, `redesign` and `study` verbs. |

## Install

```
/plugin install design-skills --marketplace lippdev/lippstack
```

All are MIT licensed; each skill folder keeps its original `LICENSE`.

To pull the latest upstream versions, run `scripts/sync-vendor.sh` from the repo root and bump `version` in `.claude-plugin/plugin.json`.
