import { describe, expect, it } from 'vitest'
import { substituteEnvPath } from '../../../src/lib/utils/envSubst.js'
import { substituteEnvValue } from '../../../src/lib/utils/envSubst.js'

describe('env substitution helper', () => {
  it('replaces ${VAR} placeholders with provided env values', () => {
    const result = substituteEnvPath('/app/${ENV}/config', { ENV: 'stage' })
    expect(result).toBe('/app/stage/config')
  })

  it('throws when placeholders reference undefined variables', () => {
    expect(() =>
      substituteEnvPath('/app/${ENV}/config', { OTHER: 'value' })
    ).toThrow('Missing environment variables for substitution: ENV')
  })

  it('allows empty values when option enabled', () => {
    const result = substituteEnvPath('/tmp/${VAL}/data', { VAL: '' }, { allowEmpty: true })
    expect(result).toBe('/tmp/data')
  })

  it('rejects non-absolute results', () => {
    expect(() => substituteEnvPath('relative/${ENV}', { ENV: 'value' })).toThrow(
      'Resolved template path must be absolute'
    )
  })

  it('can substitute strings without requiring paths', () => {
    const result = substituteEnvValue('Hello ${USER}', { USER: 'Coder' })
    expect(result).toBe('Hello Coder')
  })
})
