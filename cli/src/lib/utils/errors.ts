export class CliError extends Error {
  code: string
  exitCode: number

  constructor(message: string, code = 'CLI_ERROR', exitCode = 1) {
    super(message)
    this.code = code
    this.exitCode = exitCode
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof CliError) return err.message
  if (err instanceof Error) return err.message
  return String(err)
}
