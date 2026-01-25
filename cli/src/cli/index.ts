import { Command } from 'commander'
import { registerAgentsCommand } from './commands/agents.js'
import { registerConfigCommand } from './commands/config.js'
import { registerEnvCommand } from './commands/env.js'
import { registerProfilesCommand } from './commands/profiles.js'
import { registerRunCommand } from './commands/run.js'

const program = new Command()

program.name('viber').description('Private orchestration CLI').version('0.1.0').enablePositionalOptions()

registerAgentsCommand(program)
registerConfigCommand(program)
registerEnvCommand(program)
registerProfilesCommand(program)
registerRunCommand(program)

program.parseAsync(process.argv)
