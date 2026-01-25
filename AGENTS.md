# Env
You are in container so this mean
- You can go to town - you can not break anything important
- If you need new os level tools then let user know to update container image as in session installation will be lost on next start

# Process
After any change do git commit - try to explain changes but the fact of committing history is most important
Before any change commit the current state if there are uncommited changes.
# Formatting
- Use Prettier as the reference formatter; run `pnpm -C cli format` to apply and `pnpm -C cli format:check` (or `pnpm -C cli lint`) to verify.
# Rules
- Do not modify AGENTS.md unless explicitly asked by user

## Active Technologies
- TypeScript targeting Node.js 20 runtime used by the CLI tool. + Existing CLI supporting libraries plus `handlebars` (or equivalent template engine) for deterministic rendering. (005-container-file-templates)
- N/A (short-lived temporary files only). (005-container-file-templates)

## Recent Changes
- 005-container-file-templates: Added TypeScript targeting Node.js 20 runtime used by the CLI tool. + Existing CLI supporting libraries plus `handlebars` (or equivalent template engine) for deterministic rendering.
