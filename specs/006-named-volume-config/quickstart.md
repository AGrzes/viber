# Quickstart: Named Volume Configuration

**Feature**: viber-cli Volume Mappings  
**For**: Developers using viber-cli

## What is This?

Named volumes let you persist data in containers across restarts. Unlike bind mounts (which map host directories), named volumes are managed by your container runtime and survive even when containers are deleted.

**Common use cases**:
- Persist `node_modules` to speed up dependency installs
- Cache build artifacts between container restarts
- Store database data that must survive container recreation

---

## Basic Usage

### 1. Project-Level Named Volume

Add to your project's `.viber.json`:

```json
{
  "imageReference": "my-image",
  "volumeMappings": {
    "/app/node_modules": {
      "volumeName": "my-project-node-modules",
      "targetPath": "/app/node_modules",
      "mode": "rw"
    }
  }
}
```

**What this does**: Creates a named volume called `my-project-node-modules` and mounts it at `/app/node_modules` in the container. Data persists across container restarts.

---

### 2. Global Named Volume (Shared Across Projects)

Add to `~/.viber/config.json`:

```json
{
  "volumeMappings": {
    "/root/.npm": {
      "volumeName": "npm-global-cache",
      "targetPath": "/root/.npm",
      "mode": "rw"
    }
  }
}
```

**What this does**: All projects share the same npm cache, speeding up installs.

---

### 3. Mix Named Volumes and Bind Mounts

You can use both in the same config:

```json
{
  "volumeMappings": {
    "/app/node_modules": {
      "volumeName": "node-modules-cache",
      "targetPath": "/app/node_modules",
      "mode": "rw"
    },
    "/app/src": {
      "sourcePath": "/home/user/myproject/src",
      "targetPath": "/app/src",
      "mode": "rw"
    }
  }
}
```

**What this does**: 
- `/app/node_modules` uses a named volume (persists)
- `/app/src` uses a bind mount (live updates from host)

---

## Configuration Hierarchy

When both global and project configs define volume mappings:
- **Project wins**: If the same `targetPath` appears in both, the project config overrides global
- **Others merge**: Different target paths from both configs are combined

**Example**:

Global config (`~/.viber/config.json`):
```json
{
  "volumeMappings": {
    "/cache": { "volumeName": "global-cache", "targetPath": "/cache", "mode": "rw" },
    "/tmp": { "volumeName": "global-tmp", "targetPath": "/tmp", "mode": "rw" }
  }
}
```

Project config (`.viber.json`):
```json
{
  "volumeMappings": {
    "/cache": { "volumeName": "project-cache", "targetPath": "/cache", "mode": "rw" }
  }
}
```

**Result**:
- `/cache` → `project-cache` (project overrides global)
- `/tmp` → `global-tmp` (from global, no conflict)

---

## Volume Naming for Isolation

**⚠️ Important**: Volume names are global. If two projects use the same volume name, they share data.

### ❌ Wrong (unintended sharing):
```json
// Project A
{ "volumeMappings": { "/app/node_modules": { "volumeName": "node-modules" ... }}}

// Project B  
{ "volumeMappings": { "/app/node_modules": { "volumeName": "node-modules" ... }}}
// Both projects share the same volume!
```

### ✅ Right (isolated per project):
```json
// Project A
{ "volumeMappings": { "/app/node_modules": { "volumeName": "projectA-node-modules" ... }}}

// Project B
{ "volumeMappings": { "/app/node_modules": { "volumeName": "projectB-node-modules" ... }}}
// Each project has its own volume
```

### When Sharing is Intentional:
```json
// Project A and B both use:
{ "volumeMappings": { "/cache": { "volumeName": "shared-build-cache" ... }}}
// Intentionally share build cache between projects
```

---

## Migrating from Legacy Format

**Old format** (array-based, deprecated):
```json
{
  "mappings": [
    {
      "sourcePath": "/host/path",
      "targetPath": "/container/path",
      "mode": "rw"
    }
  ]
}
```

**New format** (object-based):
```json
{
  "volumeMappings": {
    "/container/path": {
      "sourcePath": "/host/path",
      "targetPath": "/container/path",
      "mode": "rw"
    }
  }
}
```

**Migration**:
1. viber-cli will detect the old format and emit a warning
2. Config continues to work (backward compatible)
3. When you next modify and save the config, it auto-migrates to the new format
4. Update your scripts/documentation to use `volumeMappings` instead of `mappings`

---

## Advanced Examples

### Example 1: Multi-Project Build Cache

Share Go module cache across all projects:

`~/.viber/config.json`:
```json
{
  "volumeMappings": {
    "/go/pkg/mod": {
      "volumeName": "go-mod-cache",
      "targetPath": "/go/pkg/mod",
      "mode": "rw",
      "label": "Shared Go module cache"
    }
  }
}
```

All projects automatically use the shared cache.

---

### Example 2: Read-Only Shared Assets

Share static assets (images, fonts) as read-only:

`~/.viber/config.json`:
```json
{
  "volumeMappings": {
    "/assets": {
      "volumeName": "company-assets",
      "targetPath": "/assets",
      "mode": "ro",
      "label": "Company branding assets"
    }
  }
}
```

Projects can read but not modify shared assets.

---

### Example 3: Database Persistence

Project-specific PostgreSQL data:

`.viber.json`:
```json
{
  "volumeMappings": {
    "/var/lib/postgresql/data": {
      "volumeName": "myapp-postgres-data",
      "targetPath": "/var/lib/postgresql/data",
      "mode": "rw"
    }
  }
}
```

Database survives container restarts and recreations.

---

## Compatibility Notes

- **Default behavior unchanged**: Workdir and existing bind mounts continue to work
- **volumeMappings extends**: Adds to (doesn't replace) existing mounts
- **Legacy format supported**: Old `mappings` array format continues to work indefinitely
- **Auto-migration**: Happens automatically on next config write (non-destructive)

---

## Troubleshooting

### Volume already exists with different settings

**Problem**: Container runtime reports volume exists but with incompatible configuration.

**Solution**: Remove the old volume manually:
```bash
podman volume rm volume-name
```

Then restart the container - viber-cli will recreate it with new settings.

---

### Two projects accidentally sharing data

**Problem**: Forgot to scope volume names per project.

**Solution**:
1. Stop containers
2. Remove shared volume: `podman volume rm shared-name`
3. Update configs with project-specific names
4. Restart - each project gets its own volume

---

### Migration warning won't go away

**Problem**: Still see deprecation warnings after migration.

**Solution**:
1. Check if global config also uses old format: `~/.viber/config.json`
2. Manually update or trigger migration by running a config write command
3. Ensure no other config files (CI scripts, etc.) reference old format

---

## Next Steps

- See `data-model.md` for technical schema details
- See `contracts/schemas.md` for validation rules
- Run tests: `pnpm --filter viber-cli test` to verify behavior
