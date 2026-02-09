import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { findProjectConfig, findUp } from '../../../src/lib/config/discovery.js'
import { PROJECT_CONFIG_NAME } from '../../../src/lib/config/schema.js'

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'viber-discovery-'))
}

function cleanupTempDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true })
}

describe('findProjectConfig', () => {
  it('finds config in the starting directory', () => {
    const tempDir = makeTempDir()
    try {
      const configPath = path.join(tempDir, PROJECT_CONFIG_NAME)
      fs.writeFileSync(configPath, JSON.stringify({ image: 'example:latest' }))

      expect(findProjectConfig(tempDir)).toBe(configPath)
    } finally {
      cleanupTempDir(tempDir)
    }
  })

  it('walks up to find a parent config', () => {
    const tempDir = makeTempDir()
    try {
      const parentConfig = path.join(tempDir, PROJECT_CONFIG_NAME)
      fs.writeFileSync(parentConfig, JSON.stringify({ image: 'example:latest' }))

      const childDir = path.join(tempDir, 'nested', 'child')
      fs.mkdirSync(childDir, { recursive: true })

      expect(findProjectConfig(childDir)).toBe(parentConfig)
    } finally {
      cleanupTempDir(tempDir)
    }
  })

  it('returns null when no config is found', () => {
    const tempDir = makeTempDir()
    try {
      const childDir = path.join(tempDir, 'nested')
      fs.mkdirSync(childDir, { recursive: true })

      expect(findProjectConfig(childDir)).toBeNull()
    } finally {
      cleanupTempDir(tempDir)
    }
  })
})

describe('findUp', () => {
  it('finds an arbitrary filename in ancestor directories', () => {
    const tempDir = makeTempDir()
    try {
      const marker = path.join(tempDir, 'package.json')
      fs.writeFileSync(marker, JSON.stringify({ name: 'viber-test' }))

      const childDir = path.join(tempDir, 'nested')
      fs.mkdirSync(childDir, { recursive: true })

      expect(findUp(childDir, 'package.json')).toBe(marker)
    } finally {
      cleanupTempDir(tempDir)
    }
  })
})
