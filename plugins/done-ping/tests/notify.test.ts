import { expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

type Sent = { text: string; title?: string }

// The notification is sent without holding up the turn, so give it a moment to land.
const settle = async (sent: Sent[], n: number): Promise<void> => {
  for (let i = 0; i < 1000 && sent.length < n; i++) await Promise.resolve()
}

// Stands in for the engine beneath the plugin, and records what it notifies.
const engine = (on: On): Sent[] => {
  const sent: Sent[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('classic.Notification', () => ({}))
  on('ui.notify', ($, e) => (sent.push(e), { value: { isSent: true, channel: 'kitty' } }))
  return sent
}

const turn = { answer: '## Built the export\nMore text', turnId: 't1', isAborted: false, reason: 'answer' } as const

test('a long turn sends a done notification with the first line', async ($, on) => {
  const sent = engine(on)
  await $.session.start({ cwd: '/Users/me/lippstack', surface: 'terminal', isInteractive: true })
  await $.turn.complete({ ...turn, durationMs: 95_000 })
  await settle(sent, 1)
  expect(sent).toEqual([{ text: 'Done in 1m 35s: Built the export', title: 'lippstack' }])
})

test('short, aborted and subagent turns stay quiet', async ($, on) => {
  const sent = engine(on)
  await $.turn.complete({ ...turn, durationMs: 5_000 })
  await $.turn.complete({ ...turn, durationMs: 95_000, isAborted: true, reason: 'aborted' })
  await $.turn.complete({ ...turn, durationMs: 95_000, agentId: 'a1' })
  await settle(sent, 1)
  expect(sent).toEqual([])
})

test('minSeconds is read from the options', { options: { minSeconds: 3 } }, async ($, on) => {
  const sent = engine(on)
  await $.turn.complete({ ...turn, durationMs: 5_000 })
  await settle(sent, 1)
  expect(sent.length).toBe(1)
})

test('a permission prompt is forwarded', async ($, on) => {
  const sent = engine(on)
  await $.classic.Notification({ message: 'Claude needs your permission to use Bash', notification_type: 'permission_prompt' })
  await settle(sent, 1)
  expect(sent[0]?.text).toBe('Claude needs your permission to use Bash')
  expect(sent[0]?.title).toMatch(/waiting for you/)
})
