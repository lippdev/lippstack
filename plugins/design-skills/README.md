# design-skills

Third-party design skills, copied here so they install with the rest of lippstack.

| Skill | Source | What it does |
| :- | :- | :- |
| `apple-design` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) @ `2d22863` | Apple's approach to interface design and physical motion, for the web: springs, gestures, sheets, materials, type. |
| `review-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/review-animations) @ `2d22863` | Reviews motion code against a high bar. Flags by default; approval is earned. |
| `break-ui` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/break-ui) @ `2d22863` | Feeds a component worst-case data (long names, empty lists, huge numbers, emoji) behind a toggle and reports what broke, with fixes. |
| `prototype` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/prototype) @ `2d22863` | Builds several genuinely different versions of a UI piece behind a live picker so you choose one. Only runs when called by name. |
| `animation-performance` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/animation-performance) @ `2d22863` | Finds why an animation drops frames and fixes it: composite-only properties, CSS vs WAAPI vs rAF, Framer Motion's accelerated path, React re-renders per frame, `will-change`. |
| `hallmark` | [nutlope/hallmark](https://github.com/nutlope/hallmark) @ `7ec8682` (2.0.0) | Pushes generated pages away from the generic AI look: a fixed floor of rules, a dealt theme, and a lint script (`sloplint`, needs Node) that must pass before it hands back. Builds from the real product when it can capture it. Verbs `audit` and `redesign`. |

## Install

```
/plugin install design-skills --marketplace lippdev/lippstack
```

`hallmark` generates images only if you set `TOGETHER_API_KEY`; without it, it uses stand-ins. All are MIT licensed; each skill folder keeps its original `LICENSE`.

To pull the latest upstream versions, run `scripts/sync-vendor.sh` from the repo root and bump `version` in `.claude-plugin/plugin.json`.
