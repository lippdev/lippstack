# guardrails

Guardrails enforced by hooks, not by asking Claude nicely. Both work in every permission mode, bypass included.

- **careful** (on by default). Before a shell command that loses work or data for good runs, you get a question with the command and what it would destroy: `rm -r`, `git reset --hard`, `git checkout .`, `git clean -f`, `git push --force`, `git branch -D`, `DROP TABLE`, `kubectl delete`, `docker system prune`, `terraform destroy`, `mkfs`, `dd of=`. Block it and Claude is told to find a safer way. `--force-with-lease` passes.
- **freeze**. `/freeze src/auth` confines Edit, Write and NotebookEdit to that folder; an edit outside it is refused and Claude has to ask you. Reading stays open. Shell commands are not checked, so a `sed -i` or `>` can still write outside.

| Command | What it does |
| :- | :- |
| `/careful`, `/careful on`, `/careful off` | Status, or switch it for this session |
| `/freeze <path>` | Freeze edits to a folder, relative to the project |
| `/freeze`, `/freeze off` | Status; unfreeze |

## Install

```
/plugin install guardrails --marketplace lippdev/lippstack
```
