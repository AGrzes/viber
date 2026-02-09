import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ProfileInputSchema, type ProfileInput } from './schema.js'
import { CliError } from '../utils/errors.js'

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

async function findPackageRoot(startDir: string): Promise<string> {
  let current = path.resolve(startDir)
  const root = path.parse(current).root

  while (true) {
    const candidate = path.join(current, 'package.json')
    try {
      await fs.access(candidate)
      return current
    } catch {
      // continue searching upwards
    }
    if (current === root) break
    current = path.dirname(current)
  }

  throw new CliError('Could not locate package root for provided profiles.')
}

async function getPackageRoot(): Promise<string> {
  if (packageRootCache) return packageRootCache
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const root = await findPackageRoot(currentDir)
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
  const root = await getPackageRoot()
  const filePath = path.resolve(root, 'profiles', `${reference}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as unknown
    return ProfileInputSchema.parse(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new CliError(`Failed to load provided profile "${reference}": ${message}`)
  }
})
