---

description: "Task list for AGENTS.md Handling"
---

# Tasks: AGENTS.md Handling

**Input**: Design documents from `/specs/004-agents-md-handling/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Tests**: Tests are REQUIRED. Include minimal unit test tasks that prove core behavior works.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirm config file locations for global and project settings in `cli/src/lib/config`
- [X] T002 Identify session startup entrypoint that mounts AGENTS.md in `cli/src/services`

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T003 Create agents config helpers and schema in `cli/src/lib/config/agents.ts`
- [X] T004 Implement selection resolver (CLI → project reference/no-global → global default) in `cli/src/services/agents-selection.ts`
- [X] T005 Implement combined AGENTS.md builder in `cli/src/services/agents-file.ts`

## Phase 3: User Story 1 - Use Combined Agent Instructions on Start (Priority: P1)

**Goal**: Start sessions with combined AGENTS.md when configured, in correct order.

**Independent Test**: Configure global/project text and start session; combined AGENTS.md exists at `CODEX_HOME/AGENTS.md` with global content first.

### Tests for User Story 1 (REQUIRED)

- [X] T006 [P] [US1] Unit test for selection precedence in `cli/tests/unit/agents-selection.test.ts`
- [X] T007 [P] [US1] Unit test for AGENTS.md assembly order in `cli/tests/unit/agents-file.test.ts`

### Implementation for User Story 1

- [X] T008 [US1] Load global/project agents on session start in `cli/src/services/session.ts`
- [X] T009 [US1] Generate and mount AGENTS.md only when content exists in `cli/src/services/session.ts`
- [X] T010 [US1] Return clear error on missing global name in `cli/src/services/agents-selection.ts`
- [X] T011 [US1] Enforce conflict error for `--agents` + `--agents-no-global` in `cli/src/services/agents-selection.ts`

## Phase 4: User Story 2 - Select a Named Global Agent Content (Priority: P2)

**Goal**: Allow selection of named global text and project reference with `default` as implicit global default.

**Independent Test**: Define global entries including `default`, set project reference, verify selection precedence and errors.

### Tests for User Story 2 (REQUIRED)

- [X] T012 [P] [US2] Unit test for default-name fallback in `cli/tests/unit/agents-selection.test.ts`
- [X] T013 [P] [US2] Unit test for case-sensitive uniqueness in `cli/tests/unit/agents-config.test.ts`

### Implementation for User Story 2

- [X] T014 [US2] Parse `--agents <name>` and `--agents-no-global` in `cli/src/cli/commands/run.ts`
- [X] T015 [US2] Resolve `default` as implicit global default in `cli/src/services/agents-selection.ts`
- [X] T016 [US2] Enforce case-sensitive uniqueness in `cli/src/lib/config/agents.ts`
- [X] T017 [US2] Implement project reference persistence in `cli/src/lib/config/agents.ts`

## Phase 5: User Story 3 - Edit Agent Content in an External Editor (Priority: P3)

**Goal**: Provide edit and clear flows for global and project text via CLI.

**Independent Test**: Run `viber agents edit` and `viber agents edit --global name`, verify persistence; run `viber agents clear` and `viber agents clear --global name`, verify removal.

### Tests for User Story 3 (REQUIRED)

- [X] T018 [P] [US3] Unit test for editor save/no-save behavior in `cli/tests/unit/agents-editor.test.ts`
- [X] T019 [P] [US3] Unit test for clear commands in `cli/tests/unit/agents-config.test.ts`

### Implementation for User Story 3

- [X] T020 [US3] Add `viber agents edit [--global <name>]` command in `cli/src/cli/commands/agents.ts`
- [X] T021 [US3] Add `viber agents clear [--global <name>]` command in `cli/src/cli/commands/agents.ts`
- [X] T022 [US3] Add `viber agents reference <name>|--clear|--no-global` command in `cli/src/cli/commands/agents.ts`
- [X] T023 [US3] Wire editor invocation for edit flow in `cli/src/lib/utils/editor.ts`
- [X] T024 [US3] Persist global/project text edits in `cli/src/lib/config/agents.ts`

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T025 Update CLI help text and usage examples in `cli/src/cli/commands/agents.ts`
- [ ] T026 Add user-facing error messages for missing names in `cli/src/cli/commands/agents.ts`

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories
- US1 depends on T003-T005
- US2 depends on T003-T005
- US3 depends on T003

## Parallel Execution Examples

- US1: T006 and T007 in parallel after T003-T005
- US2: T012 and T013 in parallel after T003-T005
- US3: T018 and T019 in parallel after T003

## Implementation Strategy

- MVP: Complete US1 end-to-end to ensure AGENTS.md is generated and mounted.
- Then: Implement US2 selection and reference behavior.
- Then: Implement US3 edit/clear/reference commands with editor flow.
- Finally: Polish CLI messages and help text.
