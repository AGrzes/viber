# Contracts: AGENTS.md CLI

These contracts describe CLI commands and their expected inputs/outputs. All content values are plain text.

## Global text entries

- **Set or update named text**
  - **Command**: `viber agents global set <name>`
  - **Input**: Text content (via stdin or editor flow)
  - **Output**: Success message; updated name becomes available

- **Set default name**
  - **Command**: `viber agents global default <name>`
  - **Input**: Existing name
  - **Output**: Success message; default updated

- **List names**
  - **Command**: `viber agents global list`
  - **Output**: Names and default indicator

- **Delete name**
  - **Command**: `viber agents global delete <name>`
  - **Output**: Success message; name removed

## Project text

- **Set project text**
  - **Command**: `viber agents project set`
  - **Input**: Text content (via stdin or editor flow)
  - **Output**: Success message

- **Set project default global name**
  - **Command**: `viber agents project default <name>`
  - **Input**: Existing global name
  - **Output**: Success message

- **Clear project default (explicit null)**
  - **Command**: `viber agents project default --none`
  - **Output**: Success message; no global default for project

- **Skip global**
  - **Command**: `viber agents project skip-global [on|off]`
  - **Output**: Success message; skip-global toggled

## Session selection

- **Select name for session**
  - **Command**: `viber --agents <name>`
  - **Output**: Session starts with named global text

- **Skip global for session**
  - **Command**: `viber --agents-skip-global`
  - **Output**: Session starts without global text

## Error contracts

- Requesting a non-existent name fails with a clear error and non-zero exit.
- Passing both `--agents <name>` and `--agents-skip-global` fails with a clear error.
- Editor exits non-zero or content unchanged: stored text is not updated.
