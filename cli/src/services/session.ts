import path from 'node:path'
import { resolveConfig } from '../lib/config/resolver.js'
import { validateMappings } from '../lib/config/validation.js'
import { runPodman } from '../lib/podman/runner.js'
import { CliError } from '../lib/utils/errors.js'
import { log } from '../lib/utils/log.js'
import { getHostIdentity } from '../lib/utils/identity.js'
import { WORKDIR } from '../lib/utils/paths.js'
import { buildSessionEnv } from './sessionEnv.js'
import { ProfileSchema, type FolderMapping, type Profile } from '../lib/config/schema.js'
import { TemplateDefinitionSchema } from '../lib/templates/types.js'
import { isPlainObject, pruneNullEntries } from '../lib/utils/objects.js'
import { processTemplates, renderTemplate } from '../lib/templates/processor.js'
import { volumeMappingsToArray } from '../lib/utils/volumes.js'

export type SessionOptions = {
  cwd: string
  command?: string[]
  image?: string
  profiles?: string[]
  dryRun?: boolean
  suppressions?: string[]
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

function normalizeProfile(profile: Profile): Profile {
  const templates = pruneNullEntries(profile.templates as Record<string, unknown> | undefined)
  const normalizedTemplates: Record<string, unknown> | undefined = templates
    ? Object.fromEntries(
        Object.entries(templates).map(([name, definition]) => [name, TemplateDefinitionSchema.parse(definition)])
      )
    : undefined

  return {
    image: profile.image,
    env: pruneNullEntries(profile.env as Record<string, unknown> | undefined) as Record<string, string> | undefined,
    volumes: pruneNullEntries(profile.volumes as Record<string, unknown> | undefined) as
      | Record<string, string>
      | undefined,
    templates: normalizedTemplates as
      | Record<string, { path: string; template: string; parameters: Record<string, unknown> }>
      | undefined,
  }
}

function applyRuntimeTemplating(profile: Profile): Profile {
  const templatedEnv: Record<string, string> | undefined = profile.env
    ? Object.fromEntries(Object.entries(profile.env).map(([key, value]) => [key, renderTemplate(value)]))
    : undefined

  const templatedVolumes: Record<string, string> | undefined = profile.volumes
    ? Object.fromEntries(
        Object.entries(profile.volumes).map(([key, value]) => [renderTemplate(key), renderTemplate(value)])
      )
    : undefined

  return {
    ...profile,
    image: profile.image ? renderTemplate(profile.image) : profile.image,
    env: templatedEnv,
    volumes: templatedVolumes,
  }
}

export async function runSession(options: SessionOptions): Promise<number> {
  const resolved = await resolveConfig(options.cwd, {
    profileOverrides: options.profiles && options.profiles.length > 0 ? options.profiles : undefined,
  })
  log.config('resolved config', resolved)

  let profile = resolved.profile
  if (options.image) {
    profile = { ...profile, image: options.image }
  }

  profile = applySuppressions(profile, options.suppressions)
  profile = normalizeProfile(profile)
  profile = applyRuntimeTemplating(profile)
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

  const cwd = path.resolve(options.cwd)
  const mappings: FolderMapping[] = [
    {
      sourcePath: cwd,
      targetPath: WORKDIR,
      mode: 'rw',
    },
    ...(validatedProfile.volumes ? volumeMappingsToArray(validatedProfile.volumes) : []),
  ]

  const issues = validateMappings(mappings)
  if (issues.length > 0) {
    const details = issues.map((issue) => `${issue.field}: ${issue.message}`).join('; ')
    throw new CliError(`Invalid mappings: ${details}`)
  }

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
