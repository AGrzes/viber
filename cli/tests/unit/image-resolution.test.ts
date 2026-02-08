import { describe, expect, it, vi } from 'vitest'
import { runSession } from '../../src/services/session.js'
import { WORKDIR } from '../../src/lib/utils/paths.js'
import type { ResolvedConfig } from '../../src/lib/config/schema.js'

const mockResolveConfig = vi.fn()
const mockRunPodman = vi.fn().mockResolvedValue(0)

vi.mock('../../src/lib/config/resolver.js', () => ({
  resolveConfig: mockResolveConfig,
}))

vi.mock('../../src/lib/podman/runner.js', () => ({
  runPodman: mockRunPodman,
}))

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

describe('image resolution', () => {
  it('fails when no image is set', async () => {
    mockResolveConfig.mockResolvedValueOnce(makeResolved({}))

    await expect(
      runSession({
        cwd: process.cwd(),
      })
    ).rejects.toThrow(/no image selected/i)
  })

  it('overrides image when --image is provided', async () => {
    mockResolveConfig.mockResolvedValueOnce(makeResolved({ image: 'base:latest' }))

    await runSession({
      cwd: process.cwd(),
      image: 'override:latest',
    })

    expect(mockRunPodman).toHaveBeenCalledWith(
      expect.objectContaining({
        imageRef: 'override:latest',
      })
    )
  })
})
