import type { Hook, Register } from 'claude-code'

type Engine = Parameters<Hook<'turn.complete'>>[0]
type Line = { project: string; branch?: string; model?: string; context?: number }

// claude-opus-5-5[1m] -> Opus 5.5; anything else is shown as given.
const prettyModel = (id: string): string => {
  const m = /(opus|sonnet|haiku|fable)-(\d+)(?:-(\d{1,2}))?(?!\d)/i.exec(id)
  if (!m || !m[1]) return id
  const name = m[1][0]?.toUpperCase() + m[1].slice(1).toLowerCase()
  return m[3] ? `${name} ${m[2]}.${m[3]}` : `${name} ${m[2]}`
}

// The fill gets a dot that warms up as compaction gets close.
const contextText = (p: number): string => `${p >= 80 ? '🔴' : p >= 60 ? '🟡' : '🟢'} ctx ${p}%`

const render = (l: Line): string =>
  [l.project, l.branch && `⎇ ${l.branch}`, l.model, l.context !== undefined && contextText(l.context)]
    .filter(Boolean)
    .join('  ·  ')

async function gitBranch($: Engine): Promise<string | undefined> {
  try {
    const { exitCode, stdout } = await $.process.run(['git', 'branch', '--show-current'], { timeoutMs: 3000 })
    return exitCode === 0 ? stdout.trim() || 'detached' : undefined
  } catch {
    return undefined
  }
}

async function refresh($: Engine, line: Line): Promise<void> {
  const [branch, model] = await Promise.all([gitBranch($), $.session.model().catch(() => undefined)])
  line.branch = branch
  line.model = model ? prettyModel(model) : undefined
  $.ui.status(render(line))
}

export const register: Register = on => {
  const line: Line = { project: '' }

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    line.project = e.cwd.split('/').filter(Boolean).pop() ?? e.cwd
    await refresh($, line)
    return started
  })

  // Branch and model can change during a turn (git checkout, /model).
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!e.agentId) await refresh($, line)
    return result
  })

  on('session.measure', async ($, e, next) => {
    const measured = await next(e)
    if (e.changed.includes('context') && e.context.percent !== undefined) {
      line.context = e.context.percent
      $.ui.status(render(line))
    }
    return measured
  })
}
