import { describe, expect, it, vi } from 'vitest'
import { EventEmitter } from 'node:events'

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}))

vi.mock('node:fs/promises', () => {
  const mkdtemp = vi.fn().mockResolvedValue('/tmp/viber-edit-test')
  const writeFile = vi.fn().mockResolvedValue(undefined)
  const readFile = vi.fn()
  return {
    mkdtemp,
    writeFile,
    readFile,
    default: { mkdtemp, writeFile, readFile },
    __esModule: true,
  }
})

import { spawn } from 'node:child_process'
import * as fs from 'node:fs/promises'
import { openEditor } from '../../src/lib/utils/editor.js'

describe('openEditor', () => {
  it('throws when no editor is configured', async () => {
    const originalVisual = process.env.VISUAL
    const originalEditor = process.env.EDITOR
    delete process.env.VISUAL
    delete process.env.EDITOR

    await expect(openEditor('hello')).rejects.toThrow(/No editor configured/)

    process.env.VISUAL = originalVisual
    process.env.EDITOR = originalEditor
  })

  it('returns unchanged content when file is the same', async () => {
    process.env.VISUAL = 'vim'

    vi.mocked(spawn).mockImplementation(() => {
      const emitter = new EventEmitter()
      setImmediate(() => emitter.emit('exit', 0))
      return emitter as unknown as ReturnType<typeof spawn>
    })

    vi.mocked(fs.readFile).mockResolvedValueOnce('hello')

    const result = await openEditor('hello')

    expect(result.changed).toBe(false)
    expect(result.content).toBe('hello')
  })

  it('returns changed content when file is updated', async () => {
    process.env.VISUAL = 'vim'

    vi.mocked(spawn).mockImplementation(() => {
      const emitter = new EventEmitter()
      setImmediate(() => emitter.emit('exit', 0))
      return emitter as unknown as ReturnType<typeof spawn>
    })

    vi.mocked(fs.readFile).mockResolvedValueOnce('updated')

    const result = await openEditor('hello')

    expect(result.changed).toBe(true)
    expect(result.content).toBe('updated')
  })

  it('throws on non-zero editor exit', async () => {
    process.env.VISUAL = 'vim'

    vi.mocked(spawn).mockImplementation(() => {
      const emitter = new EventEmitter()
      setImmediate(() => emitter.emit('exit', 1))
      return emitter as unknown as ReturnType<typeof spawn>
    })

    vi.mocked(fs.readFile).mockResolvedValueOnce('hello')

    await expect(openEditor('hello')).rejects.toThrow(/non-zero/)
  })
})
