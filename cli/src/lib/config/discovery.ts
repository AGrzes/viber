import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_CONFIG_NAME } from './schema.js'

export function findProjectConfig(startDir: string): string | null {
  let current = path.resolve(startDir)
  const root = path.parse(current).root

  while (true) {
    const candidate = path.join(current, PROJECT_CONFIG_NAME)
    if (fs.existsSync(candidate)) return candidate
    if (current === root) break
    current = path.dirname(current)
  }

  return null
}
