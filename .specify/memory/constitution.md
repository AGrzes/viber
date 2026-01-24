<!--
Sync Impact Report
- Version: 1.0.0 → 1.1.0
- Modified principles: IV. Tests as Safety Harness and Design Shaper → IV. Explicit Testing Baseline
- Added sections: Principle VI. Deterministic Tools Over LLMs
- Removed sections: None
- Templates requiring updates: ✅ /workdir/.specify/templates/plan-template.md, ✅ /workdir/.specify/templates/spec-template.md, ✅ /workdir/.specify/templates/tasks-template.md
- Follow-up TODOs: TODO(PROJECT_NAME) remains until official project name is set
-->

# TODO(PROJECT_NAME) Constitution

## Core Principles

### I. Elegant Simplicity (Not Simplistic)
Solve complex problems with as little, general-purpose code as possible; never duplicate primitive
operations or add ceremony for its own sake. Favor clear, direct solutions readable by a competent
peer who has limited time. Extra layers, abstractions, and repetition that do not remove real
complexity are rejected.

### II. Modular Boundaries by Default
Each module is independently rewritable. Contracts are explicit (inputs/outputs/errors), internal
state is encapsulated, and cross-module coupling stays minimal. Interfaces change only with
deliberate versioned decisions.

### III. Use Proven OSS, Don't Reinvent
Prefer stable, well-maintained open-source libraries over homegrown solutions. Before writing new
code, justify why existing libraries are insufficient. Track licenses and updates; owning less code
reduces maintenance and test burden.

### IV. Explicit Testing Baseline
Every feature MUST define and implement a minimal set of unit tests that prove core behavior works
at all (happy path plus critical guardrails). Specs MUST include a Testing Requirements section that
enumerates these unit tests. Favor small, fast tests; avoid bloated suites, but never skip coverage
for previously broken or risky areas.

### V. Pragmatic Scope & Self-Explanatory Code
Less is more. Build for the main cases of the intended lifespan; avoid gold plating and speculative
corner coverage. Code and naming must carry the meaning—comments and docs exist only to clarify
non-obvious decisions.

### VI. Deterministic Tools Over LLMs
Prefer deterministic tooling (formatters, compilers like `tsc`, and code generators for OpenAPI or
schemas) over LLM-driven transformations for mechanical changes. Use LLMs for reasoning and design,
not for replacing stable, reproducible tooling outputs.

## Operating Constraints

- Favor small, composable files and functions; delete dead code promptly.
- Prefer configuration over forks; minimize bespoke build or deployment steps.
- When adding dependencies, record license and update policy; remove stale ones early.
- Keep communication concise: surface decisions, trade-offs, and contracts; omit narrative fluff.
- Use deterministic tools for formatting, compilation, and code generation before LLM-driven edits.

## Development Workflow

- Define module contracts before implementation; renegotiate contracts in review, not after release.
- Start from existing OSS/library capabilities; only code what the gap requires.
- Write minimal unit tests that prove core behavior works; add integration tests only where contracts
  interact. Remove flaky/brittle tests or harden them.
- Keep pull requests small, purpose-driven, and traceable to a contract or defect.
- Bias to ship the simplest viable version; iterate when real usage justifies it.

## Governance

This constitution supersedes other practice docs. Amendments require a documented rationale, version
bump, and reviewer acknowledgment of principle impacts. Use semantic versioning for this document:
MAJOR for principle removals/redefinitions, MINOR for new principles or expanded guidance, PATCH for
clarifications. Every pull request must state compliance or list explicit, temporary exceptions with
expiry dates. Retrospectives will review exceptions and prune code or tests that violate principles.

**Version**: 1.1.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-24
