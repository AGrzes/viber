import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { processTemplates } from '../../../src/lib/templates/processor.js'

describe('template processor', () => {
  it('renders templates with parameters and env placeholders', async () => {
    const templateSet = {
      'agent-config': {
        path: '/app/config/${ENV}.json',
        template: '{"env":"{{value}}","count":{{count}}\n}',
        parameters: { value: 'staging', count: 3 },
      },
    }

    const rendered = await processTemplates({
      templateSet,
      env: { ENV: 'staging' },
    })

    expect(rendered).toHaveLength(1)
    const [file] = rendered
    expect(file.containerPath).toBe('/app/config/staging.json')

    const content = await fs.readFile(file.tempPath, 'utf8')
    expect(content).toContain('"env":"staging"')
    expect(content).toContain('"count":3')

    await fs.rm(path.dirname(file.tempPath), { recursive: true, force: true })
  })

  it('supports env helper with default values', async () => {
    const original = process.env.MODE
    delete process.env.MODE

    try {
      const templateSet = {
        config: {
          path: '/app/config.txt',
          template: 'mode={{env "MODE" "default"}}',
          parameters: {},
        },
      }

      const rendered = await processTemplates({
        templateSet,
        env: {},
      })

      const content = await fs.readFile(rendered[0].tempPath, 'utf8')
      expect(content).toContain('mode=default')

      await fs.rm(path.dirname(rendered[0].tempPath), { recursive: true, force: true })
    } finally {
      if (original === undefined) {
        delete process.env.MODE
      } else {
        process.env.MODE = original
      }
    }
  })

  it('supports json helper for primitive values', async () => {
    const templateSet = {
      config: {
        path: '/app/config.txt',
        template: 'enabled={{json enabled}},count={{json count}},name={{json name}}',
        parameters: { enabled: true, count: 5, name: 'alpha' },
      },
    }

    const rendered = await processTemplates({
      templateSet,
      env: {},
    })

    const content = await fs.readFile(rendered[0].tempPath, 'utf8')
    expect(content).toContain('enabled=true')
    expect(content).toContain('count=5')
    expect(content).toContain('name="alpha"')

    await fs.rm(path.dirname(rendered[0].tempPath), { recursive: true, force: true })
  })
})
