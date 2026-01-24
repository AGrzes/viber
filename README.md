# Viber CLI Private Orchestration Framework

Private, single-operator CLI that launches agent sessions in Podman containers with project and global configuration.

## Workspace Layout

- Monorepo root uses pnpm workspaces
- CLI module lives in `cli/`

## Quick Start

```bash
pnpm install
pnpm --filter viber-cli dev -- --help
```

## Common Commands

```bash
pnpm --filter viber-cli dev -- start
pnpm --filter viber-cli dev -- run --image docker.io/library/node:25
pnpm --filter viber-cli dev -- profiles list
```
