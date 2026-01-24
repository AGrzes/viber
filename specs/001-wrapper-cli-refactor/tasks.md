---

description: "Task list for Wrapper CLI Refactor for Viber Orchestration"
---

# Tasks: Wrapper CLI Refactor for Viber Orchestration

**Input**: Design documents from `/specs/001-wrapper-cli-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required. Minimal unit tests for core behaviors are included per spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Ensure pnpm scripts for build/test/dev are defined in /workdir/cli/package.json
- [x] T002 Add vitest config for TypeScript in /workdir/cli/vitest.config.ts
- [x] T003 [P] Add test folder placeholders in /workdir/cli/tests/unit/.gitkeep and /workdir/cli/tests/integration/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Update config schema to enforce imageProfile/imageReference exclusivity in /workdir/cli/src/lib/config/schema.ts
- [x] T005 Update resolver to surface config paths and default profile fallback in /workdir/cli/src/lib/config/resolver.ts
- [x] T006 Add config path helpers in /workdir/cli/src/lib/config/store.ts to expose project/global config locations
- [x] T007 Create identity helpers for UID/GID lookup in /workdir/cli/src/lib/utils/identity.ts
- [x] T008 Create auth/path helpers for `${HOME}/.codex/auth.json` and `/workdir` in /workdir/cli/src/lib/utils/paths.ts
- [x] T009 Add env name constants for config path injection in /workdir/cli/src/lib/utils/env.ts
- [x] T010 Update Podman runner to accept workdir, env, UID:GID, userns keep-id, and extra mounts in /workdir/cli/src/lib/podman/runner.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Run a session with correct identity and workspace (Priority: P1) 🎯 MVP

**Goal**: Preserve host identity, set `/workdir`, mount CWD and auth file, and inject env values

**Independent Test**: Start a session and confirm workdir, mounts, UID/GID, and env arguments are present.

### Tests for User Story 1 (REQUIRED) ⚠️

- [x] T011 [P] [US1] Add unit test for default mapping to `/workdir` in /workdir/cli/tests/unit/mappings.test.ts
- [x] T012 [P] [US1] Add unit test for Podman args including userns keep-id + UID:GID in /workdir/cli/tests/unit/podman-args.test.ts
- [x] T013 [P] [US1] Add unit test for auth.json mount + CODEX_HOME in /workdir/cli/tests/unit/podman-args.test.ts
- [x] T014 [P] [US1] Add unit test for workdir and config env vars in /workdir/cli/tests/unit/podman-args.test.ts

### Implementation for User Story 1

- [ ] T015 [US1] Update session execution to set workdir, UID/GID, userns keep-id in /workdir/cli/src/services/session.ts
- [ ] T016 [US1] Implement default mapping of CWD to `/workdir` in /workdir/cli/src/services/session.ts
- [ ] T017 [US1] Add auth.json mount and CODEX_HOME env injection in /workdir/cli/src/services/session.ts
- [ ] T018 [US1] Inject config path env vars using resolver outputs in /workdir/cli/src/services/session.ts

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - Resolve images predictably (Priority: P2)

**Goal**: Enforce mutual exclusivity and default profile resolution

**Independent Test**: Start a session without explicit image and confirm default profile is chosen; reject invalid combinations.

### Tests for User Story 2 (REQUIRED) ⚠️

- [ ] T019 [P] [US2] Add unit test for default profile resolution in /workdir/cli/tests/unit/image-resolution.test.ts
- [ ] T020 [P] [US2] Add unit test for profile+reference rejection in /workdir/cli/tests/unit/image-resolution.test.ts

### Implementation for User Story 2

- [ ] T021 [US2] Implement default profile lookup (name `default`) in /workdir/cli/src/services/profiles.ts
- [ ] T022 [US2] Update image resolution to use profile/reference or default in /workdir/cli/src/services/session.ts
- [ ] T023 [US2] Ensure error messaging for invalid image selection in /workdir/cli/src/services/session.ts

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Maintain deterministic build and test workflow (Priority: P3)

**Goal**: Document deterministic install/build/test steps

**Independent Test**: Run the documented commands and confirm they succeed.

### Tests for User Story 3 (REQUIRED) ⚠️

- [ ] T024 [P] [US3] Add unit test to validate env constants mapping in /workdir/cli/tests/unit/env.test.ts

### Implementation for User Story 3

- [ ] T025 [US3] Update quickstart commands in /workdir/specs/001-wrapper-cli-refactor/quickstart.md
- [ ] T026 [US3] Align README usage with deterministic commands in /workdir/README.md

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T027 [P] Document new env vars in /workdir/README.md
- [ ] T028 [P] Review debug logging for workdir/env visibility in /workdir/cli/src/lib/utils/log.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2); no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- Phase 1: T002 and T003 can run in parallel
- Phase 3: T011–T014 can run in parallel
- Phase 4: T019 and T020 can run in parallel
- Phase 5: T024 can run in parallel with T025/T026
- Phase 6: T027 and T028 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add unit test for default mapping to /workdir in /workdir/cli/tests/unit/mappings.test.ts"
Task: "Add unit test for Podman args including userns keep-id + UID:GID in /workdir/cli/tests/unit/podman-args.test.ts"
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
