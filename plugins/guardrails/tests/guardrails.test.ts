import { expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import { resolvePath, riskOf } from '../hooks/register'

// Stands in for the engine: tools succeed, and the user answers every question with `answer`.
const engine = (on: On, answer: string): string[] => {
  const asked: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({}))
  on('tool.call', { tool: 'AskUserQuestion' }, ($, e) => {
    const q = (e.questions[0] as { question: string }).question
    asked.push(q)
    return { result: { questions: e.questions, answers: { [q]: answer } } }
  })
  on('tool.call', () => ({ result: 'ran' }))
  return asked
}

const start = { cwd: '/repo', surface: 'terminal', isInteractive: true } as const

test('destructive commands are recognised, everyday ones are not', () => {
  for (const c of ['rm -rf build', 'rm -r dist', 'git reset --hard HEAD~1', 'git checkout .', 'git clean -fd', 'git push -f origin main', 'git push --force', 'psql -c "DROP TABLE users"', 'kubectl delete pod x', 'git branch -D old'])
    expect(riskOf(c)).toBeDefined()
  for (const c of ['rm file.txt', 'git push origin main', 'git push --force-with-lease', 'git checkout main', 'git reset HEAD file', 'ls -rf', 'npm run format'])
    expect(riskOf(c)).toBeUndefined()
})

test('careful asks, and a block keeps the command from running', async ($, on) => {
  const asked = engine(on, 'Block it')
  await $.session.start(start)
  const ran = await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })
  expect(asked.length).toBe(1)
  expect(ran.deny).toContain('blocked')
})

test('careful lets the command run once approved, and /careful off stops asking', async ($, on) => {
  const asked = engine(on, 'Run it')
  await $.session.start(start)
  expect((await $.tool.call({ tool: 'Bash', command: 'git reset --hard' })).deny).toBeUndefined()
  await $.command.run({ command: 'careful', args: 'off' })
  expect((await $.tool.call({ tool: 'Bash', command: 'git reset --hard' })).deny).toBeUndefined()
  expect(asked.length).toBe(1)
})

test('freeze blocks edits outside the folder until /freeze off', async ($, on) => {
  engine(on, 'Run it')
  await $.session.start(start)
  await $.command.run({ command: 'freeze', args: 'src/auth' })
  expect((await $.tool.call({ tool: 'Edit', file_path: '/repo/src/auth/login.ts', old_string: 'a', new_string: 'b' })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'Write', file_path: 'src/auth/../billing.ts', content: '' })).deny).toContain('frozen to /repo/src/auth')
  expect((await $.tool.call({ tool: 'Edit', file_path: '/repo/src/authx/a.ts', old_string: 'a', new_string: 'b' })).deny).toBeDefined()
  await $.command.run({ command: 'freeze', args: 'off' })
  expect((await $.tool.call({ tool: 'Write', file_path: '/repo/README.md', content: '' })).deny).toBeUndefined()
})

test('paths resolve on POSIX and Windows', () => {
  expect(resolvePath('/repo', './a/../b')).toBe('/repo/b')
  expect(resolvePath('C:\\work\\repo', 'src\\x.ts')).toBe('C:/work/repo/src/x.ts')
})
