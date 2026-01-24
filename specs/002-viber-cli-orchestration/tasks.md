---

description: "Task list for Viber CLI Private Orchestration Framework"
---

# Tasks: Viber CLI Private Orchestration Framework

**Input**: Design documents from `/specs/002-viber-cli-orchestration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested; no explicit test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create pnpm workspace config in /workdir/pnpm-workspace.yaml
- [x] T002 Initialize CLI package with pnpm scripts and dependencies in /workdir/cli/package.json
- [x] T003 Add TypeScript config for Node 25 in /workdir/cli/tsconfig.json
- [x] T004 [P] Create CLI entrypoint scaffold in /workdir/cli/src/cli/index.ts
- [x] T005 [P] Create base directory structure under /workdir/cli/src/ (cli/commands, lib/config, lib/podman, lib/utils, models, services)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T006 Define config types and Zod schemas in /workdir/cli/src/lib/config/schema.ts
- [ ] T007 Implement config file discovery (search to filesystem root) in /workdir/cli/src/lib/config/discovery.ts
- [ ] T008 Implement config load/merge/precedence logic (project overrides global; implicit mapping) in /workdir/cli/src/lib/config/resolver.ts
- [ ] T009 Implement config persistence (project/global read/write) in /workdir/cli/src/lib/config/store.ts
- [ ] T010 Implement mapping validation (paths, modes, uniqueness) in /workdir/cli/src/lib/config/validation.ts
- [ ] T011 Implement Podman command builder and runner in /workdir/cli/src/lib/podman/runner.ts
- [ ] T012 Implement debug logging utility and namespaces in /workdir/cli/src/lib/utils/log.ts
- [ ] T013 Implement shared error helpers for actionable messages in /workdir/cli/src/lib/utils/errors.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Start an isolated agent session for a project (Priority: P1) 🎯 MVP

**Goal**: Start an interactive agent session using resolved configuration and Podman

**Independent Test**: From a configured project directory, run the start command and confirm the session launches with expected mappings and image source.

### Implementation for User Story 1

- [ ] T014 [US1] Implement session start logic (interactive) in /workdir/cli/src/services/session.ts
- [ ] T015 [US1] Implement CLI start command handler in /workdir/cli/src/cli/commands/start.ts
- [ ] T016 [US1] Wire start command into CLI entrypoint in /workdir/cli/src/cli/index.ts
- [ ] T017 [US1] Add validation for image profile/reference resolution errors in /workdir/cli/src/services/session.ts

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - Create or update project configuration quickly (Priority: P2)

**Goal**: Provide a CLI flow to create or update project configuration without manual edits

**Independent Test**: Run the config command in a new directory, confirm a config file is created and reused on next run.

### Implementation for User Story 2

- [ ] T018 [US2] Implement interactive config prompt flow in /workdir/cli/src/services/configWizard.ts
- [ ] T019 [US2] Implement CLI config init/update command in /workdir/cli/src/cli/commands/config.ts
- [ ] T020 [US2] Wire config command into CLI entrypoint in /workdir/cli/src/cli/index.ts
- [ ] T021 [US2] Add mapping/image selection normalization for config writes in /workdir/cli/src/lib/config/store.ts

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Reuse global defaults and image profiles across projects (Priority: P3)

**Goal**: Manage global defaults and named image profiles; run one-off sessions

**Independent Test**: Create an image profile, list it, then run a one-off session with that profile and verify it exits cleanly.

### Implementation for User Story 3

- [ ] T022 [US3] Implement image profile CRUD service in /workdir/cli/src/services/profiles.ts
- [ ] T023 [US3] Implement CLI profiles commands in /workdir/cli/src/cli/commands/profiles.ts
- [ ] T024 [US3] Wire profiles commands into CLI entrypoint in /workdir/cli/src/cli/index.ts
- [ ] T025 [US3] Implement one-off run command handler in /workdir/cli/src/cli/commands/run.ts
- [ ] T026 [US3] Implement one-off session execution in /workdir/cli/src/services/session.ts
- [ ] T027 [US3] Enforce missing profile errors for profile-based runs in /workdir/cli/src/services/profiles.ts

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T028 [P] Document CLI usage and examples in /workdir/README.md
- [ ] T029 [P] Align quickstart commands with final CLI usage in /workdir/specs/002-viber-cli-orchestration/quickstart.md
- [ ] T030 Add final pass on error messages and debug namespaces in /workdir/cli/src/lib/utils/log.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2); no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2); uses shared config utilities
- **User Story 3 (P3)**: Can start after Foundational (Phase 2); uses shared config utilities

### Parallel Opportunities

- Phase 1: T004 and T005 can run in parallel
- Phase 2: T011 and T012 can run in parallel after T006–T010 are complete
- Phase 6: T028 and T029 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Implement session start logic (interactive) in /workdir/src/services/session.ts"
Task: "Implement CLI start command handler in /workdir/src/cli/commands/start.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate
3. User Story 2 → validate
4. User Story 3 → validate
5. Polish and documentation
