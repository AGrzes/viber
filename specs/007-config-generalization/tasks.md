# Phases
- [x] Phase 1: Define new schemas and validation rules
- [x] Phase 2: Implement profile resolution and merge pipeline
- [x] Phase 3: Update CLI commands and flags
- [x] Phase 4: Refactor runtime integration and template handling
- [x] Phase 5: Remove deprecated features and special cases
- [x] Phase 6: Update tests and documentation

# Phase Dependencies
Phase 2 depends on Phase 1.
Phase 3 depends on Phase 1.
Phase 4 depends on Phases 1 and 2.
Phase 5 depends on Phases 2 and 4.
Phase 6 depends on Phases 3, 4, and 5.

# Phase 1 Tasks
- [x] Define new global config shape with `profiles` map and validation rules
- [x] Define new project config shape with optional `inherit` and profile fields
- [x] Rename config fields (`image`, `env`, `volumes`, `templates`) and document required/optional fields
- [x] Specify validation for `image` (non-empty), `env` values (string), and `templates` final shape
- [x] Define null-deletion semantics for map entries and templates

# Phase 2 Tasks
- [x] Implement profile inheritance resolution with ordered merge and null deletions
- [x] Strip `inherit` before merge and prevent self-cycle in `default`
- [x] Detect and error on inheritance cycles or missing profile names
- [x] Apply implicit `[default]` inheritance rules for project and global profiles
- [x] Apply run-time overrides: `--profile` list replaces project inherit; `--image` overrides merged `image`
- [x] Ensure final resolved config is a single merged object with no provenance metadata

# Phase 3 Tasks
- [x] Remove `viber env`, `viber profiles`, and `viber agents` commands
- [x] Update `viber config` to create empty project config when missing (no-op otherwise)
- [x] Add `viber config --global` to create minimal global config scaffold
- [x] Add `viber config --profile <name>` to set project `inherit` and validate profile exists
- [x] Add `viber config path` and `viber config path --global` with error behavior on missing config
- [x] Update `viber run --profile` to be repeatable and replace project `inherit`
- [x] Update `viber run --suppress` to accept dot-paths and null config keys, erroring on missing paths

# Phase 4 Tasks
- [x] Update template model to use a name-keyed map and deep-merge parameters
- [x] Ensure template null entries suppress templates
- [x] Validate templates only after merge (final shape required)
- [x] Keep template path env substitution as-is
- [x] Keep `--dry-run` output as full `podman ...` command

# Phase 5 Tasks
- [x] Remove agents/agentsRef logic and AGENTS-specific mounts
- [x] Remove skills palette handling
- [x] Remove `networkPolicy`
- [x] Remove auto-mount of `~/.codex/auth.json`
- [x] Remove `CODEX_HOME` special handling
- [x] Remove config path env var injection (do not add any)
- [x] Keep workdir mount post-processing as always-on and non-configurable

# Phase 6 Tasks
- [x] Update unit tests to validate template-based AGENTS.md generation
- [x] Remove or adjust tests that reference removed features or old config shapes
- [x] Update README with new config format, migration notes, and examples
- [x] Document how to recreate prior behavior using `volumes`, `env`, and `templates`
