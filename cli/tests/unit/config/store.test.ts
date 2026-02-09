import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}))

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    default: {
      ...actual,
      existsSync: vi.fn(),
    },
    ...actual,
    existsSync: vi.fn(),
  }
})

vi.mock('../../../src/lib/config/discovery.js', () => ({
  findProjectConfig: vi.fn(),
}))

import fs from 'node:fs/promises'
import * as fsSync from 'node:fs'
import {
  getGlobalConfigPath,
  getProjectConfigPath,
  readGlobalConfig,
  readProjectConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from '../../../src/lib/config/store.js'
import { findProjectConfig } from '../../../src/lib/config/discovery.js'
import { GLOBAL_CONFIG_JSON_PATH, GLOBAL_CONFIG_YAML_PATH } from '../../../src/lib/config/schema.js'

const mockedFs = fs as unknown as {
  readFile: ReturnType<typeof vi.fn>
  writeFile: ReturnType<typeof vi.fn>
  mkdir: ReturnType<typeof vi.fn>
}

const mockedFsSync = fsSync as unknown as {
  existsSync: ReturnType<typeof vi.fn>
}

describe('config store', () => {
  beforeEach(() => {
    mockedFsSync.existsSync.mockReset()
  })

  it('returns null when global config is missing', async () => {
    mockedFs.readFile.mockRejectedValueOnce(Object.assign(new Error('missing'), { code: 'ENOENT' }))
    mockedFs.readFile.mockRejectedValueOnce(Object.assign(new Error('missing'), { code: 'ENOENT' }))

    const result = await readGlobalConfig()
    expect(result).toBeNull()
  })

  it('reads and parses project config', async () => {
    mockedFs.readFile.mockResolvedValueOnce(JSON.stringify({ image: 'example:latest' }))

    const result = await readProjectConfig('/tmp/project/.viber.json')
    expect(result.image).toBe('example:latest')
  })

  it('reads and parses global config from yaml when present', async () => {
    mockedFs.readFile.mockResolvedValueOnce('profiles:\n  default:\n    image: example:latest\n')

    const result = await readGlobalConfig()
    expect(result?.profiles.default.image).toBe('example:latest')
  })

  it('rethrows unexpected read errors for global config', async () => {
    mockedFs.readFile.mockRejectedValueOnce(Object.assign(new Error('boom'), { code: 'EACCES' }))

    await expect(readGlobalConfig()).rejects.toThrow('boom')
  })

  it('writes global config after validation', async () => {
    mockedFs.mkdir.mockResolvedValueOnce(undefined)
    mockedFs.writeFile.mockResolvedValueOnce(undefined)

    await writeGlobalConfig({ profiles: {} })

    expect(mockedFs.writeFile).toHaveBeenCalledWith(GLOBAL_CONFIG_YAML_PATH, expect.stringContaining('profiles:'))
  })

  it('writes project config after validation', async () => {
    mockedFs.mkdir.mockResolvedValueOnce(undefined)
    mockedFs.writeFile.mockResolvedValueOnce(undefined)

    await writeProjectConfig('/tmp/project/.viber.json', { image: 'example:latest' })

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      '/tmp/project/.viber.json',
      expect.stringContaining('"example:latest"')
    )
  })

  it('returns the global config path', () => {
    mockedFsSync.existsSync.mockImplementation((value: string) => value === GLOBAL_CONFIG_YAML_PATH)

    expect(getGlobalConfigPath()).toBe(GLOBAL_CONFIG_YAML_PATH)
  })

  it('returns json global config path when yaml missing', () => {
    mockedFsSync.existsSync.mockImplementation((value: string) => value === GLOBAL_CONFIG_JSON_PATH)

    expect(getGlobalConfigPath()).toBe(GLOBAL_CONFIG_JSON_PATH)
  })

  it('delegates project config lookup to discovery', () => {
    vi.mocked(findProjectConfig).mockReturnValue('/tmp/project/.viber.json')

    expect(getProjectConfigPath('/tmp/project')).toBe('/tmp/project/.viber.json')
  })
})
