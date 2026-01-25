import { describe, expect, it } from 'vitest'
import { ENV_CODEX_HOME } from '../../src/lib/utils/env.js'

describe('env constants', () => {
  it('exports expected config env names', () => {
    expect(ENV_CODEX_HOME).toBe('CODEX_HOME')
  })
})
