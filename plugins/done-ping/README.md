# done-ping

A macOS notification when Claude needs you:

- **Done.** A task that took a minute or more finished: `Done in 3m 12s: <first line of the answer>`, titled with the project folder. Interrupted turns and subagents stay quiet.
- **Waiting for you.** Claude Code asks for a permission or has been waiting for your input: the same message Claude Code shows, titled `<project>: waiting for you`.

It uses `osascript`, so it works in any terminal, Orca included. The first notification may ask macOS for permission (it shows as coming from Script Editor); allow it in System Settings → Notifications. Off macOS it falls back to the terminal's own notification channel.

## Settings

In `/config`:

| Setting | Default | |
| :- | :- | :- |
| `minSeconds` | 60 | Only turns at least this long send "Done" |
| `sound` | Glass | Glass, Ping, Pop, Hero, Submarine or none |

## Install

```
/plugin install done-ping --marketplace <owner>/lippstack
```
