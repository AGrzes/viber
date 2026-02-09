import { z } from 'zod'

export const TemplateDefinitionSchema = z.object({
  path: z.string().min(1),
  template: z.string().min(1),
  parameters: z.record(z.unknown()).optional(),
})

export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>

export type TemplateSet = Record<string, TemplateDefinition>

export type RenderedFile = {
  templateName: string
  tempPath: string
  containerPath: string
}
