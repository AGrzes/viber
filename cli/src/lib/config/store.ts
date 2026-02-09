import * as fs from 'node:fs'
import {
  GLOBAL_CONFIG_JSON_PATH,
  GLOBAL_CONFIG_YAML_PATH,
  GlobalConfigSchema,
  ProjectConfigSchema,
  type GlobalConfig,
  type ProjectConfig,
} from './schema.js'
import { findProjectConfig } from './discovery.js'
import { readConfigFile, writeConfigFile } from './format.js'

export async function readProjectConfig(configPath: string): Promise<ProjectConfig> {
  const data = await readConfigFile(configPath)
  return ProjectConfigSchema.parse(data)
}

export async function writeProjectConfig(configPath: string, config: ProjectConfig): Promise<void> {
  const normalized = ProjectConfigSchema.parse(config)
  await writeConfigFile(configPath, normalized)
}

export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  const candidates = [GLOBAL_CONFIG_YAML_PATH, GLOBAL_CONFIG_JSON_PATH]
  for (const candidate of candidates) {
    try {
      const data = await readConfigFile(candidate)
      return GlobalConfigSchema.parse(data)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') continue
      throw err
    }
  }
  return null
}

export async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  const normalized = GlobalConfigSchema.parse(config)
  await writeConfigFile(GLOBAL_CONFIG_YAML_PATH, normalized)
}

export function getGlobalConfigPath(): string {
  const candidates = [GLOBAL_CONFIG_YAML_PATH, GLOBAL_CONFIG_JSON_PATH]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return GLOBAL_CONFIG_YAML_PATH
}

export function getProjectConfigPath(startDir: string): string | null {
  return findProjectConfig(startDir)
}
