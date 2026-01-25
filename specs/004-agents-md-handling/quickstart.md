# Quickstart: AGENTS.md Handling

## Edit global or project text (plain text)

- Edit a named global entry:
  - `viber agents edit --global <name>`
- Edit project text:
  - `viber agents edit`

## Clear text

- Clear a named global entry:
  - `viber agents clear --global <name>`
- Clear project text:
  - `viber agents clear`

## Select active global text for a session

- Use a specific global entry for this run:
  - `viber --agents <name>`
- Skip global content entirely:
  - `viber --agents-no-global`

## Configure project reference

- Set a project reference to a global entry:
  - `viber agents reference <name>`
- Clear project reference:
  - `viber agents reference --clear`
- Explicitly exclude global content for this project:
  - `viber agents reference --no-global`

## Notes

- Global content is applied before project content.
- If no global or project content is configured, no AGENTS.md is created for the session.
- Conflicting CLI flags (select name + no-global) fail with a clear error.
- Content values are stored as raw text without special formatting.
- The global default is the entry named `default` (if it exists).
