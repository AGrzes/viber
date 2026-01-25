import { describe, expect, it } from 'vitest'
import { substituteEnv } from '../../../src/lib/utils/envSubst.js'

describe('env substitution helper', () => {
  it('replaces ${VAR} placeholders with provided env values', () => {
    const result = substituteEnv('/app/${ENV}/config', { ENV: 'stage' })
    expect(result).toBe('/app/stage/config')
  })

  it('replaces $VAR syntax as well', () => {
    const result = substituteEnv('/app/$ENV/config', { ENV: 'prod' })
    expect(result).toBe('/app/prod/config')
  })

  it('leaves missing variables blank', () => {
    const result = substituteEnv('/app/${ENV}/config', {})
    expect(result).toBe('/app//config')
  })
})
