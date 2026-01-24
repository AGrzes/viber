# Quickstart: Wrapper CLI Refactor

## Prerequisites
- Node.js 25
- pnpm
- Podman installed and available on PATH

## Install

```bash
pnpm install
```

## Build

```bash
pnpm --filter viber-cli build
```

## Test

```bash
pnpm --filter viber-cli test
```

## Run (development)

```bash
pnpm --filter viber-cli dev -- start
```

## Notes

- Sessions use `/workdir` as the container working directory.
- If `${HOME}/.codex/auth.json` exists, it is mounted to `/workdir/.codex/auth.json`.
