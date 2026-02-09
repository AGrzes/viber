import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ProfileInputSchema, type ProfileInput } from './schema.js'
import { CliError } from '../utils/errors.js'
import { findUp } from './discovery.js'
import { readConfigFile } from './format.js'

export type ProfileSchemaHandler = (reference: string, profiles: Record<string, ProfileInput>) => Promise<ProfileInput>

const schemaHandlers = new Map<string, ProfileSchemaHandler>()
let packageRootCache: string | null = null

function parseProfileReference(reference: string): { schema?: string; name: string } {
  const separatorIndex = reference.indexOf(':')
  if (separatorIndex === -1) {
    return { name: reference }
  }

  const schema = reference.slice(0, separatorIndex).trim()
  const name = reference.slice(separatorIndex + 1).trim()
  if (!schema || !name) {
    throw new CliError(`Invalid profile reference: ${reference}`)
  }

  return { schema, name }
}

function getPackageRoot(): string {
  if (packageRootCache) return packageRootCache
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const packagePath = findUp(currentDir, 'package.json')
  if (!packagePath) {
    throw new CliError('Could not locate package root for provided profiles.')
  }
  const root = path.dirname(packagePath)
  packageRootCache = root
  return root
}

export function registerProfileSchemaHandler(schema: string, handler: ProfileSchemaHandler): void {
  const key = schema.trim()
  if (!key) {
    throw new CliError('Profile schema name cannot be empty.')
  }
  schemaHandlers.set(key, handler)
}

export async function findProfileByName(
  reference: string,
  profiles: Record<string, ProfileInput>
): Promise<ProfileInput> {
  const parsed = parseProfileReference(reference)

  if (!parsed.schema) {
    const profile = profiles[parsed.name]
    if (!profile) {
      throw new CliError(`Profile not found: ${parsed.name}`)
    }
    return profile
  }

  const handler = schemaHandlers.get(parsed.schema)
  if (!handler) {
    throw new CliError(`Unknown profile schema: ${parsed.schema}`)
  }

  return handler(parsed.name, profiles)
}

registerProfileSchemaHandler('provided', async (reference) => {
  const root = getPackageRoot()
  const yamlPath = path.resolve(root, 'profiles', `${reference}.yaml`)
  const jsonPath = path.resolve(root, 'profiles', `${reference}.json`)
  let filePath: string | null = null
  try {
    await fs.access(yamlPath)
    filePath = yamlPath
  } catch {
    // ignore
  }
  if (!filePath) {
    try {
      await fs.access(jsonPath)
      filePath = jsonPath
    } catch {
      // ignore
    }
  }

  if (!filePath) {
    throw new CliError(`Failed to load provided profile "${reference}": file not found`)
  }
  try {
    const parsed = await readConfigFile(filePath)
    return ProfileInputSchema.parse(parsed as unknown)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new CliError(`Failed to load provided profile "${reference}": ${message}`)
  }
})
