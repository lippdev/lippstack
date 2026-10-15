---
name: careful
description: Safety guardrails for destructive terminal commands. Warns and pauses for explicit user confirmation before running destructive operations like rm -rf, DROP TABLE, git reset --hard, or force-push.
argument-hint: "[on | off | status]"
---

# Careful (Destructive Command Guardrail)

Safety mode for operations that could cause irreversible data loss, uncommitted code loss, or production damage.

---

## Protected Patterns

When careful mode is active, the agent **MUST NOT** execute any of the following commands without explicit confirmation:

| Pattern | Risk |
|---|---|
| `rm -rf`, `rm -r` on broad or relative paths | Irreversible file deletion |
| `DROP TABLE`, `DROP DATABASE`, `TRUNCATE` | Database data loss |
| `git reset --hard` | Destroys uncommitted local changes |
| `git checkout .`, `git restore .` | Discards unstaged modifications |
| `git clean -fd` | Deletes untracked files irreversibly |
| `git push --force`, `-f` | Overwrites remote branch history |
| `kubectl delete`, `helm uninstall` | Production workload destruction |
| `docker system prune -a`, `docker rm -f` | Container and volume data loss |

---

## Protocol

Before running any command matching these patterns:
1. Print a high-visibility warning:
   > ⚠️ **CAREFUL: Destructive command detected**
   > **Command:** `<command>`
   > **Risk:** `<what could be lost or overwritten>`
2. Ask the user for explicit permission to run it.
3. If an alternative, non-destructive command exists (e.g. `git stash` instead of `git reset --hard`, or targeted `rm` instead of `rm -rf`), propose the safe alternative first.
