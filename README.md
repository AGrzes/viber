# Viber CLI Private Orchestration Framework

Private, single-operator CLI that launches agent sessions in Podman containers with project and global configuration.

## Workspace Layout

- Monorepo root uses pnpm workspaces
- CLI module lives in `cli/`

## Quick Start

```bash
pnpm install
pnpm --filter viber-cli build
pnpm --filter viber-cli test
pnpm --filter viber-cli dev -- --help
```

## Common Commands

```bash
pnpm --filter viber-cli dev -- start
pnpm --filter viber-cli dev -- run --image docker.io/library/node:25
pnpm --filter viber-cli dev -- profiles list
```

## Environment Behavior

- Working directory inside containers is `/workdir`.
- If `${HOME}/.codex/auth.json` exists, it is mounted to `/workdir/.codex/auth.json`.
- Exported env vars: `VIBER_PROJECT_CONFIG`, `VIBER_GLOBAL_CONFIG`, `CODEX_HOME`.
- Default image profile name is `default` when no image override is provided.
