import { describe, expect, it, vi } from 'vitest'
import { buildPodmanArgs, formatPodmanCommand, runPodman } from '../../src/lib/podman/runner.js'
import { WORKDIR } from '../../src/lib/utils/paths.js'

const baseMapping = {
  sourcePath: '/host/project',
  targetPath: WORKDIR,
  mode: 'rw',
}

describe('buildPodmanArgs', () => {
  it('includes userns keep-id and explicit UID:GID', () => {
    const args = buildPodmanArgs({
      imageRef: 'example:latest',
      interactive: false,
      mappings: [baseMapping],
      usernsMode: 'keep-id',
      uid: 1000,
      gid: 1001,
    })

    expect(args).toContain('--userns=keep-id')
    expect(args).toContain('--user')
    expect(args).toContain('1000:1001')
  })

  it('includes workdir and env entries when set', () => {
    const args = buildPodmanArgs({
      imageRef: 'example:latest',
      interactive: true,
      mappings: [baseMapping],
      workdir: WORKDIR,
      env: {
        FOO: 'bar',
      },
    })

    expect(args).toContain('-w')
    expect(args).toContain(WORKDIR)
    expect(args).toContain('-e')
    expect(args).toContain('FOO=bar')
  })
})

describe('dry-run behavior', () => {
  it('formats a podman command string', () => {
    const args = buildPodmanArgs({
      imageRef: 'example:latest',
      interactive: false,
      mappings: [baseMapping],
    })

    const formatted = formatPodmanCommand(args)
    expect(formatted.startsWith('podman run --rm')).toBe(true)
    expect(formatted).toContain('example:latest')
  })

  it('prints command instead of executing when dryRun is true', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitCode = await runPodman({
      imageRef: 'example:latest',
      interactive: false,
      mappings: [baseMapping],
      dryRun: true,
    })

    expect(exitCode).toBe(0)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
