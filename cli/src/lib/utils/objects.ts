export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function mergeObjects<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
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

export function pruneNullEntries<T extends Record<string, unknown>>(input: T | undefined): T | undefined {
  if (!input) return undefined
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === null) continue
    result[key] = value
  }
  return Object.keys(result).length > 0 ? (result as T) : undefined
}
