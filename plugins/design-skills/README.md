# design-skills

Third-party design skills, copied here so they install with the rest of lippstack.

| Skill | Source | What it does |
| :- | :- | :- |
| `apple-design` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) @ `715c180` | Apple's approach to interface design and physical motion, for the web: springs, gestures, sheets, materials, type. |
| `review-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/review-animations) @ `715c180` | Reviews motion code against a high bar. Flags by default; approval is earned. |
| `break-ui` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/break-ui) @ `715c180` | Feeds a component worst-case data (long names, empty lists, huge numbers, emoji) behind a toggle and reports what broke, with fixes. |
| `prototype` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/prototype) @ `715c180` | Builds several genuinely different versions of a UI piece behind a live picker so you choose one. Only runs when called by name. |
| `animation-performance` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/animation-performance) @ `715c180` | Finds why an animation drops frames and fixes it: composite-only properties, CSS vs WAAPI vs rAF, Framer Motion's accelerated path, React re-renders per frame, `will-change`. |
| `animate` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/animate) @ `715c180` | Builds one animation in the order that decides whether it feels right: should it move at all, purpose, easing, duration, origin. The other motion skills hand easing and timing to it. |
| `choreograph` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/choreograph) @ `715c180` | Coordinates several elements moving together: order, overlap, stagger and what stays still, so a group reads as one motion. |
| `gestures` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/gestures) @ `715c180` | Drag, swipe and sheet interactions that follow the finger 1:1 and can be caught mid-animation. Points to Vaul for drawers. |
| `remove-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/remove-animations) @ `715c180` | Finds motion the interface doesn't need (keyboard actions, high-frequency surfaces, decoration) and deletes it. Only subtracts. |
| `hallmark` | [nutlope/hallmark](https://github.com/nutlope/hallmark) @ `407fa68` (2.0.0) | Pushes generated pages away from the generic AI look: a fixed floor of rules, a dealt theme, and a lint script (`sloplint`, needs Node) that must pass before it hands back. Builds from the real product when it can capture it. Verbs `audit` and `redesign`. |

## Install

```
/plugin install design-skills --marketplace lippdev/lippstack
```

`hallmark` generates images only if you set `TOGETHER_API_KEY`; without it, it uses stand-ins. All are MIT licensed; each skill folder keeps its original `LICENSE`.

To pull the latest upstream versions, run `scripts/sync-vendor.sh` from the repo root. It updates the commits in the table above; then bump `version` in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.

`remove-animations` mentions `improve-animations` and `find-animation-opportunities`, and `gestures` mentions `pick-ui-library`. Those are not copied here; the skills work without them.
