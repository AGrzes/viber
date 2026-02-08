import path from 'node:path'
import { findProjectConfig } from './discovery.js'
import {
  DEFAULT_PROFILE_NAME,
  FolderMappingSchema,
  ResolvedConfigSchema,
  type FolderMapping,
  type ResolvedConfig,
  type VolumeMappingsCollection,
} from './schema.js'
import { readGlobalConfig, readProjectConfig, getGlobalConfigPath } from './store.js'
import { WORKDIR } from '../utils/paths.js'
import { mergeTemplateDefinitions } from '../templates/merge.js'

function implicitMapping(cwd: string): FolderMapping {
  return FolderMappingSchema.parse({
    sourcePath: cwd,
    targetPath: WORKDIR,
    mode: 'rw',
  })
}

/**
 * Merge global and project volume mappings
 * Project mappings override global for matching keys
 */
function mergeVolumeMappings(
  globalMappings: VolumeMappingsCollection | undefined,
  projectMappings: VolumeMappingsCollection | undefined
): VolumeMappingsCollection {
  return {
    ...(globalMappings ?? {}),
    ...(projectMappings ?? {}),
  }
}

/**
 * Convert volumeMappings map to FolderMapping array
 *
 * Format: { "volumeName": "/target" } or { "volumeName": "/target:ro" }
 *         { "/source": "/target" } for bind mounts
 *
 * Key: volumeName (no /) OR sourcePath (starts with /)
 * Value: targetPath OR targetPath:mode
 */
function volumeMappingsToArray(mappings: VolumeMappingsCollection): FolderMapping[] {
  return Object.entries(mappings).map(([key, value]) => {
    // Parse value: "targetPath" or "targetPath:mode"
    const [targetPath, mode = 'rw'] = value.split(':') as [string, 'rw' | 'ro' | undefined]

    // Key starts with / = bind mount, otherwise = named volume
    const sourcePath = key

    return {
      sourcePath,
      targetPath: targetPath || sourcePath,
      mode: mode || 'rw',
    }
  })
}

export async function resolveConfig(cwd: string): Promise<ResolvedConfig> {
  const absoluteCwd = path.resolve(cwd)
  const projectConfigPath = findProjectConfig(absoluteCwd)
  const project = projectConfigPath ? await readProjectConfig(projectConfigPath) : undefined
  const global = await readGlobalConfig()
  const globalConfig = global ?? undefined
  const globalConfigPath = getGlobalConfigPath()
  const projectEnvMappings = project?.envMappings
  const globalEnvMappings = globalConfig?.envMappings

  // Legacy mappings: preserve existing behavior
  // If project.mappings exists, use it; else use defaultMappings; else use implicit workdir
  const legacyMappings =
    project?.mappings && project.mappings.length > 0
      ? project.mappings
      : globalConfig?.defaultMappings && globalConfig.defaultMappings.length > 0
        ? globalConfig.defaultMappings
        : [implicitMapping(absoluteCwd)]

  // New volumeMappings: merge global and project, convert to array
  const mergedVolumeMappings = mergeVolumeMappings(globalConfig?.volumeMappings, project?.volumeMappings)
  const volumeMappingsArray =
    Object.keys(mergedVolumeMappings).length > 0 ? volumeMappingsToArray(mergedVolumeMappings) : []

  // Combine: legacy mappings (or workdir) + volumeMappings
  // volumeMappings extend (don't replace) default behavior
  const effectiveMappings = [...legacyMappings, ...volumeMappingsArray]

  const defaultProfileName = globalConfig?.defaultImageProfile ?? DEFAULT_PROFILE_NAME
  let imageProfile: string | undefined = project?.imageProfile
  let imageReference: string | undefined = project?.imageReference

  if (!imageProfile && !imageReference) {
    imageProfile = defaultProfileName
  }

  const projectTemplates = project?.templates ?? []
  const globalTemplates = globalConfig?.templates ?? []
  const templateSet = mergeTemplateDefinitions(globalTemplates, projectTemplates)

  return ResolvedConfigSchema.parse({
    project,
    global: globalConfig,
    projectConfigPath: projectConfigPath ?? undefined,
    globalConfigPath,
    projectEnvMappings,
    globalEnvMappings,
    effectiveMappings,
    imageProfile,
    imageReference,
    defaultProfileName,
    projectTemplates,
    globalTemplates,
    templateSet,
  })
}
