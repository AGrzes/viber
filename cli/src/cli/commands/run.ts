import { Command } from 'commander'
import { runSession } from '../../services/session.js'
import { getErrorMessage } from '../../lib/utils/errors.js'

export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Run a one-off AGENTS session')
    .option('--cwd <path>', 'Working directory to resolve config', process.cwd())
    .option('--image <ref>', 'Direct image reference to use')
    .option(
      '--profile <name>',
      'Profile name to inherit for this run (can be repeated)',
      (value: string, previous: string[] = []) => [...previous, value],
      [] as string[]
    )
    .option(
      '--suppress <path>',
      'Dot-path in config to null for this run (can be repeated)',
      (value: string, previous: string[] = []) => [...previous, value],
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
          image: options.image,
          profiles: options.profile,
          dryRun: Boolean(options.dryRun),
          command: passthrough.length > 0 ? passthrough : undefined,
          suppressions: options.suppress ?? [],
        })
        process.exitCode = exitCode
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })
}
