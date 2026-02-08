import fs from 'node:fs/promises'
import path from 'node:path'
import {
  GLOBAL_CONFIG_PATH,
  GlobalConfigSchema,
  ProjectConfigSchema,
  type GlobalConfig,
  type ProjectConfig,
  type FolderMapping,
  type VolumeMappingsCollection,
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

/**
 * Migrate legacy mappings array to volumeMappings map format
 * @param legacyMappings - Array of FolderMapping (old format)
 * @returns VolumeMappingsCollection (new simple format)
 */
function migrateLegacyMappings(legacyMappings: FolderMapping[]): VolumeMappingsCollection {
  const result: VolumeMappingsCollection = {}

  for (const mapping of legacyMappings) {
    const targetPath = mapping.targetPath ?? mapping.sourcePath
    const mode = mapping.mode !== 'rw' ? `:${mapping.mode}` : ''
    result[mapping.sourcePath] = `${targetPath}${mode}`
  }

  return result
}

/**
 * Emit deprecation warning for legacy mappings format
 * @param configPath - Path to config file using legacy format
 */
function warnLegacyMappings(configPath: string): void {
  console.warn(
    `DEPRECATION: ${configPath} uses legacy "mappings" array format. ` +
      `Please migrate to "volumeMappings" object format. ` +
      `Auto-migration will occur on next config write.`
  )
}

export async function readProjectConfig(configPath: string): Promise<ProjectConfig> {
  const data = await readJson(configPath)
  const config = ProjectConfigSchema.parse(data)

  // Detect legacy format and warn
  if (config.mappings && Array.isArray(config.mappings)) {
    warnLegacyMappings(configPath)
  }

  return config
}

export async function writeProjectConfig(configPath: string, config: ProjectConfig): Promise<void> {
  let finalConfig = { ...config }

  // Migration: Convert legacy mappings to volumeMappings on write
  if (finalConfig.mappings && Array.isArray(finalConfig.mappings)) {
    const migratedMappings = migrateLegacyMappings(finalConfig.mappings)

    // Merge with existing volumeMappings (if any)
    finalConfig.volumeMappings = {
      ...migratedMappings,
      ...(finalConfig.volumeMappings ?? {}),
    }

    // Remove legacy field
    delete finalConfig.mappings
  }

  const normalized: ProjectConfig = {
    ...finalConfig,
    imageProfile: finalConfig.imageProfile || undefined,
    imageReference: finalConfig.imageReference || undefined,
    envMappings: finalConfig.envMappings?.map((entry) => ({
      key: entry.key,
      value: entry.value,
    })),
    volumeMappings: finalConfig.volumeMappings,
  }

  await writeJson(configPath, ProjectConfigSchema.parse(normalized))
}

export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    const data = await readJson(GLOBAL_CONFIG_PATH)
    const config = GlobalConfigSchema.parse(data)

    // Detect legacy format and warn
    if (config.defaultMappings && Array.isArray(config.defaultMappings)) {
      warnLegacyMappings(GLOBAL_CONFIG_PATH)
    }

    return config
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

export async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  let finalConfig = { ...config }

  // Migration: Convert legacy defaultMappings to volumeMappings on write
  if (finalConfig.defaultMappings && Array.isArray(finalConfig.defaultMappings)) {
    const migratedMappings = migrateLegacyMappings(finalConfig.defaultMappings)

    // Merge with existing volumeMappings (if any)
    finalConfig.volumeMappings = {
      ...migratedMappings,
      ...(finalConfig.volumeMappings ?? {}),
    }

    // Remove legacy field
    delete finalConfig.defaultMappings
  }

  const normalized: GlobalConfig = {
    ...finalConfig,
    envMappings: finalConfig.envMappings?.map((entry) => ({
      key: entry.key,
      value: entry.value,
    })),
    volumeMappings: finalConfig.volumeMappings,
  }

  await writeJson(GLOBAL_CONFIG_PATH, GlobalConfigSchema.parse(normalized))
}

export function getGlobalConfigPath(): string {
  return GLOBAL_CONFIG_PATH
}

export function getProjectConfigPath(startDir: string): string | null {
  return findProjectConfig(startDir)
}
