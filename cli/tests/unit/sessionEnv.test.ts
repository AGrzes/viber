import { describe, expect, it } from 'vitest'
import { buildSessionEnv } from '../../src/services/sessionEnv.js'
import { type Profile } from '../../src/lib/config/schema.js'

describe('buildSessionEnv', () => {
  it('interpolates env values after merge', () => {
    const profile: Profile = {
      image: 'example:latest',
      env: {
        FOO: '$HOST',
        BAR: 'two',
      },
    }

    const { env, extraMounts } = buildSessionEnv(profile, { HOST: 'three' })

    expect(env).toMatchObject({
      FOO: 'three',
      BAR: 'two',
    })
    expect(extraMounts).toHaveLength(0)
  })
})
