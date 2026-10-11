# stage-bar

An animated progress bar above the prompt that tracks the stages of the task you asked for.

- One segment per stage, each in its own color. Done stages are solid with a check, the stage in progress shimmers, the rest wait greyed out.
- When a stage finishes it pops. When the whole task finishes the segments ripple, and the bar clears itself after 45 seconds. Click ✕ to dismiss it sooner.
- In the terminal the bar is drawn in text, with a moving highlight on the active stage.

## How the progress is measured

Claude is the one who knows the steps, so it reports them. The mod adds the `stages` tool and a short note to the first message of each conversation. For a task with three or more steps, Claude sends a title and 3 to 7 stage names, moves `current` as it goes, and sends `finished` at the end. Questions and one-step tasks get no bar. Subagents are told not to report.

The percentage counts finished stages out of the total, so the stage in progress counts as zero until it is done.

## Try it

```
/stages-demo
```

plays a five-stage bar that advances by itself.

## Notes

- It draws in the band above the prompt. `savvy-progress` draws there too while a `/savvy-flow` is running; the one that loads first wins that slot.
- The bar goes away with the session. Nothing is written to disk.
- Colors cycle through eight tones, so a bar with more than eight stages is not allowed.

## Install

```bash
claude plugin marketplace add <owner>/lippstack
claude plugin install stage-bar@lippstack
```
