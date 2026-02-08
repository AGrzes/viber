import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveConfig } from '../../src/lib/config/resolver.js'
import { WORKDIR } from '../../src/lib/utils/paths.js'

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'viber-test-'))
}

describe('resolveConfig', () => {
  it('mounts current directory to /workdir when no volumes provided', async () => {
    const tempDir = makeTempDir()
    const resolved = await resolveConfig(tempDir)

    expect(resolved.effectiveMappings[0].sourcePath).toBe(path.resolve(tempDir))
    expect(resolved.effectiveMappings[0].targetPath).toBe(WORKDIR)
  })
})
