import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Run } from '../types'

const run = atom({ plugin: 'stage-bar', key: 'run' } as const, null)
const tick = atom({ plugin: 'stage-bar', key: 'tick' } as const, 0)

const TOOL = 'mcp__stage-bar__stages'
const MAX_STAGES = 8
// A finished bar stays this long, then clears itself.
const HOLD_MS = 45_000

// One color per stage, cycled; the active stage shimmers in its own color.
const PALETTE = ['#8f8cf4', '#4da3ff', '#2fc7b3', '#5fbf8f', '#f2c14e', '#f28a4e', '#ec6aa5', '#b48cf0']
const colorOf = (i: number): string => PALETTE[i % PALETTE.length] ?? '#8f8cf4'

const INSTRUCTIONS =
  'stage-bar: for a task with three or more distinct steps, call mcp__stage-bar__stages right after you settle on the approach, ' +
  'with a short title and 3 to 7 stage names (one or two words each, in the user\'s language), for example Explore, Plan, Build, Test. ' +
  'Call it again with current set to the number of the stage you are starting each time you move on, and with finished: true when the work is done. ' +
  'Skip it for questions and one-step tasks. Subagents must not call it.'

type Input = { title?: string; stages?: unknown; current?: number; finished?: boolean }

const cleanStages = (v: unknown): string[] =>
  Array.isArray(v)
    ? v
        .map(s => String(s).trim())
        .filter(Boolean)
        .slice(0, MAX_STAGES)
    : []

// A plan (stages) starts a new run; current and finished move the one in progress.
const merge = (prev: Run | null, input: Input, at: number): Run | null => {
  const names = cleanStages(input.stages)
  let r: Run
  if (names.length >= 2) {
    r = { title: input.title?.trim() || prev?.title || 'Task', stages: names, current: 0, isFinished: false, startedAt: at }
  } else if (prev) {
    r = { ...prev, title: input.title?.trim() || prev.title }
  } else {
    return null
  }
  if (typeof input.current === 'number' && Number.isFinite(input.current)) {
    const idx = Math.min(r.stages.length - 1, Math.max(0, Math.round(input.current) - 1))
    r = { ...r, current: idx, isFinished: false, finishedAt: undefined }
  }
  if (input.finished) r = { ...r, current: r.stages.length, isFinished: true, finishedAt: at }
  return r
}

const doneCount = (r: Run): number => (r.isFinished ? r.stages.length : r.current)
const percentOf = (r: Run): number => Math.round((doneCount(r) / r.stages.length) * 100)

const labelOf = (r: Run): string =>
  r.isFinished ? 'Done' : `${r.current + 1}/${r.stages.length} · ${r.stages[r.current] ?? ''}`

// ---------------------------------------------------------------------------
// Drawing helpers (desktop): the whole row is one SVG.

const H = 26
const BAR_H = 14
const GAP = 4
const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif"

const xml = (s: string): string =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)

