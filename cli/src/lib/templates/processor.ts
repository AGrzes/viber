import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import Handlebars from 'handlebars'
import { CliError } from '../utils/errors.js'
import { RenderedFile, SuppressionList, TemplateDefinition } from './types.js'

type TemplateProcessorOptions = {
  templateSet: Record<string, TemplateDefinition>
  env: Record<string, string | undefined>
  suppressionList?: SuppressionList
}

export async function processTemplates(options: TemplateProcessorOptions): Promise<RenderedFile[]> {
  const { templateSet, env, suppressionList = [] } = options
  const entries = Object.values(templateSet).filter((definition) => !suppressionList.includes(definition.name))

  if (entries.length === 0) {
    return []
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'viber-template-'))
  const renderedFiles: RenderedFile[] = []

  for (const definition of entries) {
    const content = renderTemplate(definition.template, definition.parameters)
    const fileName = `${sanitizeTemplateName(definition.name)}-${crypto.randomUUID()}.tmp`
    const tempPath = path.join(tempDir, fileName)
    await fs.writeFile(tempPath, content)
    const containerPath = resolveContainerPath(definition.path, env)
    renderedFiles.push({
      templateName: definition.name,
      tempPath,
      containerPath,
    })
  }

  return renderedFiles
}

function sanitizeTemplateName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_')
}

function renderTemplate(template: string, parameters: TemplateDefinition['parameters']): string {
  const compiled = Handlebars.compile(template)
  return compiled(parameters)
}

function resolveContainerPath(rawPath: string, env: Record<string, string | undefined>): string {
  const missingVars: string[] = []

  const resolved = rawPath.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key) => {
    const value = env[key]
    if (value == null || value === '') {
      missingVars.push(key)
      return ''
    }
    return value
  })

  if (missingVars.length > 0) {
    throw new CliError(`Missing environment variables for template path: ${missingVars.join(', ')}`)
  }

  if (!path.posix.isAbsolute(resolved)) {
    throw new CliError(`Resolved template path must be absolute: ${resolved}`)
  }

  return path.posix.normalize(resolved)
}
