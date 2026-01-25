import fs from 'node:fs/promises'
import path from 'node:path'
import {
  GLOBAL_CONFIG_PATH,
  GlobalConfigSchema,
  ProjectConfigSchema,
  type GlobalConfig,
  type ProjectConfig,
} from './schema.js'
import { findProjectConfig } from './discovery.js'

async function readJson(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(raw)
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export async function readProjectConfig(configPath: string): Promise<ProjectConfig> {
  const data = await readJson(configPath)
  return ProjectConfigSchema.parse(data)
}

export async function writeProjectConfig(configPath: string, config: ProjectConfig): Promise<void> {
  const normalized: ProjectConfig = {
    ...config,
    imageProfile: config.imageProfile || undefined,
    imageReference: config.imageReference || undefined,
    envMappings: config.envMappings?.map((entry) => ({
      key: entry.key,
      value: entry.value,
    })),
    mappings: config.mappings?.map((mapping) => ({
      ...mapping,
      targetPath: mapping.targetPath || mapping.sourcePath,
      label: mapping.label || undefined,
    })),
  }

  await writeJson(configPath, ProjectConfigSchema.parse(normalized))
}

export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    const data = await readJson(GLOBAL_CONFIG_PATH)
    return GlobalConfigSchema.parse(data)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

export async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  const normalized: GlobalConfig = {
    ...config,
    envMappings: config.envMappings?.map((entry) => ({
      key: entry.key,
      value: entry.value,
    })),
  }
  await writeJson(GLOBAL_CONFIG_PATH, GlobalConfigSchema.parse(normalized))
}

export function getGlobalConfigPath(): string {
  return GLOBAL_CONFIG_PATH
}

export function getProjectConfigPath(startDir: string): string | null {
  return findProjectConfig(startDir)
}
