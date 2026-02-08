import { resolveConfig } from '../lib/config/resolver.js'
import { validateMappings } from '../lib/config/validation.js'
import { runPodman } from '../lib/podman/runner.js'
import { CliError } from '../lib/utils/errors.js'
import { log } from '../lib/utils/log.js'
import { getHostIdentity } from '../lib/utils/identity.js'
import { WORKDIR } from '../lib/utils/paths.js'
import { buildSessionEnv } from './sessionEnv.js'
import { ProfileSchema, type FolderMapping, type Profile } from '../lib/config/schema.js'
import { processTemplates } from '../lib/templates/processor.js'

export type SessionOptions = {
  cwd: string
  command?: string[]
  image?: string
  profiles?: string[]
  dryRun?: boolean
  suppressions?: string[]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function applySuppressions(profile: Profile, suppressions: string[] = []): Profile {
  if (suppressions.length === 0) return profile

  const next = structuredClone(profile) as Record<string, unknown>

  for (const path of suppressions) {
    const parts = path.split('.').filter(Boolean)
    if (parts.length === 0) {
      throw new CliError('Invalid suppression path.')
    }

    let current: Record<string, unknown> = next
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = parts[i]
      const value = current[key]
      if (!isPlainObject(value)) {
        throw new CliError(`Suppression path not found: ${path}`)
      }
      current = value
    }

    const lastKey = parts[parts.length - 1]
    if (!(lastKey in current)) {
      throw new CliError(`Suppression path not found: ${path}`)
    }

    current[lastKey] = null
  }

  return next as Profile
}

function pruneNullEntries<T extends Record<string, unknown>>(input?: T): T | undefined {
  if (!input) return undefined
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === null) continue
    result[key] = value
  }
  return Object.keys(result).length > 0 ? (result as T) : undefined
}

function normalizeProfile(profile: Profile): Profile {
  return {
    image: profile.image,
    env: pruneNullEntries(profile.env as Record<string, unknown> | undefined) as Record<string, string> | undefined,
    volumes: pruneNullEntries(profile.volumes as Record<string, unknown> | undefined) as
      | Record<string, string>
      | undefined,
    templates: pruneNullEntries(profile.templates as Record<string, unknown> | undefined) as
      | Record<string, { path: string; template: string; parameters?: Record<string, unknown> }>
      | undefined,
  }
}

export async function runSession(options: SessionOptions): Promise<number> {
  const resolved = await resolveConfig(options.cwd, {
    profileOverrides: options.profiles && options.profiles.length > 0 ? options.profiles : undefined,
  })
  log.config('resolved config', resolved)

  const issues = validateMappings(resolved.effectiveMappings)
  if (issues.length > 0) {
    const details = issues.map((issue) => `${issue.field}: ${issue.message}`).join('; ')
    throw new CliError(`Invalid mappings: ${details}`)
  }

  let profile = resolved.profile
  if (options.image) {
    profile = { ...profile, image: options.image }
  }

  profile = applySuppressions(profile, options.suppressions)
  profile = normalizeProfile(profile)
  const validatedProfile = ProfileSchema.parse(profile)

  if (!validatedProfile.image) {
    throw new CliError('No image selected. Set image in profile or use --image.')
  }

  const identity = getHostIdentity()
  if (!identity) {
    throw new CliError('Host identity is unavailable; cannot determine UID/GID.')
  }

  const { env, extraMounts } = buildSessionEnv(validatedProfile, process.env)

  const templateFiles = await processTemplates({
    templateSet: validatedProfile.templates ?? {},
    env,
  })
  for (const file of templateFiles) {
    extraMounts.push({
      sourcePath: file.tempPath,
      targetPath: file.containerPath,
      mode: 'ro',
    })
  }

  const mappings: FolderMapping[] = resolved.effectiveMappings

  log.session('workdir', WORKDIR)
  log.env('env', env)

  return runPodman({
    imageRef: validatedProfile.image,
    interactive: true,
    mappings,
    extraMounts,
    workdir: WORKDIR,
    env,
    uid: identity.uid,
    gid: identity.gid,
    usernsMode: 'keep-id',
    dryRun: options.dryRun,
    command: options.command,
  })
}
