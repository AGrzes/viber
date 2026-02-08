# Phases
- [ ] Phase 1: Define new schemas and validation rules
- [ ] Phase 2: Implement profile resolution and merge pipeline
- [ ] Phase 3: Update CLI commands and flags
- [ ] Phase 4: Refactor runtime integration and template handling
- [ ] Phase 5: Remove deprecated features and special cases
- [ ] Phase 6: Update tests and documentation

# Phase Dependencies
Phase 2 depends on Phase 1.
Phase 3 depends on Phase 1.
Phase 4 depends on Phases 1 and 2.
Phase 5 depends on Phases 2 and 4.
Phase 6 depends on Phases 3, 4, and 5.

# Phase 1 Tasks
- [ ] Define new global config shape with `profiles` map and validation rules
- [ ] Define new project config shape with optional `inherit` and profile fields
- [ ] Rename config fields (`image`, `env`, `volumes`, `templates`) and document required/optional fields
- [ ] Specify validation for `image` (non-empty), `env` values (string), and `templates` final shape
- [ ] Define null-deletion semantics for map entries and templates

# Phase 2 Tasks
- [ ] Implement profile inheritance resolution with ordered merge and null deletions
- [ ] Strip `inherit` before merge and prevent self-cycle in `default`
- [ ] Detect and error on inheritance cycles or missing profile names
- [ ] Apply implicit `[default]` inheritance rules for project and global profiles
- [ ] Apply run-time overrides: `--profile` list replaces project inherit; `--image` overrides merged `image`
- [ ] Ensure final resolved config is a single merged object with no provenance metadata

# Phase 3 Tasks
- [ ] Remove `viber env`, `viber profiles`, and `viber agents` commands
- [ ] Update `viber config` to create empty project config when missing (no-op otherwise)
- [ ] Add `viber config --global` to create minimal global config scaffold
- [ ] Add `viber config --profile <name>` to set project `inherit` and validate profile exists
- [ ] Add `viber config path` and `viber config path --global` with error behavior on missing config
- [ ] Update `viber run --profile` to be repeatable and replace project `inherit`
- [ ] Update `viber run --suppress` to accept dot-paths and null config keys, erroring on missing paths

# Phase 4 Tasks
- [ ] Update template model to use a name-keyed map and deep-merge parameters
- [ ] Ensure template null entries suppress templates
- [ ] Validate templates only after merge (final shape required)
- [ ] Keep template path env substitution as-is
- [ ] Keep `--dry-run` output as full `podman ...` command

# Phase 5 Tasks
- [ ] Remove agents/agentsRef logic and AGENTS-specific mounts
- [ ] Remove skills palette handling
- [ ] Remove `networkPolicy`
- [ ] Remove auto-mount of `~/.codex/auth.json`
- [ ] Remove `CODEX_HOME` special handling
- [ ] Remove config path env var injection (do not add any)
- [ ] Keep workdir mount post-processing as always-on and non-configurable

# Phase 6 Tasks
- [ ] Update unit tests to validate template-based AGENTS.md generation
- [ ] Remove or adjust tests that reference removed features or old config shapes
- [ ] Update README with new config format, migration notes, and examples
- [ ] Document how to recreate prior behavior using `volumes`, `env`, and `templates`
