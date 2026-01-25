import path from 'node:path'
import { Command } from 'commander'
import { findProjectConfig } from '../../lib/config/discovery.js'
import { PROJECT_CONFIG_NAME } from '../../lib/config/schema.js'
import { writeProjectConfig } from '../../lib/config/store.js'
import { getErrorMessage } from '../../lib/utils/errors.js'
import { runConfigWizard } from '../../services/configWizard.js'

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('Create or update project configuration')
    .option('--cwd <path>', 'Working directory to resolve config', process.cwd())
    .action(async (options) => {
      try {
        const cwd = options.cwd as string
        const existing = findProjectConfig(cwd)
        const configPath = existing ?? path.join(cwd, PROJECT_CONFIG_NAME)
        const config = await runConfigWizard()
        await writeProjectConfig(configPath, config)
        console.log(`Saved config: ${configPath}`)
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })
}
