import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'

const spawnMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}))

import { buildPodmanArgs, runPodman } from '../../../src/lib/podman/runner.js'

function makeEmitter(): EventEmitter {
  return new EventEmitter()
}

describe('runPodman', () => {
  it('passes command args to podman', () => {
    const args = buildPodmanArgs({
      imageRef: 'example:latest',
      interactive: false,
      mappings: [],
      command: ['echo', 'hello'],
    })

    expect(args.slice(-2)).toEqual(['echo', 'hello'])
  })

  it('resolves exit code from spawned process', async () => {
    const emitter = makeEmitter()
    spawnMock.mockReturnValueOnce(emitter)

    const promise = runPodman({
      imageRef: 'example:latest',
      interactive: false,
      mappings: [],
    })

    emitter.emit('exit', 0)

    await expect(promise).resolves.toBe(0)
  })

  it('rejects on spawn error', async () => {
    const emitter = makeEmitter()
    spawnMock.mockReturnValueOnce(emitter)

    const promise = runPodman({
      imageRef: 'example:latest',
      interactive: false,
      mappings: [],
    })

    emitter.emit('error', new Error('boom'))

    await expect(promise).rejects.toThrow('boom')
  })
})
