import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/lib/config/resolver.js', () => ({
  resolveConfig: vi.fn(),
}))

vi.mock('../../src/lib/podman/runner.js', () => ({
  runPodman: vi.fn().mockResolvedValue(0),
}))

import { resolveConfig } from '../../src/lib/config/resolver.js'
import { runPodman } from '../../src/lib/podman/runner.js'
import { runSession } from '../../src/services/session.js'
import type { ResolvedConfig } from '../../src/lib/config/schema.js'

function makeResolved(profileOverrides: Partial<ResolvedConfig['profile']>): ResolvedConfig {
  return {
    profile: {
      ...profileOverrides,
    },
    projectConfigPath: undefined,
    globalConfigPath: undefined,
  }
}

describe('image resolution', () => {
  it('fails when no image is set', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(makeResolved({}))

    await expect(
      runSession({
        cwd: process.cwd(),
      })
    ).rejects.toThrow(/no image selected/i)
  })

  it('overrides image when --image is provided', async () => {
    vi.mocked(resolveConfig).mockResolvedValueOnce(makeResolved({ image: 'base:latest' }))

    await runSession({
      cwd: process.cwd(),
      image: 'override:latest',
    })

    expect(runPodman).toHaveBeenCalledWith(
      expect.objectContaining({
        imageRef: 'override:latest',
      })
    )
  })
})
