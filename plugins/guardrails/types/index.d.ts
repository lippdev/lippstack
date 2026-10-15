/** Absolute folder edits are confined to, or null when nothing is frozen. */
export type Frozen = string | null

declare module 'claude-code' {
  interface PluginState {
    guardrails: {
      /** Ask before destructive shell commands. On by default. */
      careful: boolean
      frozen: Frozen
    }
  }
}
