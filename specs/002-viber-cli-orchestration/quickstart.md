# Quickstart: Viber CLI Private Orchestration Framework

## Prerequisites
- Node.js 25
- Podman installed and available on PATH

## Local Setup

```bash
pnpm install
```

## Run Tests

```bash
pnpm --filter viber-cli vitest
```

## Run the CLI (development)

```bash
pnpm --filter viber-cli dev -- --help
```

## Example Flows

### Initialize a project config

```bash
pnpm --filter viber-cli dev -- config
```

### Start an interactive session

```bash
pnpm --filter viber-cli dev -- start
```

### Run a one-off session with a direct image reference

```bash
pnpm --filter viber-cli dev -- run --image docker.io/library/node:25
```

### Manage image profiles

```bash
pnpm --filter viber-cli dev -- profiles list
pnpm --filter viber-cli dev -- profiles add
```

## Notes
- If no project config is found, the CLI uses global defaults and maps the current directory.
- Missing image profiles are treated as errors.
