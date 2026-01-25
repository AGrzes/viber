---
description: "Task list for container file templates feature"
---

# Tasks: Container File Templates

**Input**: Design documents from `/specs/005-container-file-templates/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Tests are REQUIRED. Each user story below defines the independent test that proves core behavior; add unit tests before writing implementation code.

**Organization**: Tasks are grouped by phase and user story so each delivery slice can be implemented and tested independently.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]** optional marker when a task can run in parallel (different files, no sequencing).
- **[Story]** label identifies the user story (US1, US2, etc.) associated with the work. Only user story phases include a story label.
- Always include the exact file path being modified.

## Path Conventions

- CLI code lives under `cli/src/` with services, lib utilities, and commands split by folder. Tests belong under `cli/tests/` (unit or integration).
- Docs for this feature stay under `specs/005-container-file-templates/`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repo for template rendering by adding the required dependency and scaffolding types. These tasks unblock the rest of the work.

- [ ] T001 Update `cli/package.json` to add the `handlebars` dependency and refresh `pnpm-lock.yaml` (run `pnpm -C cli install`) so deterministic template rendering is available. (cli/package.json)
- [ ] T002 Create `cli/src/lib/templates/types.ts` (and export via `cli/src/lib/templates/index.ts` if needed) to declare `TemplateDefinition`, `SuppressionList`, `RenderedFile`, and `TemplateSet` shapes before implementing processing logic. (cli/src/lib/templates/types.ts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire template configuration into the existing resolver so downstream services can read merged definitions before user stories run.

- [ ] T003 Extend `cli/src/lib/config/schema.ts` with `TemplateDefinitionSchema`, `ProjectConfigSchema.templates`, `GlobalConfigSchema.templates`, and `ResolvedConfig.templateSet` so template definitions from both configs are validated. (cli/src/lib/config/schema.ts)
- [ ] T004 Update `cli/src/lib/config/resolver.ts` to load `templates` arrays from project/global configs, normalize missing entries, and surface the merged template set through `ResolvedConfig.templateSet` for other services to consume. (cli/src/lib/config/resolver.ts)

---

## Phase 3: User Story 1 - Generate templated files for a container run (Priority: P1) 🎯 MVP

**Goal**: Render each template using provided parameters, write it to a temp file, and mount it into the container at the env-resolved path.

**Independent Test**: Render one template with parameters and env placeholders, confirm the temp file contains the rendered text, and ensure the mount info references the resolved path.

### Tests for User Story 1

- [ ] T005 [P] [US1] Add `cli/tests/unit/templates/render.test.ts` that exercises the template processor, verifying Handlebars rendering, temporary file creation, and resolved container path with environment substitution. (cli/tests/unit/templates/render.test.ts)

### Implementation for User Story 1

- [ ] T006 [US1] Implement the template processor in `cli/src/lib/templates/processor.ts` to render Handlebars templates with `parameters`, resolve `${VAR}` placeholders against current env values, write each output to a temp file, and emit `RenderedFile` metadata. (cli/src/lib/templates/processor.ts)
- [ ] T007 [US1] Update `cli/src/services/session.ts` to call the template processor before invoking Podman, append each generated `extraMounts` entry, and bubble up rendering errors so container launch fails fast when template creation fails. (cli/src/services/session.ts)

### Parallel Example: User Story 1

Tasks `T005` (unit test) and `T006` (processor implementation) can run together because they touch separate files; once both finish, `T007` (session integration) can use their outputs without blocking parallel progress.

---

## Phase 4: User Story 2 - Merge local and global template definitions (Priority: P2)

**Goal**: Deep-merge global and local template definitions by name so project overrides and extensions work without duplicating shared config.

**Independent Test**: Supply a global template and a local template with the same name but different parameters/paths and assert the merged result respects local overrides and fails if required fields are missing.

### Tests for User Story 2

- [ ] T008 [P] [US2] Add `cli/tests/unit/templates/merge.test.ts` that covers deep merging of two template definitions with the same name, asserting local values win and missing required fields produce a validation error. (cli/tests/unit/templates/merge.test.ts)

### Implementation for User Story 2

- [ ] T009 [US2] Implement deep merge logic in `cli/src/lib/templates/merge.ts` (used by the processor) that joins template entries by name, merges nested `parameters`, and validates presence of `name`, `path`, and `template`. (cli/src/lib/templates/merge.ts)
- [ ] T010 [US2] Wire the merge helper into the template processor so resolved configs feed merged definitions while preserving the clear error cases defined in the spec. (cli/src/lib/templates/processor.ts)

### Parallel Example: User Story 2

Run `T008` (merge unit test) while developing `T009` (merge helper) so tests fail fast; once both are complete, `T010` simply hooks them together inside the processor without blocking the other story work.

---

## Phase 5: User Story 3 - Suppress unwanted templates via CLI (Priority: P3)

**Goal**: Allow users to skip specific templates from rendering/mounting through a CLI flag so they can adapt runs without editing configs.

**Independent Test**: Pass a suppression list to the CLI and confirm the corresponding templates do not produce temp files or container mounts.

### Tests for User Story 3

- [ ] T011 [P] [US3] Add `cli/tests/unit/templates/suppression.test.ts` that feeds a suppression list into the processor and verifies suppressed names are absent from the rendered output and mount list. (cli/tests/unit/templates/suppression.test.ts)

### Implementation for User Story 3

- [ ] T012 [US3] Add a repeated `--suppress <template>` option to `cli/src/cli/commands/run.ts`, collect the names into an array, and document the flag in CLI help text. (cli/src/cli/commands/run.ts)
- [ ] T013 [US3] Extend `cli/src/services/session.ts` to accept the suppression list, pass it to the template processor, and honor it when building `extraMounts` so suppressed templates never reach Podman. (cli/src/services/session.ts)

### Parallel Example: User Story 3

`T011` (suppression test) and `T012` (CLI flag) can be implemented in parallel because they touch distinct files, then `T013` integrates the handler into the session once the foundations exist.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap up documentation and ensure the quickstart reflects the new flow.

- [ ] T014 Update `specs/005-container-file-templates/quickstart.md` to include the template config schema, env variable resolution behavior, and the new `--suppress` flag so users can exercise the feature end-to-end. (specs/005-container-file-templates/quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Unblocked and should run first but can overlap if multiple people work on `cli/src/lib/templates` while adding the dependency.
- **Phase 2 (Foundational)**: Blocks all user stories; must finish before Phase 3 onwards begin.
- **Phase 3/4/5 (User Stories)**: Each story depends on Phase 2 but can be implemented in parallel once foundational work is ready.
- **Phase 6 (Polish)**: Depends on at least US1; ideally after the core flows are stable.

### User Story Dependencies / Graph
- **US1** → **US2** → **US3** (each story builds on the previous feature so the full experience is delivered progressively).

### Parallel Opportunities Identified
- Flagged `[P]` tasks can all run in parallel, especially the test tasks for each story.
- Story phases themselves are independent once Phase 2 is complete, so multiple engineers may tackle US1+US2+US3 simultaneously.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 and Phase 2 to make template data available and renderable.
2. Deliver US1 (T005–T007) to prove templated files mount correctly.
3. Validate via the new render unit test and manual CLI run.
4. Ship the MVP because it already satisfies the primary user value (templated mounts) even before suppression or merging refinements.

### Incremental Delivery
1. Phase 1 + Phase 2 collaborate to ready the config and processor scaffolding.
2. Add US1, test it, and release or demo the templated mount capability.
3. Layer in US2 (T008–T010) so teams can override shared templates without duplication.
4. Finish US3 (T011–T013) to let users opt out of files via CLI.
5. Each story is independently testable and deployable, matching the spec's emphasis on incremental validation.

### Parallel Team Strategy
- Engineer A: US1 render pipeline (T005–T007).
- Engineer B: US2 deep merge helper & tests (T008–T010).
- Engineer C: US3 suppression flag & session hookup (T011–T013).
- Documentation (T014) can run concurrently with any story once core tasks settle.

---

## Notes
- Every task above respects the checklist format with unique IDs and file paths.
- Tests are explicit per story so the compiler harness (Vitest) catches regressions early.
- Keep template-related logic isolated inside `cli/src/lib/templates/` to honor the constitution's modularity principle.
