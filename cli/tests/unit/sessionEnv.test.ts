import { describe, expect, it } from 'vitest'
import { buildSessionEnv } from '../../src/services/sessionEnv.js'
import { type ResolvedConfig } from '../../src/lib/config/schema.js'

function makeResolvedConfig(overrides: Partial<ResolvedConfig>): ResolvedConfig {
  return {
    project: undefined,
    global: undefined,
    projectConfigPath: undefined,
    globalConfigPath: undefined,
    effectiveMappings: [],
    imageProfile: undefined,
    imageReference: undefined,
    defaultProfileName: undefined,
    ...overrides,
  }
}

describe('buildSessionEnv', () => {
  it('merges and interpolates env mappings without setting VIBER_GLOBAL_CONFIG', () => {
    const resolved = makeResolvedConfig({
      project: {
        envMappings: [{ key: 'FOO', value: '$HOST' }],
      },
      global: {
        envMappings: [
          { key: 'FOO', value: 'one' },
          { key: 'BAR', value: 'two' },
        ],
      },
      projectConfigPath: '/tmp/project/.viber.json',
      effectiveMappings: [{ sourcePath: '/tmp', targetPath: '/workdir', mode: 'rw' }],
    })

    const { env } = buildSessionEnv(resolved, { HOST: 'three' }, false)

    expect(env).toMatchObject({
      FOO: 'three',
      BAR: 'two',
    })
    expect(env.VIBER_GLOBAL_CONFIG).toBeUndefined()
  })
})
