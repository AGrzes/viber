import { Command } from 'commander'
import prompts from 'prompts'
import { getErrorMessage } from '../../lib/utils/errors.js'
import { deleteProfile, listProfiles, upsertProfile } from '../../services/profiles.js'

export function registerProfilesCommand(program: Command): void {
  const profiles = program.command('profiles').description('Manage image profiles')

  profiles
    .command('list')
    .description('List image profiles')
    .action(async () => {
      try {
        const items = await listProfiles()
        if (items.length === 0) {
          console.log('No image profiles defined.')
          return
        }
        for (const profile of items) {
          console.log(`${profile.name}: ${profile.baseImageRef}`)
        }
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })

  profiles
    .command('add')
    .description('Create or update an image profile')
    .action(async () => {
      try {
        const response = await prompts([
          {
            type: 'text',
            name: 'name',
            message: 'Profile name',
            validate: (value) => (value ? true : 'name is required'),
          },
          {
            type: 'text',
            name: 'baseImageRef',
            message: 'Base image reference',
            validate: (value) => (value ? true : 'base image is required'),
          },
          {
            type: 'text',
            name: 'notes',
            message: 'Notes (optional)',
          },
        ])

        await upsertProfile({
          name: response.name,
          baseImageRef: response.baseImageRef,
          notes: response.notes || undefined,
        })
        console.log(`Saved profile: ${response.name}`)
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })

  profiles
    .command('delete')
    .description('Delete an image profile')
    .argument('<name>', 'Profile name')
    .action(async (name: string) => {
      try {
        await deleteProfile(name)
        console.log(`Deleted profile: ${name}`)
      } catch (err) {
        console.error(getErrorMessage(err))
        process.exitCode = 1
      }
    })
}
