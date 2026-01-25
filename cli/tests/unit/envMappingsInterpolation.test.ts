import { describe, expect, it } from 'vitest'
import { interpolateEnvMappings, interpolateEnvValue } from '../../src/lib/utils/envMappings.js'

describe('interpolateEnvValue', () => {
  it('replaces simple and braced references', () => {
    const hostEnv = { HOST_VAR: 'alpha', OTHER: 'beta' } as NodeJS.ProcessEnv
    const value = 'prefix-$HOST_VAR-${OTHER}-suffix'

    expect(interpolateEnvValue(value, hostEnv)).toBe('prefix-alpha-beta-suffix')
  })

  it('replaces missing references with empty string', () => {
    const hostEnv = {} as NodeJS.ProcessEnv

    expect(interpolateEnvValue('$MISSING', hostEnv)).toBe('')
  })
})

describe('interpolateEnvMappings', () => {
  it('interpolates all mapping values', () => {
    const hostEnv = { HOST: 'value' } as NodeJS.ProcessEnv
    const env = { A: '$HOST', B: 'plain' }

    expect(interpolateEnvMappings(env, hostEnv)).toEqual({
      A: 'value',
      B: 'plain',
    })
  })
})
