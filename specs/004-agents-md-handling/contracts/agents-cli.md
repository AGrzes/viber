# Contracts: AGENTS.md CLI

These contracts describe CLI commands and their expected inputs/outputs. All content values are plain text.

## Edit text

- **Edit global text**
  - **Command**: `viber agents edit --global <name>`
  - **Input**: Text content via editor
  - **Output**: Success message; name available for selection

- **Edit project text**
  - **Command**: `viber agents edit`
  - **Input**: Text content via editor
  - **Output**: Success message

## Clear text

- **Clear global text**
  - **Command**: `viber agents clear --global <name>`
  - **Output**: Success message; name removed

- **Clear project text**
  - **Command**: `viber agents clear`
  - **Output**: Success message

## Project reference

- **Set project reference**
  - **Command**: `viber agents reference <name>`
  - **Output**: Success message; project uses referenced global name

- **Clear project reference**
  - **Command**: `viber agents reference --clear`
  - **Output**: Success message; project reference removed

- **Explicit no-global**
  - **Command**: `viber agents reference --no-global`
  - **Output**: Success message; global content excluded for project

## Session selection

- **Select name for session**
  - **Command**: `viber --agents <name>`
  - **Output**: Session starts with named global text

- **No-global for session**
  - **Command**: `viber --agents-no-global`
  - **Output**: Session starts without global text

## Error contracts

- Requesting a non-existent name fails with a clear error and non-zero exit.
- Passing both `--agents <name>` and `--agents-no-global` fails with a clear error.
- Editor exits non-zero or content unchanged: stored text is not updated.
