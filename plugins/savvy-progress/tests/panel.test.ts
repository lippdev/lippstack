import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const PROGRESS = 'mcp__savvy-progress__progress'
const start = { cwd: '/repo', surface: 'terminal', isInteractive: true } as const

// Stands in for the engine beneath the plugin and keeps the list of open panes.
const engine = (on: On) => {
  const panes: { id: string; title?: string }[] = []
  mock.clock(on)
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({}))
  on('env.get', () => ({ value: undefined }))
  on('settings.read', () => ({ value: {} }))
  on('tool.register', () => ({ value: undefined }))
  on('command.register', () => ({ value: undefined }))
  on('session.usage', () => ({ value: { rateLimits: [] } }))
  on('ui.panes', () => ({ value: panes }))
  on('ui.open', ($, e) => {
    panes.push({ id: e.id, title: e.title })
    return { value: { isPlaced: true } }
  })
  on('ui.close', ($, e) => {
    panes.splice(0, panes.length, ...panes.filter(p => p.id !== e.id))
    return { value: undefined }
  })
  return panes
}

test('the progress tool labels the flow by phase and count', async ($, on) => {
  engine(on)
  await $.session.start(start)
  expect(String((await $.tool.call({ tool: PROGRESS, title: 'Add login' })).result)).toBe('ok: Plan')
  expect(String((await $.tool.call({ tool: PROGRESS, total: 4, done: 1, phase: 'delegate' })).result)).toBe('ok: Tasks 1/4')
  expect(String((await $.tool.call({ tool: PROGRESS, done: 3, phase: 'review' })).result)).toBe('ok: Review 3/4')
  expect(String((await $.tool.call({ tool: PROGRESS, finished: true })).result)).toBe('ok: Done')
})

test('a new title starts a clean flow and done never exceeds total', async ($, on) => {
  engine(on)
  await $.session.start(start)
  await $.tool.call({ tool: PROGRESS, title: 'First', total: 5, done: 5, phase: 'delegate' })
  expect(String((await $.tool.call({ tool: PROGRESS, title: 'Second', phase: 'delegate' })).result)).toBe('ok: Tasks 0 running')
  expect(String((await $.tool.call({ tool: PROGRESS, total: 2, done: 9 })).result)).toBe('ok: Tasks 2/2')
})

test('/agents-info opens the panel and closes it again', async ($, on) => {
  const panes = engine(on)
  await $.session.start(start)
  expect((await $.command.run({ command: 'agents-info' })).text).toBe('Agents panel opened.')
  expect(panes.map(p => p.id)).toEqual(['savvy-agents'])
  expect((await $.command.run({ command: 'agents-info' })).text).toBe('Agents panel closed.')
  expect(panes.length).toBe(0)
})
