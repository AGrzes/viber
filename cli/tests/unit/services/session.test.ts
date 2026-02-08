import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/lib/config/resolver.js', () => ({
  resolveConfig: vi.fn(),
}))

vi.mock('../../../src/lib/podman/runner.js', () => ({
  runPodman: vi.fn().mockResolvedValue(0),
}))

vi.mock('../../../src/lib/utils/identity.js', () => ({
  getHostIdentity: vi.fn(),
}))

vi.mock('../../../src/lib/templates/processor.js', () => ({
  processTemplates: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../../src/lib/config/validation.js', () => ({
  validateMappings: vi.fn().mockReturnValue([]),
}))

import { resolveConfig } from '../../../src/lib/config/resolver.js'
import { runPodman } from '../../../src/lib/podman/runner.js'
import { getHostIdentity } from '../../../src/lib/utils/identity.js'
import { processTemplates } from '../../../src/lib/templates/processor.js'
import { validateMappings } from '../../../src/lib/config/validation.js'
import { runSession } from '../../../src/services/session.js'
import { WORKDIR } from '../../../src/lib/utils/paths.js'
import type { ResolvedConfig } from '../../../src/lib/config/schema.js'

function makeResolved(profileOverrides: Partial<ResolvedConfig['profile']>): ResolvedConfig {
  return {
    profile: {
      ...profileOverrides,
    },
    effectiveMappings: [
      {
        sourcePath: '/tmp/project',
        targetPath: WORKDIR,
        mode: 'rw',
      },
    ],
    projectConfigPath: undefined,
    globalConfigPath: undefined,
  }
}

describe('runSession', () => {
  it('throws when suppression path is invalid', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(
      makeResolved({
        image: 'example:latest',
      })
    )
    vi.mocked(getHostIdentity).mockReturnValue({ uid: 1, gid: 2 })

    await expect(
      runSession({
        cwd: process.cwd(),
        suppressions: [''],
      })
    ).rejects.toThrow(/invalid suppression path/i)
  })

  it('throws when suppression path is missing', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(
      makeResolved({
        image: 'example:latest',
        templates: {
          agents: {
            path: '/codex/AGENTS.md',
            template: 'Hello',
          },
        },
      })
    )
    vi.mocked(getHostIdentity).mockReturnValue({ uid: 1, gid: 2 })

    await expect(
      runSession({
        cwd: process.cwd(),
        suppressions: ['templates.missing'],
      })
    ).rejects.toThrow(/suppression path not found/i)
  })

  it('suppresses template entries via dot-path', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(
      makeResolved({
        image: 'example:latest',
        templates: {
          agents: {
            path: '/codex/AGENTS.md',
            template: 'Hello',
          },
        },
      })
    )
    vi.mocked(getHostIdentity).mockReturnValue({ uid: 1, gid: 2 })

    await runSession({
      cwd: process.cwd(),
      suppressions: ['templates.agents'],
    })

    expect(processTemplates).toHaveBeenCalledWith(
      expect.objectContaining({
        templateSet: {},
      })
    )
    expect(runPodman).toHaveBeenCalled()
  })

  it('errors when host identity is missing', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(
      makeResolved({
        image: 'example:latest',
      })
    )
    vi.mocked(getHostIdentity).mockReturnValue(null)

    await expect(
      runSession({
        cwd: process.cwd(),
      })
    ).rejects.toThrow(/host identity/i)
  })

  it('errors when mappings are invalid', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(
      makeResolved({
        image: 'example:latest',
      })
    )
    vi.mocked(getHostIdentity).mockReturnValue({ uid: 1, gid: 2 })
    vi.mocked(validateMappings).mockReturnValueOnce([{ field: 'targetPath', message: 'Duplicate targetPath' }])

    await expect(
      runSession({
        cwd: process.cwd(),
      })
    ).rejects.toThrow(/invalid mappings/i)
  })
})
