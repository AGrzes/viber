import fs from 'node:fs'
import path from 'node:path'

export function findUp(startDir: string, fileName: string): string | null {
  let current = path.resolve(startDir)
  const root = path.parse(current).root

  while (true) {
    const candidate = path.join(current, fileName)
    if (fs.existsSync(candidate)) return candidate
    if (current === root) break
    current = path.dirname(current)
  }

  return null
}

export function findUpWithExtensions(startDir: string, baseName: string, extensions: string[]): string | null {
  let current = path.resolve(startDir)
  const root = path.parse(current).root

  while (true) {
    for (const ext of extensions) {
      const candidate = path.join(current, `${baseName}${ext}`)
      if (fs.existsSync(candidate)) return candidate
    }
    if (current === root) break
    current = path.dirname(current)
  }

  return null
}

export function findProjectConfig(startDir: string): string | null {
  return findUpWithExtensions(startDir, '.viber', ['.yaml', '.json'])
}
