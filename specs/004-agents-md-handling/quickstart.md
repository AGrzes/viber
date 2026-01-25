# Quickstart: AGENTS.md Handling

## Set global agent content

- Create or update a named global entry:
  - `viber agents global set <name>`
- Set the global default:
  - `viber agents global default <name>`

## Set project agent content

- Set project content for the current repo:
  - `viber agents project set`

## Select active global content for a session

- Use a specific global entry for this run:
  - `viber --agents <name>`
- Skip global content entirely:
  - `viber --agents-skip-global`

## Configure project defaults

- Set a project default global entry:
  - `viber agents project default <name>`
- Explicitly opt out of any global default for the project:
  - `viber agents project default --none`

## Edit content in your editor

- Edit a named global entry:
  - `viber agents global edit <name>`
- Edit project content:
  - `viber agents project edit`

## Notes

- Global content is applied before project content.
- If no global or project content is configured, no AGENTS.md is created for the session.
- Conflicting CLI flags (select name + skip global) fail with a clear error.
