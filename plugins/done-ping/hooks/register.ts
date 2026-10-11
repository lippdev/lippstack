import type { Hook, Register } from 'claude-code'

type Engine = Parameters<Hook<'turn.complete'>>[0]

// Shows `text` in Notification Center. argv carries the strings, so nothing needs escaping.
const SCRIPT = [
  'on run argv',
  'if item 3 of argv is "none" then',
  'display notification (item 1 of argv) with title (item 2 of argv)',
  'else',
  'display notification (item 1 of argv) with title (item 2 of argv) sound name (item 3 of argv)',
  'end if',
  'end run',
]

const firstLine = (s: string): string => {
  const line = s.split('\n').map(l => l.replace(/[#*`_>]/g, '').trim()).find(Boolean) ?? ''
  return line.length > 140 ? `${line.slice(0, 139)}…` : line
}

const elapsed = (ms: number): string => {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

// osascript first; off macOS, the terminal's own notification channel.
async function ping($: Engine, text: string, title: string, sound: string): Promise<void> {
  try {
    const { exitCode } = await $.process.run(['osascript', ...SCRIPT.flatMap(l => ['-e', l]), text, title, sound], { timeoutMs: 5000 })
    if (exitCode === 0) return
  } catch {
    // osascript missing or failed to start
  }
  await $.ui.notify(text, { title }).catch(() => undefined)
}

export const register: Register = (on, options) => {
  const minMs = Number(options.minSeconds ?? 60) * 1000
  const sound = String(options.sound ?? 'Glass')
  let project = 'Claude'

  on('session.start', async ($, e, next) => {
    project = e.cwd.split('/').filter(Boolean).pop() ?? project
    return next(e)
  })

  // A long main-loop turn that ended on its own.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!e.agentId && !e.isAborted && e.durationMs >= minMs) {
      const verb = e.reason === 'answer' ? 'Done' : 'Stopped'
      const summary = firstLine(e.answer)
      void ping($, summary ? `${verb} in ${elapsed(e.durationMs)}: ${summary}` : `${verb} in ${elapsed(e.durationMs)}`, project, sound)
    }
    return result
  })

  // Claude Code's own "needs your permission" / "waiting for your input".
  on('classic.Notification', async ($, e, next) => {
    const result = await next(e)
    void ping($, e.message, `${project}: waiting for you`, sound)
    return result
  })
}
