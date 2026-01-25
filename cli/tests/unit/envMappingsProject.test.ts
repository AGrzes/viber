import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

async function loadStores(tempHome: string) {
  process.env.HOME = tempHome
  process.env.USERPROFILE = tempHome
  vi.resetModules()
  const envStore = await import('../../src/lib/config/envMappingsStore.js')
  const configStore = await import('../../src/lib/config/store.js')
  return { envStore, configStore }
}

describe('env mapping project CRUD', () => {
  it('sets, gets, lists, and deletes project mappings', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viber-home-'))
    const { envStore, configStore } = await loadStores(tempHome)

    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viber-project-'))
    const configPath = path.join(projectDir, '.viber.json')
    await configStore.writeProjectConfig(configPath, {})

    await envStore.setEnvMapping('project', 'API_URL', 'https://example', projectDir)

    const fetched = await envStore.getEnvMapping('project', 'API_URL', projectDir)
    expect(fetched).toEqual({ key: 'API_URL', value: 'https://example' })

    const list = await envStore.listEnvMappings('project', projectDir)
    expect(list).toEqual([{ key: 'API_URL', value: 'https://example' }])

    await envStore.deleteEnvMapping('project', 'API_URL', projectDir)

    const missing = await envStore.getEnvMapping('project', 'API_URL', projectDir)
    expect(missing).toBeNull()
  })

  it('fails when project config is missing', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viber-home-'))
    const { envStore } = await loadStores(tempHome)

    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viber-missing-'))

    await expect(envStore.setEnvMapping('project', 'API_URL', 'https://example', projectDir)).rejects.toThrow(
      'No project config found'
    )
  })
})
