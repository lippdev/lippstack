import { expect, mock, test } from 'claude-code/testing'
import type { On, ThemeSetArgs } from 'claude-code'

// Stands in for the engine beneath the plugin, and records each theme it sets.
const engine = (on: On): ThemeSetArgs[] => {
  const looks: ThemeSetArgs[] = []
  on('command.register', () => ({ value: { command: 'cloud-rain' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', (_, e) => (looks.push(e), { value: { isDrawn: true, requestId: 'backdrop' } }))
  return looks
}

const scene = (look: ThemeSetArgs | undefined) =>
  look?.backdrop !== undefined && 'scene' in look.backdrop ? look.backdrop.scene : undefined

const start = { cwd: '/', surface: 'desktop', isInteractive: true } as const

const run = (args: string) => ({
  command: 'cloud-rain',
  args,
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 100 },
}) as const

test('starts black, with colors, a scene and message styles', async ($, on) => {
  mock.store(on)
  const looks = engine(on)
  await $.session.start(start)

  const look = looks.at(-1)
  expect(scene(look)).toBe('cloud-rain-black')
  expect(look?.colors).toBeDefined()
  expect(look?.style?.AssistantMessage).toBeDefined()
  expect(look?.overrideColorScheme).toBe('dark')
})

test('/cloud-rain switches, takes a name in English or Portuguese, and is kept', async ($, on) => {
  mock.store(on)
  const looks = engine(on)
  await $.session.start(start)

  await $.command.run(run(''))
  expect(scene(looks.at(-1))).toBe('cloud-rain-navy')

  await $.command.run(run('preto'))
  expect(scene(looks.at(-1))).toBe('cloud-rain-black')

  await $.command.run(run('azul'))
  await $.session.start(start)
  expect(scene(looks.at(-1))).toBe('cloud-rain-navy')
})

const backdrop = (surface: 'desktop' | 'mobile', name: string) => ({
  plugin: 'cloud-rain',
  component: 'Backdrop',
  requestId: 'backdrop',
  surface,
  props: { scene: name, plugin: 'cloud-rain', glass: { blur: 0, opacity: 0.8 } },
}) as const

test('the backdrop draws the scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    for (const name of ['cloud-rain-navy', 'cloud-rain-black']) {
      const ui = await $.ui.mount(backdrop(surface, name))
      expect(await ui.find({ type: 'Svg' })).toBeDefined()
      await ui.unmount()
    }
  }
})

test("another plugin's scene is left to it", async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>other</Text>
  })
  const ui = await $.ui.mount(backdrop('desktop', 'someone-else'))
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).toBe('other')
  await ui.unmount()
})
