import path from 'node:path'
import { findProjectConfig } from './discovery.js'
import {
  FolderMappingSchema,
  ResolvedConfigSchema,
  type FolderMapping,
  type GlobalConfig,
  type Profile,
  type ProfileInput,
  type ResolvedConfig,
  type TemplateMapInput,
  type VolumeMap,
} from './schema.js'
import { readGlobalConfig, readProjectConfig, getGlobalConfigPath } from './store.js'
import { WORKDIR } from '../utils/paths.js'
import { CliError } from '../utils/errors.js'

function implicitMapping(cwd: string): FolderMapping {
  return FolderMappingSchema.parse({
    sourcePath: cwd,
    targetPath: WORKDIR,
    mode: 'rw',
  })
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function mergeObjects<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    if (value === null) {
      delete result[key]
      continue
    }

    const existing = result[key]
    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = mergeObjects(existing, value)
      continue
    }

    result[key] = value
  }

  return result as T
}

function stripInherit(profile: ProfileInput): Omit<ProfileInput, 'inherit'> {
  const { inherit: _inherit, ...rest } = profile
  return rest
}

function resolveInheritList(profile: ProfileInput, hasDefault: boolean, isDefaultProfile: boolean): string[] {
  if (Array.isArray(profile.inherit)) {
    return profile.inherit
  }
  if (hasDefault && !isDefaultProfile) {
    return ['default']
  }
  return []
}

function resolveGlobalProfile(
  name: string,
  profiles: Record<string, ProfileInput>,
  stack: string[] = []
): ProfileInput {
  const profile = profiles[name]
  if (!profile) {
    throw new CliError(`Profile not found: ${name}`)
  }

  if (stack.includes(name)) {
    throw new CliError(`Profile inheritance cycle detected: ${[...stack, name].join(' -> ')}`)
  }

  const hasDefault = Object.prototype.hasOwnProperty.call(profiles, 'default')
  const inheritList = resolveInheritList(profile, hasDefault, name === 'default')

  const nextStack = [...stack, name]
  let merged: Record<string, unknown> = {}

  for (const inheritName of inheritList) {
    const resolved = resolveGlobalProfile(inheritName, profiles, nextStack)
    merged = mergeObjects(merged, stripInherit(resolved))
  }

  merged = mergeObjects(merged, stripInherit(profile))

  return merged as ProfileInput
}

function resolveProfileFromList(
  inheritList: string[],
  profiles: Record<string, ProfileInput>,
  baseProfile: ProfileInput
): ProfileInput {
  let merged: Record<string, unknown> = {}

  for (const inheritName of inheritList) {
    const resolved = resolveGlobalProfile(inheritName, profiles)
    merged = mergeObjects(merged, stripInherit(resolved))
  }

  merged = mergeObjects(merged, stripInherit(baseProfile))
  return merged as ProfileInput
}

function pruneNullEntries<T extends Record<string, unknown>>(input: T | undefined): T | undefined {
  if (!input) return undefined
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === null) continue
    result[key] = value
  }
  return Object.keys(result).length > 0 ? (result as T) : undefined
}

function normalizeProfile(profile: ProfileInput): Profile {
  return {
    image: profile.image,
    env: pruneNullEntries(profile.env as Record<string, unknown> | undefined) as Record<string, string> | undefined,
    volumes: pruneNullEntries(profile.volumes as VolumeMap | undefined),
    templates: pruneNullEntries(profile.templates as TemplateMapInput | undefined),
  }
}

function volumeMappingsToArray(mappings: VolumeMap): FolderMapping[] {
  return Object.entries(mappings).map(([key, value]) => {
    const [targetPath, mode = 'rw'] = value.split(':') as [string, 'rw' | 'ro' | undefined]

    return {
      sourcePath: key,
      targetPath: targetPath || key,
      mode: mode || 'rw',
    }
  })
}

export type ResolveConfigOptions = {
  profileOverrides?: string[]
}

export async function resolveConfig(cwd: string, options: ResolveConfigOptions = {}): Promise<ResolvedConfig> {
  const absoluteCwd = path.resolve(cwd)
  const projectConfigPath = findProjectConfig(absoluteCwd)
  const project = projectConfigPath ? await readProjectConfig(projectConfigPath) : undefined
  const global = (await readGlobalConfig()) ?? ({ profiles: {} } as GlobalConfig)
  const globalConfigPath = getGlobalConfigPath()

  const profiles = global.profiles ?? {}
  const hasDefault = Object.prototype.hasOwnProperty.call(profiles, 'default')

  const hasOverrides = Boolean(options.profileOverrides && options.profileOverrides.length > 0)
  const inheritList = hasOverrides
    ? (options.profileOverrides ?? [])
    : resolveInheritList(project ?? {}, hasDefault, false)

  const baseProfile = project ?? {}
  const mergedProfileInput = resolveProfileFromList(inheritList, profiles, baseProfile)
  const mergedProfile = normalizeProfile(mergedProfileInput)

  const effectiveMappings: FolderMapping[] = [implicitMapping(absoluteCwd)]
  if (mergedProfile.volumes) {
    effectiveMappings.push(...volumeMappingsToArray(mergedProfile.volumes))
  }

  return ResolvedConfigSchema.parse({
    profile: mergedProfile,
    effectiveMappings,
    projectConfigPath: projectConfigPath ?? undefined,
    globalConfigPath,
  })
}
