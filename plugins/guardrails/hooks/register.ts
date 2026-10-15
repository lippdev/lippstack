import { atom, read, update } from 'claude-code'
import type { Hook, Register } from 'claude-code'
import type { Frozen } from '../types'

type Engine = Parameters<Hook<'tool.call'>>[0]

const careful = atom({ plugin: 'guardrails', key: 'careful' } as const, true)
const frozen = atom<Frozen>({ plugin: 'guardrails', key: 'frozen' } as const, null)

// Commands that lose work or data for good. Matched anywhere in the command line.
const DESTRUCTIVE: [RegExp, string][] = [
  [/\brm\s+(-\w*[rR]\w*|--recursive)\b/, 'deletes files recursively'],
  [/\bgit\s+reset\s+.*--hard\b/, 'throws away uncommitted changes'],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/, 'throws away unstaged changes'],
  [/\bgit\s+clean\s+-\w*f/, 'deletes untracked files'],
  [/\bgit\s+push\b.*(\s--force(?!-with-lease)\b|\s-\w*f\b)/, 'rewrites the remote history'],
  [/\bgit\s+branch\s+.*-D\b/, 'deletes a branch that may not be merged'],
  [/\b(drop\s+(table|database|schema)|truncate\s+table)\b/i, 'deletes database data'],
  [/\bkubectl\s+delete\b|\bhelm\s+(uninstall|delete)\b/, 'removes cluster workloads'],
  [/\bdocker\s+(system\s+prune|volume\s+(rm|prune)|rm\s+-\w*f)/, 'removes containers or volumes'],
  [/\bterraform\s+destroy\b/, 'destroys infrastructure'],
  [/\b(mkfs(\.\w+)?|dd\s+.*\bof=)/, 'overwrites a disk'],
]

export const riskOf = (command: string): string | undefined => DESTRUCTIVE.find(([re]) => re.test(command))?.[1]

// `p` against `base`, `.` and `..` folded, `/` separators; works for Windows paths too.
export const resolvePath = (base: string, p: string): string => {
  const abs = /^([\\/]|[A-Za-z]:)/.test(p) ? p : `${base}/${p}`
  const parts: string[] = []
  for (const s of abs.split(/[\\/]+/)) {
    if (!s || s === '.') continue
    if (s === '..') parts.pop()
    else parts.push(s)
  }
  return /^[A-Za-z]:/.test(abs) ? parts.join('/') : `/${parts.join('/')}`
}

const isInside = (root: string, file: string): boolean => file === root || file.startsWith(`${root}/`)

const RUN = 'Run it'

// A deny when edits are frozen and `path` falls outside the frozen folder.
async function outsideFreeze($: Engine, cwd: string, path: string): Promise<{ deny: string } | undefined> {
  const root = await read($, frozen)
  if (root === null || isInside(root, resolvePath(cwd, path))) return undefined
  return { deny: `guardrails: edits are frozen to ${root}, and ${path} is outside it. Explain why the change is needed and ask the user to widen the freeze or run /freeze off.` }
}

export const register: Register = on => {
  let cwd = '/'
  let interactive = true

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    cwd = e.cwd
    interactive = e.isInteractive
    await $.command.register({ name: 'careful', description: 'Ask before destructive shell commands: on, off, or status (default on)' })
    await $.command.register({ name: 'freeze', description: 'Confine file edits to a folder: /freeze <path>, /freeze off, or /freeze for status' })
    return started
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const risk = riskOf(e.command)
    if (!risk || !(await read($, careful))) return next(e)
    // Hosts without a prompt (SDK, T3 Code, CI) fail the whole turn on a question, so refuse instead.
    if (!interactive) return { deny: `guardrails: this command ${risk}, and this session cannot ask the user. Use a safer alternative, or ask the user in chat to run it or turn /careful off.` }
    const shown = e.command.length > 160 ? `${e.command.slice(0, 159)}…` : e.command
    const answer = await $.ui.ask(`This command ${risk}: \`${shown}\`. Run it?`, { header: 'careful', options: [RUN, 'Block it'] }).catch(() => 'Block it')
    if (answer === RUN) return next(e)
    return { deny: `guardrails: the user blocked this command (it ${risk}). Suggest a safer alternative, such as git stash or a targeted rm, or ask them to run it.` }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'guardrails: its careful check failed, so the command was not run.' }))

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => (await outsideFreeze($, cwd, e.file_path)) ?? next(e))
  on('tool.call', { tool: 'Write' }, async ($, e, next) => (await outsideFreeze($, cwd, e.file_path)) ?? next(e))
  on('tool.call', { tool: 'NotebookEdit' }, async ($, e, next) => (await outsideFreeze($, cwd, e.notebook_path)) ?? next(e))

  on('command.run', { command: 'careful' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'on' || arg === 'off') await update($, careful, () => arg === 'on')
    else if (arg) return { text: 'Usage: /careful on | off | status' }
    return { text: `careful is ${(await read($, careful)) ? 'on: destructive shell commands ask you first' : 'off'}` }
  })

  on('command.run', { command: 'freeze' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'off') {
      await update($, frozen, () => null)
      return { text: 'Unfrozen: edits are allowed anywhere again.' }
    }
    if (arg && arg !== 'status') {
      const root = resolvePath(cwd, arg)
      await update($, frozen, () => root)
      return { text: `Frozen: Edit and Write are confined to ${root} until /freeze off.` }
    }
    const root = await read($, frozen)
    return { text: root ? `Frozen to ${root}.` : 'Nothing is frozen. Use /freeze <path>.' }
  })
}
