import { Command } from 'commander'
import { getErrorMessage, CliError } from '../../lib/utils/errors.js'
import { openEditor } from '../../lib/utils/editor.js'
import {
  clearGlobalAgentsEntry,
  clearProjectAgents,
  clearProjectReference,
  getGlobalAgentsEntry,
  getProjectAgentsValue,
  setGlobalAgentsEntry,
  setProjectAgentsText,
  setProjectNoGlobal,
  setProjectReference,
} from '../../lib/config/agents.js'
import { parseProjectAgentsValue } from '../../lib/config/agents.js'

export function registerAgentsCommand(program: Command): void {
  const agents = program
    .command('agents')
    .description('Manage AGENTS.md content')
    .addHelpText(
      'after',
      `\nExamples:\n  viber agents edit\n  viber agents edit --global default\n  viber agents clear\n  viber agents clear --global default\n  viber agents reference default\n  viber agents reference --no-global\n`
    )

  agents
    .command('edit')
    .description('Edit project or global AGENTS text')
    .option('--global <name>', 'Edit named global entry')
    .action(async (options) => {
      try {
        if (options.global) {
          const existing = await getGlobalAgentsEntry(options.global)
          const { content, changed } = await openEditor(existing ?? '')
          if (changed) {
            await setGlobalAgentsEntry(options.global, content)
          }
          return
        }

        const existingValue = await getProjectAgentsValue()
        const parsed = parseProjectAgentsValue({ agents: existingValue })
        const { content, changed } = await openEditor(parsed.projectText ?? '')
        if (changed) {
          await setProjectAgentsText(content)
        }
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })

  agents
    .command('clear')
    .description('Clear project or global AGENTS text')
    .option('--global <name>', 'Clear named global entry')
    .action(async (options) => {
      try {
        if (options.global) {
          await clearGlobalAgentsEntry(options.global)
          return
        }
        await clearProjectAgents()
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })

  agents
    .command('reference')
    .description('Reference a global entry for this project')
    .option('--clear', 'Clear project reference')
    .option('--no-global', 'Explicitly exclude global content')
    .argument('[name]', 'Global entry name to reference')
    .action(async (name: string | undefined, options) => {
      try {
        const hasName = Boolean(name)
        const hasClear = Boolean(options.clear)
        const hasNoGlobal = Boolean(options.noGlobal)

        if ([hasName, hasClear, hasNoGlobal].filter(Boolean).length !== 1) {
          throw new CliError('Provide exactly one of <name>, --clear, or --no-global.')
        }

        if (hasClear) {
          await clearProjectReference()
          return
        }
        if (hasNoGlobal) {
          await setProjectNoGlobal()
          return
        }
        if (!name) {
          throw new CliError('Global entry name is required.')
        }
        const existing = await getGlobalAgentsEntry(name)
        if (!existing) {
          throw new CliError(`AGENTS content not found: ${name}`)
        }
        await setProjectReference(name)
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })
}
