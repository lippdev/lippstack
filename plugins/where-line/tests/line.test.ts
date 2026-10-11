import { expect, test } from 'claude-code/testing'
import type { On, SessionMeasureInput } from 'claude-code'

// Stands in for the engine beneath the plugin, and records each status line.
const engine = (on: On, model: string): (string | undefined)[] => {
  const lines: (string | undefined)[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.model', () => ({ value: model }))
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.status', ($, e) => (lines.push(e.text), { value: undefined }))
  return lines
}

const measure = (percent: number): SessionMeasureInput => ({
  context: { window: 200_000, tokens: percent * 2000, percent },
  rateLimits: [],
  changed: ['context'],
})

test('shows project and model, then the context fill as it grows', async ($, on) => {
  const lines = engine(on, 'claude-opus-5-5[1m]')
  await $.session.start({ cwd: '/Users/me/lippstack', surface: 'terminal', isInteractive: true })
  expect(lines.at(-1)).toMatch(/^lippstack .*Opus 5\.5$/)

  await $.session.measure(measure(42))
  expect(lines.at(-1)).toMatch(/Opus 5\.5  ·  🟢 ctx 42%$/)

  await $.session.measure(measure(85))
  expect(lines.at(-1)).toMatch(/🔴 ctx 85%$/)
})

test('a model it does not know is shown as given', async ($, on) => {
  const lines = engine(on, 'some-other-model')
  await $.session.start({ cwd: '/tmp/x', surface: 'terminal', isInteractive: true })
  expect(lines.at(-1)).toMatch(/some-other-model/)
})
