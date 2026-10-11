export type Run = {
  title: string
  /** Stage names in order, 2 to 8 of them. */
  stages: string[]
  /** Index of the stage in progress; stages before it are done. */
  current: number
  isFinished: boolean
  startedAt: number
  finishedAt?: number
}

declare module 'claude-code' {
  interface PluginState {
    'stage-bar': {
      run: Run | null
      tick: number
    }
  }
}
