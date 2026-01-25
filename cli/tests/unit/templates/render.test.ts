import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { processTemplates } from '../../../src/lib/templates/processor.js'

describe('template processor', () => {
  it('renders templates with parameters and env placeholders', async () => {
    const templateSet = {
      'agent-config': {
        name: 'agent-config',
        path: '/app/config/${ENV}.json',
        template: '{"env":"{{env}}","count":{{count}}\n}',
        parameters: { env: 'staging', count: 3 },
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
})
