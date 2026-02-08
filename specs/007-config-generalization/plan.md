# Plan: Config Generalization Refactor

## Distilled Intent
Unify all configuration around profile-shaped objects with inheritance, deep-merge, and explicit deletions. Remove special-case behaviors (agents handling, CODEX_HOME, codex auth mount, networkPolicy, skills palette) and replace them with profile-driven configuration and templates. Simplify CLI configuration management to a minimal `viber config` flow and a `config path` helper. Keep core runtime behaviors (podman run, workdir mount, dry-run command output) while making config resolution deterministic and strict (hard break with validation errors for old/invalid configs).

## High-Level Steps
1. **Define new config schema and resolution rules**
   - Introduce profile-shaped config with `inherit`, deep-merge order, null deletions, templates map, env/volumes/image renames, and strict validation.

2. **Update config loading and merge pipeline**
   - Implement profile resolution for global and project configs, handle inheritance cycles/missing profiles, strip `inherit`, apply overrides (`--profile`, `--image`), and enforce required fields.

3. **Remove deprecated/special-case features**
   - Remove agents/agentsRef handling, skills palettes, networkPolicy, codex auth auto-mount, CODEX_HOME handling, and config path env vars.

4. **Align CLI commands with new model**
   - Keep only `viber config` (create/no-op), add `viber config path`, retain `--cwd`, update `viber run --profile` semantics and `--suppress` dot-path nulling.

5. **Adapt templates and runtime integration**
   - Use templates map with name keys, deep-merge parameters, validate final templates, apply null suppression, keep existing env interpolation and template path substitution.

6. **Update documentation and tests**
   - Document breaking changes, new config format, agents via templates, codex auth and CODEX_HOME via volumes/env, and skills via templates; keep unit test for AGENTS.md generation through templates.
