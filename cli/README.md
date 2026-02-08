# Viber CLI

Viber is a private orchestration CLI for launching containerized coding sessions.

## Configuration Files

- Project: `.viber.json` (searched upward from `--cwd` or current directory)
- Global: `~/.viber/config.json`

This is a hard-breaking config refactor. Old config shapes are not supported.

## Profile Model

All configuration is expressed as profiles. A profile is a JSON object with optional fields:

- `inherit`: array of global profile names
- `image`: non-empty string image reference (required after merge)
- `env`: map of string -> string (values support host env interpolation)
- `volumes`: map of `sourceOrVolumeName` -> `"target[:mode]"`
- `templates`: map of `name` -> template definition

Inheritance rules:

- Profiles are merged left-to-right in the `inherit` list, then the current profile overrides.
- `inherit` is stripped before merge and does not appear in resolved profiles.
- Omitted `inherit` defaults to `["default"]` if a global `default` profile exists.
- Explicit `inherit: []` means no inheritance.
- Cycles or missing profiles are hard errors.
- Map entries can be deleted by setting the entry to `null`.
- Arrays are not merged (avoid arrays when merge is desired).

## Global Config Shape

```
{
  "profiles": {
    "default": {
      "image": "example:latest"
    },
    "work": {
      "inherit": ["default"],
      "env": {
        "FOO": "bar"
      }
    }
  }
}
```

## Project Config Shape

The project config file itself is the current profile object:

```
{
  "inherit": ["work"],
  "env": {
    "PROJECT": "my-app"
  }
}
```

## Templates

`templates` is a map keyed by template name.

```
{
  "templates": {
    "agents": {
      "path": "/codex/AGENTS.md",
      "template": "# Rules\n{{#each rules}}{{this}}\n{{/each}}",
      "parameters": {
        "rules": ["Be explicit", "Prefer tests"]
      }
    }
  }
}
```

Template parameters are deep-merged across inheritance. Final merged templates must be valid.
Set a template entry to `null` to suppress it.

Template paths support env substitution (e.g. `/app/${ENV}/config.json`).

## Volumes

`volumes` uses a simple map:

- `./cache`: a relative bind mount
- `/host/path`: an absolute bind mount
- `cache-volume`: a named volume

Example:

```
{
  "volumes": {
    "./cache": "/workdir/.cache:rw",
    "node-modules": "/workdir/node_modules",
    "/opt/data": "/data:ro"
  }
}
```

## AGENTS.md (via templates)

AGENTS are generated via templates. Example template entry writes `/codex/AGENTS.md` as shown above.

## Recreating Previous Behavior

- **Auth mount**: add a volume mapping for `~/.codex/auth.json` to `/codex/auth.json`.
- **CODEX_HOME**: set in `env`, e.g. `"CODEX_HOME": "/codex"`.
- **Skills palettes**: generate skill files with templates.

## CLI Commands

- `viber config`: create `.viber.json` if missing (no-op if present).
- `viber config --global`: create global config scaffold `{"profiles": {}}`.
- `viber config --profile <name>`: set project `inherit` to `[<name>]`.
- `viber config path`: print project config path (errors if missing).
- `viber config path --global`: print global config path (errors if missing).
- `viber run`: start a session.

### Run Options

- `--cwd <path>`: starting directory for config discovery.
- `--image <ref>`: override merged profile `image`.
- `--profile <name>`: replace project `inherit` list for this run (repeatable).
- `--suppress <path>`: dot-path to null for this run (repeatable). Errors on missing path.
- `--dry-run`: print podman command instead of running.

Example:

```
viber run --profile default --profile work --suppress templates.agents --image alpine:latest
```
