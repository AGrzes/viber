# Quickstart: Viber CLI Private Orchestration Framework

## Prerequisites
- Node.js 20 LTS
- Podman installed and available on PATH

## Local Setup

```bash
npm install
```

## Run the CLI (development)

```bash
node src/cli/index.js --help
```

## Example Flows

### Initialize a project config

```bash
node src/cli/index.js init
```

### Start an interactive session

```bash
node src/cli/index.js start
```

### Run a one-off session with a direct image reference

```bash
node src/cli/index.js run --image docker.io/library/node:20
```

### Manage image profiles

```bash
node src/cli/index.js profiles list
node src/cli/index.js profiles add
```

## Notes
- If no project config is found, the CLI uses global defaults and maps the current directory.
- Missing image profiles are treated as errors.
