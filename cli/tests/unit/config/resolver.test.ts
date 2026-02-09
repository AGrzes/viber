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
import { WORKDIR } from '../../../src/lib/utils/paths.js'

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
    expect(resolved.effectiveMappings[0].targetPath).toBe(WORKDIR)
    expect(resolved.effectiveMappings[1]).toEqual({
      sourcePath: 'cache',
      targetPath: '/cache',
      mode: 'ro',
    })
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
