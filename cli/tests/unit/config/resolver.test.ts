import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/lib/config/discovery.js', () => ({
  findProjectConfig: vi.fn(),
}))

vi.mock('../../../src/lib/config/store.js', () => ({
  readGlobalConfig: vi.fn(),
  readProjectConfig: vi.fn(),
  getGlobalConfigPath: vi.fn(),
}))

import { resolveConfig } from '../../../src/lib/config/resolver.js'
import { findProjectConfig } from '../../../src/lib/config/discovery.js'
import { getGlobalConfigPath, readGlobalConfig, readProjectConfig } from '../../../src/lib/config/store.js'

const cwd = '/tmp/project'

function mockGlobal(config: unknown): void {
  vi.mocked(readGlobalConfig).mockResolvedValue(config as never)
}

function mockProject(config: unknown | undefined): void {
  vi.mocked(readProjectConfig).mockResolvedValue(config as never)
}

describe('resolveConfig', () => {
  it('defaults to global default profile when inherit omitted', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({})
    mockGlobal({
      profiles: {
        default: {
          image: 'base:latest',
        },
      },
    })

    const resolved = await resolveConfig(cwd)
    expect(resolved.profile.image).toBe('base:latest')
  })

  it('does not inherit when default profile is missing', async () => {
    vi.mocked(findProjectConfig).mockReturnValue(null)
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject(undefined)
    mockGlobal({ profiles: {} })

    const resolved = await resolveConfig(cwd)
    expect(resolved.profile.image).toBeUndefined()
  })

  it('merges inherit list left-to-right with project overrides', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({
      inherit: ['base', 'work'],
      env: {
        PROJECT: 'demo',
      },
      templates: {
        agents: {
          path: '/codex/AGENTS.md',
          template: 'Hello',
        },
      },
    })

    mockGlobal({
      profiles: {
        base: {
          image: 'base:latest',
          env: {
            FOO: 'one',
          },
        },
        work: {
          env: {
            FOO: 'two',
          },
          volumes: {
            cache: '/cache:ro',
          },
        },
      },
    })

    const resolved = await resolveConfig(cwd)
    expect(resolved.profile.image).toBe('base:latest')
    expect(resolved.profile.env).toEqual({
      FOO: 'two',
      PROJECT: 'demo',
    })
    expect(resolved.profile.templates?.agents.parameters).toBeUndefined()
  })

  it('removes entries when null is provided', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({
      env: {
        B: null,
      },
    })

    mockGlobal({
      profiles: {
        default: {
          env: {
            A: 'one',
            B: 'two',
          },
        },
      },
    })

    const resolved = await resolveConfig(cwd)
    expect(resolved.profile.env).toEqual({ A: 'one' })
  })

  it('errors on missing profiles in inheritance', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({ inherit: ['missing'] })
    mockGlobal({ profiles: {} })

    await expect(resolveConfig(cwd)).rejects.toThrow(/profile not found/i)
  })

  it('loads provided profiles via schema references', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({ inherit: ['provided:codex'] })
    mockGlobal({ profiles: {} })

    const resolved = await resolveConfig(cwd)
    expect(resolved.profile.image).toBe('codex:latest')
    expect(resolved.profile.env).toEqual({ FROM: 'provided' })
  })

  it('errors on unknown profile schemas', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({ inherit: ['unknown:thing'] })
    mockGlobal({ profiles: {} })

    await expect(resolveConfig(cwd)).rejects.toThrow(/unknown profile schema/i)
  })

  it('errors when provided profile files are missing', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({ inherit: ['provided:missing-profile'] })
    mockGlobal({ profiles: {} })

    await expect(resolveConfig(cwd)).rejects.toThrow(/failed to load provided profile/i)
  })

  it('errors on inheritance cycles', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({ inherit: ['a'] })
    mockGlobal({
      profiles: {
        a: { inherit: ['b'] },
        b: { inherit: ['a'] },
      },
    })

    await expect(resolveConfig(cwd)).rejects.toThrow(/cycle/i)
  })

  it('uses profileOverrides when provided', async () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')
    vi.mocked(getGlobalConfigPath).mockReturnValue('/home/user/.viber/config.json')

    mockProject({ inherit: ['default'] })
    mockGlobal({
      profiles: {
        default: { image: 'base:latest' },
        alt: { image: 'alt:latest' },
      },
    })

    const resolved = await resolveConfig(cwd, { profileOverrides: ['alt'] })
    expect(resolved.profile.image).toBe('alt:latest')
  })
})
