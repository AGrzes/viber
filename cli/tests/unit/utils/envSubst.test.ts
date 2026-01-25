import { describe, expect, it } from 'vitest'
import { substituteEnvPath, substituteEnvValue } from '../../../src/lib/utils/envSubst.js'

describe('env substitution helper', () => {
  it('replaces ${VAR} placeholders with provided env values', () => {
    const result = substituteEnvPath('/app/${ENV}/config', { ENV: 'stage' })
    expect(result).toBe('/app/stage/config')
  })

  it('throws when placeholders reference undefined variables', () => {
    expect(() =>
      substituteEnvPath('/app/${ENV}/config', { OTHER: 'value' })
    ).toThrow('Missing environment variables for template path: ENV')
  })

  it('can substitute strings without requiring paths', () => {
    const result = substituteEnvValue('Hello ${USER}', { USER: 'Coder' })
    expect(result).toBe('Hello Coder')
  })
})
