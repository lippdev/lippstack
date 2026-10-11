# where-line

A status line under the prompt:

```
lippstack  ·  ⎇ main  ·  Opus 5.5  ·  🟢 ctx 42%
```

- **Project:** the folder the session started in.
- **Branch:** the current git branch, refreshed after each turn. Hidden outside a repo.
- **Model:** as `/model` shows it, refreshed after each turn.
- **Context:** how full the context window is. 🟢 under 60%, 🟡 from 60%, 🔴 from 80%: time to wrap up or start a new session before it compacts.

It sits beside Claude Code's own status line (the `statusLine` setting) and does not replace it.

## Install

```
/plugin install where-line --marketplace <owner>/lippstack
```
