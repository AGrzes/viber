---

description: "Task list for env mapping management"
---

# Tasks: Env Mapping Management

**Input**: Design documents from `/specs/003-add-env-mapping/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED. Include minimal unit test tasks that prove core behavior works.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared data structures for env mappings

- [X] T001 Extend config schemas and types for env mappings in `cli/src/lib/config/schema.ts`
- [X] T002 Update config read/write handling for env mappings in `cli/src/lib/config/store.ts`
- [X] T003 [P] Add env mapping validation helpers in `cli/src/lib/config/envMappings.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helpers used by all user stories

- [X] T004 Add merge and interpolation helpers in `cli/src/lib/utils/envMappings.ts`
- [X] T005 [P] Add env mapping CRUD helpers (get/set/list/delete per scope) in `cli/src/lib/config/envMappingsStore.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Use env mappings in container sessions (Priority: P1) 🎯 MVP

**Goal**: Apply merged env mappings (with interpolation) during session startup and remove the old `VIBER_GLOBAL_CONFIG` injection.

**Independent Test**: Configure global and project mappings, start a session, and verify merged env in the container with project override and interpolation applied.

### Tests for User Story 1 (REQUIRED) ⚠️

- [X] T006 [P] [US1] Add merge/precedence unit tests in `cli/tests/unit/envMappingsMerge.test.ts`
- [ ] T007 [P] [US1] Add interpolation unit tests in `cli/tests/unit/envMappingsInterpolation.test.ts`
- [ ] T008 [P] [US1] Add session env assembly test in `cli/tests/unit/sessionEnv.test.ts`

### Implementation for User Story 1

- [ ] T009 [US1] Wire env mapping merge + interpolation into session env assembly in `cli/src/services/session.ts`
- [ ] T010 [US1] Remove `VIBER_GLOBAL_CONFIG` injection and related constant from `cli/src/lib/utils/env.ts` and `cli/src/services/session.ts`
- [ ] T011 [US1] Ensure resolved config exposes env mappings needed by session in `cli/src/lib/config/resolver.ts`

**Checkpoint**: User Story 1 works independently

---

## Phase 4: User Story 2 - Manage env mappings via CLI (Priority: P2)

**Goal**: Provide CLI commands to set/get/list/delete env mappings for global and project scopes.

**Independent Test**: Use CLI to set/get/list/delete in both scopes, with project scope requiring an existing project config.

### Tests for User Story 2 (REQUIRED) ⚠️

- [ ] T012 [P] [US2] Add unit tests for global CRUD in `cli/tests/unit/envMappingsGlobal.test.ts`
- [ ] T013 [P] [US2] Add unit tests for project CRUD and missing-project error in `cli/tests/unit/envMappingsProject.test.ts`

### Implementation for User Story 2

- [ ] T014 [US2] Implement env mapping command handlers in `cli/src/cli/commands/env.ts`
- [ ] T015 [US2] Register env command in `cli/src/cli/index.ts`
- [ ] T016 [US2] Use scope-aware helpers and validation in `cli/src/lib/config/envMappingsStore.ts`

**Checkpoint**: User Story 2 works independently

---

## Phase 5: User Story 3 - Capture env mappings during setup (Priority: P3)

**Goal**: Allow optional env mapping entry in the setup wizard and persist into project config.

**Independent Test**: Run config wizard, add mappings, and confirm they are stored and applied in a session.

### Tests for User Story 3 (REQUIRED) ⚠️

- [ ] T017 [P] [US3] Add wizard env mapping flow tests in `cli/tests/unit/configWizardEnvMappings.test.ts`

### Implementation for User Story 3

- [ ] T018 [US3] Add optional env mapping prompts in `cli/src/services/configWizard.ts`
- [ ] T019 [US3] Persist wizard env mappings into project config in `cli/src/services/configWizard.ts`

**Checkpoint**: User Story 3 works independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation alignment

- [ ] T020 [P] Update CLI help text for env commands in `cli/src/cli/commands/env.ts`
- [ ] T021 Run quickstart validation against `specs/003-add-env-mapping/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories
- **User Story 2 (P2)**: No dependencies on other stories
- **User Story 3 (P3)**: No dependencies on other stories

### Parallel Opportunities

- Setup: T003 can run in parallel after T001
- Foundational: T005 can run in parallel with T004
- US1: T006, T007, T008 can run in parallel
- US2: T012 and T013 can run in parallel
- US3: T017 can run in parallel with other story work

---

## Parallel Example: User Story 1

```text
Task: "Add merge/precedence unit tests in cli/tests/unit/envMappingsMerge.test.ts"
Task: "Add interpolation unit tests in cli/tests/unit/envMappingsInterpolation.test.ts"
Task: "Add session env assembly test in cli/tests/unit/sessionEnv.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate US1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate
3. User Story 2 → validate
4. User Story 3 → validate
5. Polish
