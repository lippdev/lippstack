# cloud-rain

A theme for the Claude desktop and mobile apps. Behind the chat is a pixel-art night sky of clouds, a faint grid of digits over it, and slow drops of digits falling on top. Messages sit in dark, see-through boxes so the sky shows behind them.

It is a port of the [Cloud Rain theme for T3 Code](https://github.com/lippdev/lipp-t3-theme).

## Versions

- **Black** (default): black and gray interface, gray sky.
- **Navy**: the original, in midnight blue.

```
/cloud-rain black
/cloud-rain navy
/cloud-rain          switches between the two
```

`preto` and `azul` work too. The choice is kept across sessions.

## Notes

- Dark only.
- The terminal and editors draw no themes; this one shows in the desktop and mobile apps.
- Panels have no blur, so the sky stays sharp behind them.
- With reduce motion on, the rain stops.
- There is an optional soft rain sound and a quiet chime when Claude finishes. Press the speaker in the session's title bar to hear it.

## How the sky is made

Themes take vector art only, so the clouds and rain are SVG. `tools/scene.py` reads `assets/clouds.png` from the T3 theme repo, turns each pixel row into paths, draws the rain with the same seed as the T3 version, and writes `hooks/scenes.ts`:

```bash
python3 tools/scene.py path/to/lipp-t3-theme hooks/scenes.ts
```

Each scene must stay under 131,072 characters; the script stops if one doesn't.

## Install

```
/plugin install cloud-rain --marketplace lippdev/lippstack
```
