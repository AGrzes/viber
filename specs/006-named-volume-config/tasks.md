# Tasks: Named Volume Configuration for viber-cli

**Input**: Design documents from `/specs/006-named-volume-config/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution (Principle IV: Explicit Testing Baseline). Minimal unit tests that prove core behavior works.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- CLI tool structure: `cli/src/`, `cli/tests/`
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure (already complete - TypeScript project exists)

- [X] T001 Verify TypeScript and Node.js 20 environment ready in cli/
- [X] T002 Verify Zod dependency available in cli/package.json
- [X] T003 [P] Verify Vitest test framework configured in cli/package.json
- [X] T004 Create test directory structure: cli/tests/unit/config/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema and validation infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create VolumeMappingSchema in cli/src/lib/config/schema.ts with volumeName/sourcePath/targetPath/mode fields
- [X] T006 [P] Create VolumeMappingsCollectionSchema (Record<string, VolumeMapping>) in cli/src/lib/config/schema.ts
- [X] T007 Add optional volumeMappings field to ProjectConfigSchema in cli/src/lib/config/schema.ts
- [X] T008 [P] Add optional volumeMappings field to GlobalConfigSchema in cli/src/lib/config/schema.ts
- [X] T009 Keep legacy mappings/defaultMappings fields as optional (deprecated) in schemas

**Checkpoint**: Foundation ready - schemas defined, all user stories can now begin implementation

---

## Phase 3: User Story 3 - Default Named Volume Behavior (Priority: P1) 🎯 MVP Component

**Goal**: Preserve existing workdir mounting behavior; volumeMappings extend (don't replace) defaults

**Independent Test**: Start viber-cli without config files; verify workdir mounts as before; add volumeMappings config; verify both workdir and volumeMappings are present

### Tests for User Story 3 (REQUIRED) ⚠️

- [X] T010 [P] [US3] Unit test: Default behavior preserves workdir mount in cli/tests/unit/config/volumeMappings.test.ts
- [X] T011 [P] [US3] Unit test: volumeMappings extend (not replace) defaultMappings in cli/tests/unit/config/volumeMappings.test.ts

### Implementation for User Story 3

- [X] T012 [US3] Update resolver logic in cli/src/lib/config/resolver.ts to merge workdir + defaultMappings + volumeMappings
- [X] T013 [US3] Convert volumeMappings map to array format for effectiveMappings in cli/src/lib/config/resolver.ts
- [X] T014 [US3] Document that volumeMappings coexist with workdir mounting (in-code JSDoc comments)

**Checkpoint**: Default behavior preserved - backward compatibility maintained

---

## Phase 4: User Story 1 - Configure Project-Level Named Volumes (Priority: P1) 🎯 MVP Core

**Goal**: Developers can define volumeMappings in .viber.json; volumes persist across container restarts

**Independent Test**: Create .viber.json with one volumeMapping (volumeName → targetPath); start container; verify volume created; restart container; verify data persists

### Tests for User Story 1 (REQUIRED) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T015 [P] [US1] Unit test: Parse volumeMappings from project config in cli/tests/unit/config/volumeMappings.test.ts
- [X] T016 [P] [US1] Unit test: Validate volumeName XOR sourcePath constraint in cli/tests/unit/config/volumeMappings.test.ts
- [X] T017 [P] [US1] Unit test: Reject empty targetPath in cli/tests/unit/config/volumeMappings.test.ts
- [X] T018 [P] [US1] Unit test: Validate mode enum (rw/ro) in cli/tests/unit/config/volumeMappings.test.ts

### Implementation for User Story 1

- [X] T019 [US1] Update readProjectConfig() in cli/src/lib/config/store.ts to parse volumeMappings field
- [X] T020 [P] [US1] Add volumeMappings validation in cli/src/lib/config/validation.ts using VolumeMappingSchema
- [X] T021 [US1] Update buildPodmanArgs() in cli/src/lib/podman/runner.ts to detect volumeName vs sourcePath
- [X] T022 [US1] Generate `-v volumeName:targetPath:mode` for named volumes in cli/src/lib/podman/runner.ts
- [X] T023 [US1] Generate `-v sourcePath:targetPath:mode` for bind mounts in cli/src/lib/podman/runner.ts

**Checkpoint**: Project-level named volumes working - can create, mount, and persist volumes

---

## Phase 5: User Story 2 - Configure Global Named Volumes (Priority: P2)

**Goal**: Developers can define volumeMappings in ~/.viber/config.json; shared across all projects; project config overrides global

**Independent Test**: Set global volumeMappings in ~/.viber/config.json; run multiple projects; verify shared volume data; add project-level override; verify project wins

### Tests for User Story 2 (REQUIRED) ⚠️

- [X] T024 [P] [US2] Unit test: Parse volumeMappings from global config in cli/tests/unit/config/volumeMappings.test.ts
- [X] T025 [P] [US2] Unit test: Merge global and project volumeMappings by target path in cli/tests/unit/config/volumeMappings.test.ts
- [X] T026 [P] [US2] Unit test: Project volumeMappings override global when same targetPath in cli/tests/unit/config/volumeMappings.test.ts

### Implementation for User Story 2

- [X] T027 [US2] Update readGlobalConfig() in cli/src/lib/config/store.ts to parse volumeMappings field
- [X] T028 [US2] Implement mergeVolumeMappings() function in cli/src/lib/config/resolver.ts using object spread
- [X] T029 [US2] Call mergeVolumeMappings(global, project) in config resolution chain in cli/src/lib/config/resolver.ts
- [X] T030 [US2] Update ResolvedConfig to include merged volumeMappings in cli/src/lib/config/resolver.ts

**Checkpoint**: Global volumes working - sharing across projects with project override capability

---

## Phase 6: Legacy Migration (Cross-Cutting Concern)

**Goal**: Detect legacy mappings array format; emit warnings; auto-migrate on write

**Independent Test**: Load config with old mappings array; verify warning displayed; write config; verify new volumeMappings format saved

### Tests for Legacy Migration (REQUIRED) ⚠️

- [X] T031 [P] Unit test: Detect legacy mappings array in cli/tests/unit/config/migration.test.ts
- [X] T032 [P] Unit test: Convert legacy array to volumeMappings map in cli/tests/unit/config/migration.test.ts
- [X] T033 [P] Unit test: Preserve all fields during migration in cli/tests/unit/config/migration.test.ts
- [X] T034 [P] Unit test: Write migrated config removes mappings field in cli/tests/unit/config/migration.test.ts

### Implementation for Legacy Migration

- [X] T035 [P] Create migrateLegacyMappings() function in cli/src/lib/config/store.ts
- [X] T036 Detect Array.isArray(config.mappings) in readProjectConfig() in cli/src/lib/config/store.ts
- [X] T037 [P] Detect Array.isArray(config.defaultMappings) in readGlobalConfig() in cli/src/lib/config/store.ts
- [X] T038 Emit console.warn() deprecation message when legacy format detected in cli/src/lib/config/store.ts
- [X] T039 Convert legacy array to map in-memory using targetPath as key in cli/src/lib/config/store.ts
- [X] T040 Update writeProjectConfig() to remove mappings field and use volumeMappings in cli/src/lib/config/store.ts
- [X] T041 [P] Update writeGlobalConfig() to remove defaultMappings field and use volumeMappings in cli/src/lib/config/store.ts

**Checkpoint**: Legacy migration working - backward compatibility maintained with clear upgrade path

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, error handling, validation improvements

- [X] T042 [P] Add JSDoc comments to VolumeMappingSchema in cli/src/lib/config/schema.ts
- [X] T043 [P] Add JSDoc @deprecated tags to mappings/defaultMappings fields in cli/src/lib/config/schema.ts
- [X] T044 [P] Improve validation error messages in cli/src/lib/config/validation.ts
- [X] T045 [P] Add logging for volume creation in cli/src/lib/podman/runner.ts
- [X] T046 Verify quickstart.md examples match implementation
- [X] T047 Run `pnpm -C cli format` to apply Prettier formatting
- [X] T048 Run `pnpm -C cli test` to verify all tests pass
- [X] T049 Run `pnpm -C cli build` to verify TypeScript compilation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify existing environment
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - US3 (Default Behavior) - Can start after Foundational
  - US1 (Project Volumes) - Can start after Foundational + US3
  - US2 (Global Volumes) - Can start after US1
- **Migration (Phase 6)**: Can start after US1 and US2 complete
- **Polish (Phase 7)**: Depends on all phases completion

### User Story Dependencies

- **User Story 3 (P1 - Default Behavior)**: Foundational → US3 (independent after that)
- **User Story 1 (P1 - Project Volumes)**: Foundational → US3 → US1 (needs default behavior preserved)
- **User Story 2 (P2 - Global Volumes)**: Foundational → US3 → US1 → US2 (needs merge logic)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Schema validation before usage
- Config reading before writing
- Core logic before error handling

### Parallel Opportunities

- **Phase 2**: T006, T008 can run parallel to T005, T007, T009
- **US3 Tests**: T010, T011 can run in parallel
- **US1 Tests**: T015, T016, T017, T018 can run in parallel
- **US1 Implementation**: T020 parallel to T019
- **US2 Tests**: T024, T025, T026 can run in parallel
- **Migration Tests**: T031, T032, T033, T034 can run in parallel
- **Migration Implementation**: T035, T037, T041 parallel to other migration tasks
- **Polish**: T042, T043, T044, T045 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test: Parse volumeMappings from project config in cli/tests/unit/config/volumeMappings.test.ts"
Task: "Unit test: Validate volumeName XOR sourcePath constraint in cli/tests/unit/config/volumeMappings.test.ts"
Task: "Unit test: Reject empty targetPath in cli/tests/unit/config/volumeMappings.test.ts"
Task: "Unit test: Validate mode enum (rw/ro) in cli/tests/unit/config/volumeMappings.test.ts"

# After tests written, launch these implementation tasks together:
Task: "Add volumeMappings validation in cli/src/lib/config/validation.ts using VolumeMappingSchema"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 3 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (schemas - CRITICAL)
3. Complete Phase 3: User Story 3 (default behavior)
4. Complete Phase 4: User Story 1 (project volumes)
5. **STOP and VALIDATE**: Test US1 + US3 independently
6. Deploy/demo if ready - MVP delivers project-level named volumes

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Schemas ready
2. **MVP** (Phase 3-4) → US3 + US1 → Project volumes working with defaults preserved
3. **Enhancement** (Phase 5) → US2 → Add global volumes and hierarchy
4. **Migration** (Phase 6) → Backward compatibility complete
5. **Polish** (Phase 7) → Production ready

### Full Feature Delivery Order

1. Setup + Foundational → Schema infrastructure ready
2. Add US3 (Default Behavior) → Backward compatibility maintained
3. Add US1 (Project Volumes) → Core feature working
4. Add US2 (Global Volumes) → Full hierarchy implemented
5. Add Migration → Legacy configs supported
6. Polish → Documentation and refinement complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance: Minimal tests that prove core behavior works (Principle IV)
- Zero new dependencies added (Principle III: OSS First - reusing Zod/Vitest)
- Simple object merge for config resolution (Principle I: Elegant Simplicity)
