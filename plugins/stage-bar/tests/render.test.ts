import { expect, mock, test } from 'claude-code/testing'

const BAND = {
  plugin: 'stage-bar',
  component: 'AbovePrompt',
  viewport: { columns: 120, rows: 40 },
  props: { hasSurvey: false, isWorking: false, maxRows: 4, bodyColumns: 118, scroll: { offset: 0, bodyRows: 4 }, view: {} },
} as const

test('terminal band draws title, bar and label once stages are sent', async ($, on) => {
  mock.clock(on)
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['claude code band'] }))

  const call = await $.tool.call({ tool: 'mcp__stage-bar__stages', title: 'Add login', stages: ['Explore', 'Plan', 'Build', 'Test'] })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Add login/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /1\/4 · Explore/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /0%/ })).toBeDefined()
  expect(await ui.find({ key: 'sb-dismiss' })).toBeDefined()
  await ui.unmount()
})

test('desktop band still draws the svg', async ($, on) => {
  mock.clock(on)
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['claude code band'] }))
  await $.tool.call({ tool: 'mcp__stage-bar__stages', title: 'Add login', stages: ['Explore', 'Plan', 'Build'], current: 2 })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
  await ui.unmount()
})
