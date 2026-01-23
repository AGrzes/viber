<!--
Sync Impact Report
- Version: N/A (template) → 1.0.0
- Modified principles: template placeholders → I. Elegant Simplicity, II. Modular Boundaries, III. Use Proven OSS, IV. Tests as Safety Harness, V. Pragmatic Scope & Clarity
- Added sections: Operating Constraints, Development Workflow (concrete content)
- Removed sections: None (all placeholders replaced)
- Templates requiring updates: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md, ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: Provide official [PROJECT_NAME] once decided
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

### IV. Tests as Safety Harness and Design Shaper
Tests exist to lock in behavior, prevent regressions, and inform design. Choose the minimum set that
catches known risks (unit where cheap, integration where contracts interact). Avoid test bloat and
slow suites, but never skip coverage for previously broken or risky areas.

### V. Pragmatic Scope & Self-Explanatory Code
Less is more. Build for the main cases of the intended lifespan; avoid gold plating and speculative
corner coverage. Code and naming must carry the meaning—comments and docs exist only to clarify
non-obvious decisions.

## Operating Constraints

- Favor small, composable files and functions; delete dead code promptly.
- Prefer configuration over forks; minimize bespoke build or deployment steps.
- When adding dependencies, record license and update policy; remove stale ones early.
- Keep communication concise: surface decisions, trade-offs, and contracts; omit narrative fluff.

## Development Workflow

- Define module contracts before implementation; renegotiate contracts in review, not after release.
- Start from existing OSS/library capabilities; only code what the gap requires.
- Write tests that pin risky behavior before changing it; remove flaky/brittle tests or harden them.
- Keep pull requests small, purpose-driven, and traceable to a contract or defect.
- Bias to ship the simplest viable version; iterate when real usage justifies it.

## Governance

This constitution supersedes other practice docs. Amendments require a documented rationale, version
bump, and reviewer acknowledgment of principle impacts. Use semantic versioning for this document:
MAJOR for principle removals/redefinitions, MINOR for new principles or expanded guidance, PATCH for
clarifications. Every pull request must state compliance or list explicit, temporary exceptions with
expiry dates. Retrospectives will review exceptions and prune code or tests that violate principles.

**Version**: 1.0.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-23
