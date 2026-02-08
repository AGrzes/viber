import os from 'node:os'
import path from 'node:path'
import { z } from 'zod'
import { TemplateDefinitionSchema } from '../templates/types.js'

export const PROJECT_CONFIG_NAME = '.viber.json'
export const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.viber', 'config.json')
export const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

export const FolderMappingSchema = z.object({
  sourcePath: z.string().min(1),
  targetPath: z.string().optional(),
  mode: z.enum(['rw', 'ro']),
  label: z.string().optional(),
})

export const EnvMapInputSchema = z.record(
  z.string().regex(ENV_KEY_PATTERN),
  z.union([z.string(), z.null()])
)

export const EnvMapSchema = z.record(z.string().regex(ENV_KEY_PATTERN), z.string())

export const VolumeMapInputSchema = z.record(z.string().min(1), z.union([z.string().min(1), z.null()]))

export const VolumeMapSchema = z.record(z.string().min(1), z.string().min(1))

const TemplateEntryInputSchema = z.object({
  path: z.string().min(1).optional(),
  template: z.string().min(1).optional(),
  parameters: z.record(z.unknown()).optional(),
})

export const TemplateMapInputSchema = z.record(
  z.string().min(1),
  z.union([TemplateEntryInputSchema, z.null()])
)

export const TemplateMapSchema = z.record(z.string().min(1), TemplateDefinitionSchema)

export const ProfileInputSchema = z
  .object({
    inherit: z.array(z.string().min(1)).optional(),
    image: z.string().min(1).optional(),
    env: EnvMapInputSchema.optional(),
    volumes: VolumeMapInputSchema.optional(),
    templates: TemplateMapInputSchema.optional(),
  })
  .strict()

export const ProfileSchema = z
  .object({
    image: z.string().min(1).optional(),
    env: EnvMapSchema.optional(),
    volumes: VolumeMapSchema.optional(),
    templates: TemplateMapSchema.optional(),
  })
  .strict()

export const ProjectConfigSchema = ProfileInputSchema

export const GlobalConfigSchema = z
  .object({
    profiles: z.record(z.string().min(1), ProfileInputSchema),
  })
  .strict()

export const ResolvedConfigSchema = z.object({
  profile: ProfileSchema,
  effectiveMappings: z.array(FolderMappingSchema),
  projectConfigPath: z.string().optional(),
  globalConfigPath: z.string().optional(),
})

export type FolderMapping = z.infer<typeof FolderMappingSchema>
export type EnvMapInput = z.infer<typeof EnvMapInputSchema>
export type EnvMap = z.infer<typeof EnvMapSchema>
export type VolumeMapInput = z.infer<typeof VolumeMapInputSchema>
export type VolumeMap = z.infer<typeof VolumeMapSchema>
export type TemplateMapInput = z.infer<typeof TemplateMapInputSchema>
export type TemplateMap = z.infer<typeof TemplateMapSchema>
export type ProfileInput = z.infer<typeof ProfileInputSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>
export type ResolvedConfig = z.infer<typeof ResolvedConfigSchema>
