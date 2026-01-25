import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { CliError } from './errors.js'

export type EditorResult = {
  content: string
  changed: boolean
}

function resolveEditor(): string {
  return process.env.VISUAL || process.env.EDITOR || ''
}

export async function openEditor(initialContent: string): Promise<EditorResult> {
  const editor = resolveEditor()
  if (!editor) {
    throw new CliError('No editor configured. Set $VISUAL or $EDITOR.')
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'viber-edit-'))
  const filePath = path.join(dir, 'AGENTS.md')
  await fs.writeFile(filePath, initialContent, 'utf-8')

  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(editor, [filePath], { stdio: 'inherit' })
    child.on('error', (err) => reject(err))
    child.on('exit', (code) => resolve(code ?? 1))
  })

  if (exitCode !== 0) {
    throw new CliError('Editor exited with a non-zero status.')
  }

  const nextContent = await fs.readFile(filePath, 'utf-8')
  const changed = nextContent !== initialContent
  return { content: nextContent, changed }
}
