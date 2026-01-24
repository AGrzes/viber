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
pnpm vitest
```

## Run the CLI (development)

```bash
pnpm exec tsx src/cli/index.ts --help
```

## Example Flows

### Initialize a project config

```bash
pnpm exec tsx src/cli/index.ts init
```

### Start an interactive session

```bash
pnpm exec tsx src/cli/index.ts start
```

### Run a one-off session with a direct image reference

```bash
pnpm exec tsx src/cli/index.ts run --image docker.io/library/node:25
```

### Manage image profiles

```bash
pnpm exec tsx src/cli/index.ts profiles list
pnpm exec tsx src/cli/index.ts profiles add
```

## Notes
- If no project config is found, the CLI uses global defaults and maps the current directory.
- Missing image profiles are treated as errors.
