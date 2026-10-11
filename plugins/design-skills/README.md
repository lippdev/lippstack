# design-skills

Third-party design skills, copied here so they install with the rest of lippstack.

| Skill | Source | What it does |
| :- | :- | :- |
| `apple-design` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) @ `e8a175d` | Apple's approach to interface design and physical motion, for the web: springs, gestures, sheets, materials, type. |
| `hallmark` | [nutlope/hallmark](https://github.com/nutlope/hallmark) @ `13ac0ec` | Pushes generated pages away from the generic AI look. Also has `audit`, `redesign` and `study` verbs. |

## Install

```
/plugin install design-skills --marketplace <owner>/lippstack
```

Both are MIT licensed; each skill folder keeps its original `LICENSE`.

To pull the latest upstream versions, run `scripts/sync-vendor.sh` from the repo root and bump `version` in `.claude-plugin/plugin.json`.
