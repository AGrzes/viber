import path from 'node:path'
import fs from 'node:fs'
import { Command } from 'commander'
import { findProjectConfig } from '../../lib/config/discovery.js'
import { PROJECT_CONFIG_NAME } from '../../lib/config/schema.js'
import {
  getGlobalConfigPath,
  readGlobalConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from '../../lib/config/store.js'
import { CliError, getErrorMessage } from '../../lib/utils/errors.js'

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('Create or update project configuration')
    .option('--cwd <path>', 'Working directory to resolve config', process.cwd())
    .option('--global', 'Create global config if missing')
    .option('--profile <name>', 'Set inherit profile for project config')

  config
    .command('path')
    .description('Print config path')
    .option('--cwd <path>', 'Working directory to resolve config', process.cwd())
    .option('-g, --global', 'Print global config path')
    .action(async (options) => {
      try {
        if (options.global) {
          const globalPath = getGlobalConfigPath()
          if (!fs.existsSync(globalPath)) {
            throw new CliError('Global config not found.')
          }
          console.log(globalPath)
          return
        }

        const configPath = findProjectConfig(options.cwd)
        if (!configPath) {
          throw new CliError('Project config not found.')
        }
        console.log(configPath)
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })

  config.action(async (options) => {
    try {
      if (options.profile && options.global) {
        throw new CliError('--profile cannot be used with --global')
      }

      if (options.global) {
        const existing = await readGlobalConfig()
        if (existing) return
        await writeGlobalConfig({ profiles: {} })
        return
      }

      const cwd = options.cwd as string
      const existing = findProjectConfig(cwd)
      const configPath = existing ?? path.join(cwd, PROJECT_CONFIG_NAME)

      if (options.profile) {
        const global = await readGlobalConfig()
        if (!global || !global.profiles?.[options.profile]) {
          throw new CliError(`Profile not found: ${options.profile}`)
        }
        await writeProjectConfig(configPath, { inherit: [options.profile] })
        return
      }

      if (existing) return
      await writeProjectConfig(configPath, {})
    } catch (err) {
      console.error(getErrorMessage(err))
      process.exitCode = 1
    }
  })
}
