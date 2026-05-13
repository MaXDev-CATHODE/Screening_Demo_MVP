# Implementation Plan: Pierwsze Demo MVP Screeningu

**Branch**: `001-screening-demo-mvp` | **Date**: 2026-05-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-screening-demo-mvp/spec.md`

## Summary

Build an interactive full-stack demo of a B2B SaaS screening workflow. The demo will show role-based access, sample product data with CAS/EC/name/type/concentration, configurable reference-list rules, deterministic matching, screening results and ready business comments. The implementation will use a single Next.js/React TypeScript app, Prisma, Render Postgres, GitHub Actions and a Render deploy hook so the demo can be shown online during the client call.

## Technical Context

**Language/Version**: TypeScript on current LTS Node.js, with React and Next.js App Router.

**Primary Dependencies**: Next.js, React, Prisma, Prisma Client, a lightweight test stack for unit/integration tests, and Playwright for end-to-end demo flow verification.

**Storage**: Render Postgres for hosted demo; local development uses a PostgreSQL-compatible database connection through `DATABASE_URL`.

**Testing**: Unit tests for matching/rule helpers, integration tests for API routes, and Playwright smoke/E2E tests for the main user journey.

**Target Platform**: Browser-based web application hosted as a Node web service on Render.

**Project Type**: Single full-stack web application.

**Performance Goals**: A non-technical viewer can complete product selection to screening result in under 3 minutes; demo API actions should feel immediate for seeded sample data.

**Constraints**: Hosted demo must avoid production-sensitive data, use deterministic synthetic seed data, and clearly label outputs as illustrative rather than final compliance advice.

**Scale/Scope**: First demo only: one to two sample companies, three demo roles, several products/substances, at least two reference lists, one configurable rule path and three result outcomes (`match`, `no match`, `verification required`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The current constitution file is still the Speckit placeholder and does not define active project-specific gates. No enforceable constitution violations are present. The plan follows the available project guidance by keeping this step to planning artifacts only and deferring implementation to `speckit-tasks` and `speckit-implement`.

**Initial Gate**: PASS - no active custom principles found.

**Post-Design Gate**: PASS - generated design artifacts stay within the locked demo MVP scope and do not introduce implementation work.

## Project Structure

### Documentation (this feature)

```text
specs/001-screening-demo-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md              # Created later by speckit-tasks
```

### Source Code (repository root)

```text
app/
├── (auth)/
├── (dashboard)/
├── api/
└── layout.tsx

components/
├── dashboard/
├── forms/
└── ui/

lib/
├── auth/
├── matching/
├── rules/
└── validation/

prisma/
├── schema.prisma
└── seed.ts

tests/
├── e2e/
├── integration/
└── unit/

.github/
└── workflows/
    └── deploy.yml
```

**Structure Decision**: Use a single Next.js full-stack app. UI routes, route handlers, matching helpers, rule helpers, Prisma schema, seed data and tests stay in one repository so the demo remains fast to build, easy to deploy and easy to hand to `speckit-tasks`.

## Phase 0: Research Output

Research decisions are captured in [research.md](./research.md). All previous deployment and scope unknowns are resolved.

## Phase 1: Design Output

Design artifacts are captured in:

- [data-model.md](./data-model.md)
- [contracts/openapi.yaml](./contracts/openapi.yaml)
- [quickstart.md](./quickstart.md)

## Complexity Tracking

No constitution violations or unnecessary complexity exceptions are required for this planning phase.