const charEm = (ch: string): number =>
  /[\s.,:;'|!il1()[\]]/.test(ch) ? 0.3 : /[A-ZА-ЯЁmwМШ@%]/.test(ch) ? 0.72 : 0.56

const textWidth = (s: string, size: number): number => [...s].reduce((w, ch) => w + charEm(ch) * size, 0)

const fitText = (s: string, size: number, maxW: number): string => {
  if (textWidth(s, size) <= maxW) return s
  let out = ''
  for (const ch of s) {
    if (textWidth(out + ch + '…', size) > maxW) break
    out += ch
  }
  return out + '…'
}

const rowSvg = (r: Run, W: number): string => {
  const n = r.stages.length
  const activeColor = colorOf(r.isFinished ? n - 1 : r.current)
  const title = fitText(r.title, 13, Math.max(60, W * 0.28))
  const label = r.isFinished ? 'Done' : fitText(labelOf(r), 12, 150)
  const percent = `${percentOf(r)}%`
  const rightW = Math.round(textWidth(`${label}  ${percent}`, 12)) + 6
  const BAR_X = Math.round(16 + textWidth(title, 13) + 12)
  const BAR_W = Math.max(60, W - BAR_X - rightW - 10)
  const segW = (BAR_W - GAP * (n - 1)) / n
  const y0 = (H - BAR_H) / 2
  const rx = BAR_H / 2

  const clips: string[] = []
  const segs: string[] = []
  for (let i = 0; i < n; i++) {
    const x = Math.round(i * (segW + GAP) * 10) / 10
    const w = Math.round(segW * 10) / 10
    const color = colorOf(i)
    const isDone = r.isFinished || i < r.current
    const isActive = !r.isFinished && i === r.current
    clips.push(`<clipPath id="sb-s${i}"><rect x="${x}" y="0" width="${w}" height="${BAR_H}" rx="${rx}"/></clipPath>`)
    const cx = x + w / 2
    const cy = BAR_H / 2
    let body = `<rect class="k" x="${x}" y="0" width="${w}" height="${BAR_H}" rx="${rx}"/>`
    if (isDone) {
      const cls = r.isFinished ? 'fin' : i === r.current - 1 ? 'pop' : ''
      const delay = r.isFinished ? ` style="animation-delay:${(i * 0.12).toFixed(2)}s"` : ''
      body += `<g class="${cls}"${delay}><rect x="${x}" y="0" width="${w}" height="${BAR_H}" rx="${rx}" fill="${color}"/>`
      if (w >= 22) body += `<path d="M${cx - 3.2} ${cy + 0.2}l2.2 2.4 4.2-4.8" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`
      body += '</g>'
    } else if (isActive) {
      body +=
        `<g class="act"><rect x="${x}" y="0" width="${w}" height="${BAR_H}" rx="${rx}" fill="${color}"/>` +
        `<g clip-path="url(#sb-s${i})"><rect class="slide" x="${x - 14}" y="0" width="${w + 28}" height="${BAR_H}" fill="url(#sb-stripe)"/></g>` +
        `<circle class="head" cx="${x + w - 7}" cy="${cy}" r="2.6" fill="#fff"/></g>`
    }
    segs.push(body)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>
.t{fill:#1f1f1f}.m{fill:#8a8a8a}.k{fill:#e4e4e2}
@media (prefers-color-scheme: dark){.t{fill:#ececec}.m{fill:#9a9a9a}.k{fill:#2c2c2c}}
.act{animation:breathe 1.8s ease-in-out infinite}
@keyframes breathe{50%{opacity:.8}}
.slide{animation:slide .8s linear infinite}
@keyframes slide{to{transform:translateX(12px)}}
.head{animation:blink 1.1s ease-in-out infinite}
@keyframes blink{50%{opacity:.25}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .6s ease-out}
@keyframes pop{0%{transform:scaleY(1.9);filter:brightness(1.5)}100%{transform:scaleY(1);filter:none}}
.fin{transform-box:fill-box;transform-origin:center;animation:wave 1.1s ease-out both}
@keyframes wave{0%{opacity:.3;transform:scaleY(.4)}60%{opacity:1;transform:scaleY(1.35)}100%{transform:scaleY(1)}}
@media (prefers-reduced-motion: reduce){.act,.slide,.head,.pop,.fin{animation:none}}
</style>
<defs>
<pattern id="sb-stripe" width="12" height="${BAR_H}" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)"><rect width="5" height="${BAR_H}" fill="#fff" fill-opacity=".30"/></pattern>
</defs>
<circle cx="5" cy="${H / 2}" r="4" fill="${activeColor}"/>
<text class="t" x="16" y="${H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(title)}</text>
<g transform="translate(${BAR_X},${y0})"><defs>${clips.join('')}</defs>${segs.join('')}</g>
<text x="${BAR_X + BAR_W + 12}" y="${H / 2 + 4}" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums"><tspan fill="${activeColor}" font-weight="600">${xml(label)}</tspan><tspan class="m">  ${percent}</tspan></text>
</svg>`
}

// ---------------------------------------------------------------------------
// Terminal: the same bar in text; the active stage shimmers with a moving head.

const barCells = (r: Run, width: number, t: number) => {
  const n = r.stages.length
  const seg = Math.max(2, Math.floor((width - (n - 1)) / n))
  return r.stages.map((_, i) => {
    const color = colorOf(i)
    const isDone = r.isFinished || i < r.current
    const isActive = !r.isFinished && i === r.current
    if (isDone) return { key: i, color, text: '█'.repeat(seg), dim: false }
    if (!isActive) return { key: i, color: '#6b6b68', text: '░'.repeat(seg), dim: true }
    const head = t % (seg + 2)
    const text = [...'▓'.repeat(seg)].map((c, k) => (k === head ? '█' : k === head - 1 ? '▒' : c)).join('')
    return { key: i, color, text, dim: false }
  })
}

// A short preview you can run without a task: /stages-demo.
const DEMO = ['Explore', 'Plan', 'Build', 'Test', 'Ship']
const STEP_MS = 2200

export const register: Register = on => {
  // The terminal animates by redrawing; the desktop SVG animates itself, so a redraw
  // there would only restart its one-time effects. The render hook sets this.
  let wantsTick = false

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.tool.register({
      name: 'stages',
      description:
        'Show the stages of the current task as an animated, colored progress bar above the prompt. ' +
        'First call: title and stages (3 to 7 short names). Later calls: current (1-based number of the stage in progress). ' +
        'Last call: finished true. Only the main conversation reports; subagents must not call it.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short name of the task, a few words.' },
          stages: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: MAX_STAGES,
            description: 'Stage names in order. Sending them starts a new bar.',
          },
          current: { type: 'integer', minimum: 1, description: 'Number of the stage you are working on now; the ones before it are done.' },
          finished: { type: 'boolean', description: 'True once every stage is done.' },
        },
      },
    })
    await $.command.register({
      name: 'stages-demo',
      description: 'Preview the stage bar: five stages that advance by themselves',
    })
    $.clock.every(250, () => {
      void (async () => {
        const r = await read($, run)
        if (!r) return
        if (r.isFinished) {
          const at = await $.clock.now()
          if (r.finishedAt !== undefined && at - r.finishedAt > HOLD_MS) await update($, run, () => null)
          return
        }
        if (wantsTick) await update($, tick, t => t + 1)
      })()
    })
    return started
  })

  // Claude learns the tool once per conversation, in the context of its first message.
  on('prompt.context', async ($, e, next) => {
    const r = await next(e)
    return { ...r, blocks: [...r.blocks, { name: 'stage-bar', text: INSTRUCTIONS }] }
  })

  // Put the tool's schema in front of Claude instead of behind tool search.
  on('tool.describe', { tool: TOOL }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))

  on('tool.call', { tool: TOOL }, async ($, e) => {
    if (e.agentId) return { result: 'ignored: only the main conversation reports stages' }
    const at = await $.clock.now()
    const next = await update($, run, p => merge(p, e as unknown as Input, at))
    if (!next) return { result: 'error: send stages (2 to 8 names) first' }
    return { result: `ok: ${labelOf(next)}` }
  })

  on('command.run', { command: 'stages-demo' }, async $ => {
    const at = await $.clock.now()
    await update($, run, () => ({ title: 'Stage bar demo', stages: DEMO, current: 0, isFinished: false, startedAt: at }))
    DEMO.slice(1).forEach((_, k) => {
      $.clock.after(STEP_MS * (k + 1), () => {
        void update($, run, p => (p && p.title === 'Stage bar demo' ? { ...p, current: k + 1 } : p))
      })
    })
    $.clock.after(STEP_MS * DEMO.length, () => {
      void (async () => {
        const done = await $.clock.now()
        await update($, run, p => (p && p.title === 'Stage bar demo' ? { ...p, current: p.stages.length, isFinished: true, finishedAt: done } : p))
      })()
    })
    return { text: 'Stage bar demo started.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const r = await read($, run)
    if (r === null || e.props.hasSurvey) return next(e)

    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const dismiss = <Button key="sb-dismiss" label="✕" plain role="dismiss" onPress={() => update($, run, () => null)} />

    // The terminal lists Svg among its elements but cannot draw it, so go by the surface.
    if (e.surface === 'desktop' && 'Svg' in ui) {
      wantsTick = false
      const { Svg } = ui
      const width = Math.max(180, Math.min(1600, (e.props.bodyColumns || 100) * 8 - 56))
      return (
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Svg source={rowSvg(r, width)} alt={`${r.title}: ${labelOf(r)}, ${percentOf(r)}%`} width={width} height={H} />
          {dismiss}
        </Box>
      )
    }

    wantsTick = !r.isFinished
    const t = await read($, tick)
    const cols = e.props.bodyColumns || 100
    const titleW = Math.max(8, Math.min(24, r.title.length + 2, Math.floor(cols / 4)))
    const width = Math.max(r.stages.length * 3, Math.min(48, cols - titleW - 34))
    const active = colorOf(r.isFinished ? r.stages.length - 1 : r.current)
    return (
      <Box flexDirection="row" gap={2}>
        <Box width={titleW} flexShrink={0}>
          <Text color={active}>● </Text>
          <Text wrap="truncate-end">{r.title}</Text>
        </Box>
        <Text>
          {barCells(r, width, t).map(c => (
            <Text key={c.key} color={c.color} dimColor={c.dim}>
              {c.text}{' '}
            </Text>
          ))}
        </Text>
        <Text bold color={active}>
          {labelOf(r)}
        </Text>
        <Text dimColor>{percentOf(r)}%</Text>
        {dismiss}
      </Box>
    )
  })
}
