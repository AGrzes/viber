import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const WORKDIR = '/workdir'
export const CODEX_DIR = '/codex'
export const CODEX_AUTH_TARGET = path.join(CODEX_DIR, 'auth.json')
export const CODEX_AGENTS_TARGET = path.join(CODEX_DIR, 'AGENTS.md')

export function getCodexAuthSource(): string {
  return path.join(os.homedir(), '.codex', 'auth.json')
}

export function hasCodexAuth(): boolean {
  return fs.existsSync(getCodexAuthSource())
}
