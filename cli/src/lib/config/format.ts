import fs from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'
import { CliError } from '../utils/errors.js'

export type ConfigFormat = 'json' | 'yaml'

export function detectConfigFormat(filePath: string): ConfigFormat {
  if (filePath.endsWith('.json')) return 'json'
  if (filePath.endsWith('.yaml')) return 'yaml'
  throw new CliError(`Unsupported config file extension: ${filePath}`)
}

export function parseConfigContent(filePath: string, raw: string): unknown {
  const format = detectConfigFormat(filePath)
  if (format === 'json') return JSON.parse(raw)
  return YAML.parse(raw)
}

export async function readConfigFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf-8')
  return parseConfigContent(filePath, raw)
}

export async function writeConfigFile(filePath: string, data: unknown): Promise<void> {
  const format = detectConfigFormat(filePath)
  const content = format === 'json' ? JSON.stringify(data, null, 2) : YAML.stringify(data)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content)
}
