import { Command } from 'commander'
import { registerConfigCommand } from './commands/config.js'
import { registerRunCommand } from './commands/run.js'

const program = new Command()

program.name('viber').description('Private orchestration CLI').version('0.1.0').enablePositionalOptions()

registerConfigCommand(program)
registerRunCommand(program)

program.parseAsync(process.argv)
