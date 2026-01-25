import { z } from 'zod'

export const TemplateDefinitionSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  template: z.string().min(1),
  parameters: z.record(z.unknown()).default({}),
})

export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>

export type TemplateSet = Record<string, TemplateDefinition>

export type SuppressionList = string[]

export type RenderedFile = {
  templateName: string
  tempPath: string
  containerPath: string
}
