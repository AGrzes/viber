import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import Handlebars from 'handlebars'
import { CliError } from '../utils/errors.js'
import { substituteEnv } from '../utils/envSubst.js'
import { RenderedFile, TemplateDefinition } from './types.js'

type TemplateProcessorOptions = {
  templateSet: Record<string, TemplateDefinition>
  env: Record<string, string | undefined>
}

export async function processTemplates(options: TemplateProcessorOptions): Promise<RenderedFile[]> {
  const { templateSet, env } = options
  const entries = Object.entries(templateSet)

  if (entries.length === 0) {
    return []
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'viber-template-'))
  const renderedFiles: RenderedFile[] = []

  for (const [name, definition] of entries) {
    const content = renderTemplate(definition.template, definition.parameters)
    const fileName = `${sanitizeTemplateName(name)}-${crypto.randomUUID()}.tmp`
    const tempPath = path.join(tempDir, fileName)
    await fs.writeFile(tempPath, content)
    const containerPath = substituteEnv(definition.path, env)
    renderedFiles.push({
      templateName: name,
      tempPath,
      containerPath,
    })
  }

  return renderedFiles
}

function sanitizeTemplateName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_')
}

function buildHandlebars(): typeof Handlebars {
  const instance = Handlebars.create()
  instance.registerHelper('env', (...args: unknown[]) => {
    const name = typeof args[0] === 'string' ? args[0] : ''
    const fallback = typeof args[1] === 'string' ? args[1] : ''
    const value = name ? process.env[name] : undefined
    return value ?? fallback ?? ''
  })
  instance.registerHelper('json', (value: unknown) => new Handlebars.SafeString(JSON.stringify(value)))
  return instance
}

export function renderTemplate(template: string, parameters?: Record<string, unknown>): string {
  const compiled = buildHandlebars().compile(template)
  return compiled(parameters ?? {})
}
