import { type FolderMapping, type VolumeMap } from '../config/schema.js'

export function volumeMappingsToArray(mappings: VolumeMap): FolderMapping[] {
  return Object.entries(mappings).map(([key, value]) => {
    const [targetPath, mode = 'rw'] = value.split(':') as [string, 'rw' | 'ro' | undefined]

    return {
      sourcePath: key,
      targetPath: targetPath || key,
      mode: mode || 'rw',
    }
  })
}
