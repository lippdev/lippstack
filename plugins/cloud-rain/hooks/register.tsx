import type { EngineInterface, Register, ThemeSetArgs, ThemeSound } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE_NAVY, SCENE_BLACK } from './scenes'

// Cloud Rain, from lipp-t3-theme: a pixel-art night sky with slow digit rain.
// Two versions, as in T3: navy (the original, "azul") and black ("preto").
// Black is the default; /cloud-rain switches and the choice is kept.

type Variant = 'navy' | 'black'

const navy = makeColors({
  label: 'Cloud Rain',
  only: 'dark',
  roles: { accent: '#8fa2ff', danger: '#ff7a8a', success: '#7ee0a8', warning: '#f2c46b', pro: '#c49bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#040828',
        'surface-1': '#0a1238',
        'surface-2': '#0e1846',
        'surface-3': '#121c4a',
        'text-primary': '#eef1ff',
        'text-secondary': '#c4cbef',
        'text-muted': '#a3acd6',
      },
    },
  },
})

const black = makeColors({
  label: 'Cloud Rain Preto',
  only: 'dark',
  roles: { accent: '#c6c9cf', danger: '#ff7a7a', success: '#86d9a0', warning: '#e8c06a', pro: '#b9a6ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#08090b',
        'surface-1': '#121316',
        'surface-2': '#1b1d20',
        'surface-3': '#1e2023',
        'text-primary': '#f0f0f0',
        'text-secondary': '#cfd0d3',
        'text-muted': '#b0b2b6',
      },
    },
  },
})

// Soft rain: a low hush, a few ticks on the window, a quiet chime when a turn ends.
const SOUND: ThemeSound = {
  ambience: {
    layers: [
      { wave: 'brown', drone: true, gain: 0.18 },
      { wave: 'pink', drone: true, gain: 0.06 },
      { wave: 'crackle', scatter: 3, gain: 0.05 },
    ],
    reverb: 0.3,
  },
  cues: {
    done: { layers: [{ wave: 'bell', notes: ['E5', 'B5'], step: 0.12, gain: 0.2 }], reverb: 0.4 },
  },
}

function look(variant: Variant): ThemeSetArgs {
  const isBlack = variant === 'black'
  const veil = isBlack ? '#0e0f12e8' : '#060c32e8'
  const bubble = isBlack ? '#242629' : '#1a2a78'

  return {
    colors: (isBlack ? black : navy).theme,
    backdrop: {
      scene: `cloud-rain-${variant}`,
      // No blur in either version: the sky stays sharp behind the panels.
      glass: isBlack
        ? { blur: 0, tint: '#0a0b0d', opacity: 0.78 }
        : { blur: 0, tint: '#040828', opacity: 0.88 },
    },
    overrideColorScheme: 'dark',
    style: {
      UserMessage: {
        backgroundColor: bubble,
        color: '#f4f6ff',
        radius: 14,
        paddingX: 14,
        paddingY: 10,
      },
      AssistantMessage: {
        backgroundColor: veil,
        radius: 14,
        paddingX: 16,
        paddingY: 12,
        borderColor: isBlack ? '#292c31' : '#1c2a6a',
        borderWidth: 1,
      },
      ToolUse: {
        fontFamily: ['code'],
        backgroundColor: veil,
        radius: 8,
        paddingX: 8,
      },
    },
  }
}

const STORE_KEY = 'variant'

async function apply($: EngineInterface, variant: Variant) {
  const base = look(variant)
  const problems = (variant === 'black' ? black : navy).problems
  const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

  if (unpainted !== undefined) {
    $.ui.log(unpainted)
  }

  try {
    return await $.theme.set({ ...base, sound: SOUND })
  } catch (error) {
    $.ui.log(String(error))
  }

  try {
    return await $.theme.set(base)
  } catch (error) {
    $.ui.log(String(error))
    const { style: _style, ...rest } = base

    return await $.theme.set(rest)
  }
}

function parseVariant(value: unknown): Variant | undefined {
  const text = String(value ?? '').trim().toLowerCase()

  if (text === 'navy' || text === 'azul' || text === 'blue') {
    return 'navy'
  }
  if (text === 'black' || text === 'preto') {
    return 'black'
  }

  return undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'cloud-rain',
      description: 'Cloud Rain theme: /cloud-rain black or /cloud-rain navy. With no argument, switches.',
    })
    const variant = parseVariant(await $.store.get(STORE_KEY)) ?? 'black'
    const set = await apply($, variant)

    if (set !== undefined && !set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('command.run', { command: 'cloud-rain' }, async ($, e) => {
    const current = parseVariant(await $.store.get(STORE_KEY)) ?? 'black'
    const asked = parseVariant(e.args)
    const variant: Variant = asked ?? (current === 'navy' ? 'black' : 'navy')
    await $.store.set(STORE_KEY, variant)
    await apply($, variant)

    return { text: `Cloud Rain: ${variant}.` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    if (e.props.scene !== 'cloud-rain-navy' && e.props.scene !== 'cloud-rain-black') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const source = e.props.scene === 'cloud-rain-black' ? SCENE_BLACK : SCENE_NAVY

    return (
      <Svg
        source={source}
        alt="A pixel-art night sky of clouds with slow falling digits"
        isInteractive
      />
    )
  })
}
