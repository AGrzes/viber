import { Command } from 'commander'
import { runSession } from '../../services/session.js'
import { getErrorMessage } from '../../lib/utils/errors.js'

export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Run a one-off AGENTS session')
    .option('--cwd <path>', 'Working directory to resolve config', process.cwd())
    .option('--image <ref>', 'Direct image reference to use')
    .option('--profile <name>', 'Image profile name to use')
    .option('--agents <name>', 'Named global agents entry to use')
    .option('--agents-no-global', 'Disable global agents for this session')
    .option(
      '--suppress <template>',
      'Template name to skip rendering/mounting for this run (can be repeated)',
      (value: string, previous: string[] = []) => {
        return [...previous, value]
      },
      [] as string[]
    )
    .option('--dry-run', 'Print podman command without running')
    .allowUnknownOption(true)
    .passThroughOptions()
    .action(async (options, command) => {
      try {
        const passthrough = (command.args ?? []).filter((arg: string) => arg !== '--')

        const exitCode = await runSession({
          cwd: options.cwd,
          imageReference: options.image,
          imageProfile: options.profile,
          dryRun: Boolean(options.dryRun),
          command: passthrough.length > 0 ? passthrough : undefined,
          agents: options.agents,
          agentsNoGlobal: Boolean(options.agentsNoGlobal),
          templateSuppressions: options.suppress ?? [],
        })
        process.exitCode = exitCode
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })
}
