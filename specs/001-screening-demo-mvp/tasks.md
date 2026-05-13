# Tasks: Pierwsze Demo MVP Screeningu

**Input**: Design documents from `specs/001-screening-demo-mvp/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Included. The implementation plan explicitly requires unit, integration and Playwright E2E validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks in the same phase because it touches different files and has no dependency on unfinished tasks.
- **[Story]**: User story label for story phases only: `[US1]`, `[US2]`, `[US3]`, `[US4]`.
- Every task includes at least one exact target file path.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the empty Next.js/React TypeScript project skeleton, toolchain and deployment shell. No product behavior is implemented in this phase.

- [X] T001 Initialize the Next.js/React TypeScript application metadata and scripts in `package.json`, `tsconfig.json`, and `next.config.ts`
- [X] T002 Create the root App Router layout and global stylesheet in `app/layout.tsx` and `app/globals.css`
- [X] T003 [P] Add base environment documentation in `.env.example`
- [X] T004 [P] Add repository ignore rules for Node, Next.js, Prisma and local env files in `.gitignore`
- [X] T005 [P] Configure Prisma package scripts and seed command references in `package.json`
- [X] T006 [P] Configure unit and integration test runner setup in `vitest.config.ts` and `tests/setup.ts`
- [X] T007 [P] Configure Playwright E2E test setup in `playwright.config.ts`
- [X] T008 [P] Create the GitHub Actions CI/deploy workflow shell in `.github/workflows/deploy.yml`
- [X] T009 Create shared source directories with placeholder index files in `components/ui/index.ts`, `components/dashboard/index.ts`, `components/forms/index.ts`, `lib/index.ts`, and `tests/README.md`

**Checkpoint**: Project skeleton exists and future tasks have stable paths to modify.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared database, auth, validation, matching, rule and layout primitives that all user stories depend on.

**Critical**: No user story work should begin until this phase is complete.

- [X] T010 Define the Prisma schema for Company, User, Product, Substance, ReferenceList, ReferenceListItem, ScreeningRule, BusinessComment and ScreeningResult in `prisma/schema.prisma`
- [X] T011 [P] Create deterministic synthetic seed data for demo companies, users, products, substances, reference lists, rules and comments in `prisma/seed.ts`
- [X] T012 [P] Create the shared Prisma client wrapper in `lib/db/prisma.ts`
- [X] T013 [P] Define shared domain enums and TypeScript types in `lib/domain/types.ts`
- [X] T014 [P] Implement product and rule validation helpers in `lib/validation/product.ts` and `lib/validation/rule.ts`
- [X] T015 [P] Implement deterministic CAS, EC and normalized/fuzzy name matching helpers in `lib/matching/matcher.ts`
- [X] T016 [P] Implement first-demo rule evaluation helpers for product type and concentration thresholds in `lib/rules/evaluate.ts`
- [X] T017 Implement demo session cookie helpers in `lib/auth/session.ts`
- [X] T018 Implement role guard helpers for SuperAdministrator, Administrator firmy and UĹĽytkownik standardowy in `lib/auth/guards.ts`
- [X] T019 [P] Implement shared API response and error helpers in `lib/api/responses.ts`
- [X] T020 [P] Create the dashboard application shell in `components/dashboard/AppShell.tsx` and `app/(dashboard)/layout.tsx`
- [X] T021 [P] Create the root redirect/page entry in `app/page.tsx`
- [X] T022 [P] Create the reusable demo disclaimer component in `components/dashboard/DemoDisclaimer.tsx`

**Checkpoint**: Database shape, seed data, auth primitives, core matching/rules and base dashboard shell are ready.

---

## Phase 3: User Story 1 - Pokazanie Wyniku Screeningu Produktu (Priority: P1) MVP

**Goal**: A user can select a product and reference list, run screening, then see status, matched field, reason and ready business comment.

**Independent Test**: With seeded data and a demo session, run one screening from the UI and verify the result panel shows `match`, `no match`, or `verification required` with an explanation and comment.

### Tests for User Story 1

- [X] T023 [P] [US1] Add unit tests for CAS, EC and fuzzy-name matching in `tests/unit/matching.test.ts`
- [X] T024 [P] [US1] Add unit tests for rule evaluation including the exact `0.1` boundary in `tests/unit/rules.test.ts`
- [X] T025 [P] [US1] Add integration tests for `POST /api/screenings` and `GET /api/screenings/{id}` in `tests/integration/screenings.test.ts`

### Implementation for User Story 1

- [X] T026 [US1] Implement the screening orchestration service in `lib/screening/screening-service.ts`
- [X] T027 [US1] Implement ready business comment selection for screening outcomes in `lib/screening/comments.ts`
- [X] T028 [US1] Implement `POST /api/screenings` in `app/api/screenings/route.ts`
- [X] T029 [US1] Implement `GET /api/screenings/{id}` in `app/api/screenings/[id]/route.ts`
- [X] T030 [US1] Implement the product and reference-list selection screen in `app/(dashboard)/screening/page.tsx`
- [X] T031 [US1] Implement the screening result details panel in `components/dashboard/ScreeningResultPanel.tsx`
- [X] T032 [US1] Add Playwright E2E coverage for the main screening result flow in `tests/e2e/screening-flow.spec.ts`

**Checkpoint**: MVP story works independently and can be demoed before product import, rule management and role polish are expanded.

---

## Phase 4: User Story 2 - Dodanie PrzykĹ‚adowych Danych Produktowych (Priority: P2)

**Goal**: Administrator firmy can create or import small synthetic product datasets and see data quality status before screening.

**Independent Test**: Add one product manually and import a short product list; verify valid, limited and invalid records are handled as specified.

### Tests for User Story 2

- [X] T033 [P] [US2] Add integration tests for `GET /api/products` and `POST /api/products` in `tests/integration/products.test.ts`
- [X] T034 [P] [US2] Add integration tests for `POST /api/products/import` in `tests/integration/product-import.test.ts`
- [X] T035 [P] [US2] Add unit tests for concentration parsing and product data quality status in `tests/unit/product-validation.test.ts`

### Implementation for User Story 2

- [X] T036 [US2] Implement product create/list/import service logic in `lib/products/product-service.ts`
- [X] T037 [US2] Implement `GET /api/products` and `POST /api/products` in `app/api/products/route.ts`
- [X] T038 [US2] Implement `POST /api/products/import` in `app/api/products/import/route.ts`
- [X] T039 [US2] Implement the products dashboard page in `app/(dashboard)/products/page.tsx`
- [X] T040 [US2] Implement manual product entry and small JSON import controls in `components/forms/ProductForm.tsx`
- [X] T041 [US2] Implement data quality status badges in `components/dashboard/DataQualityBadge.tsx`
- [X] T042 [US2] Add Playwright E2E coverage for product creation, import and invalid concentration handling in `tests/e2e/product-data.spec.ts`

**Checkpoint**: Product data can be created, imported, validated and used by US1 screening.

---

## Phase 5: User Story 3 - Konfiguracja Prostej ReguĹ‚y Dla Listy Referencyjnej (Priority: P2)

**Goal**: SuperAdministrator can manage a reference list and configure a simple rule using product type and concentration.

**Independent Test**: Create or edit a rule where product type is `MIXTURE` and concentration is greater than `0.1`, then run screening against matching and non-matching products.

### Tests for User Story 3

- [X] T043 [P] [US3] Add integration tests for `GET /api/reference-lists` and `POST /api/reference-lists` in `tests/integration/reference-lists.test.ts`
- [X] T044 [P] [US3] Add integration tests for `GET /api/rules` and `POST /api/rules` in `tests/integration/rules.test.ts`
- [X] T045 [P] [US3] Add unit tests for rule input validation in `tests/unit/rule-validation.test.ts`

### Implementation for User Story 3

- [X] T046 [US3] Implement reference list service logic in `lib/reference-lists/reference-list-service.ts`
- [X] T047 [US3] Implement `GET /api/reference-lists` and `POST /api/reference-lists` in `app/api/reference-lists/route.ts`
- [X] T048 [US3] Implement rule create/list service logic in `lib/rules/rule-service.ts`
- [X] T049 [US3] Implement `GET /api/rules` and `POST /api/rules` in `app/api/rules/route.ts`
- [X] T050 [US3] Implement the reference lists dashboard page in `app/(dashboard)/reference-lists/page.tsx`
- [X] T051 [US3] Implement the first-demo rule builder form in `components/forms/RuleBuilder.tsx`
- [X] T052 [US3] Implement the active rule summary display in `components/dashboard/RuleSummary.tsx`
- [X] T053 [US3] Add Playwright E2E coverage for rule creation and screening effect in `tests/e2e/rule-builder.spec.ts`

**Checkpoint**: Reference list rules can be configured from UI and affect US1 screening output.

---

## Phase 6: User Story 4 - Pokazanie PodziaĹ‚u RĂłl I Przestrzeni Firmy (Priority: P3)

**Goal**: Demo visibly distinguishes SuperAdministrator, Administrator firmy and UĹĽytkownik standardowy, including company-scoped product access.

**Independent Test**: Log in as each seeded role and verify each role sees only its expected navigation and actions.

### Tests for User Story 4

- [X] T054 [P] [US4] Add integration tests for demo login, session and logout routes in `tests/integration/auth.test.ts`
- [X] T055 [P] [US4] Add unit tests for role guards and company scoping in `tests/unit/role-guards.test.ts`

### Implementation for User Story 4

- [X] T056 [US4] Implement `POST /api/auth/demo-login`, `GET /api/session` and `POST /api/logout` in `app/api/auth/demo-login/route.ts`, `app/api/session/route.ts`, and `app/api/logout/route.ts`
- [X] T057 [US4] Implement the demo login page with three role choices in `app/(auth)/login/page.tsx`
- [X] T058 [US4] Implement role-aware navigation in `components/dashboard/RoleNavigation.tsx`
- [X] T059 [US4] Implement unauthorized access handling in `app/(dashboard)/unauthorized/page.tsx`
- [X] T060 [US4] Implement company-scoped query filtering helpers in `lib/auth/company-scope.ts`
- [X] T061 [US4] Add Playwright E2E coverage for role switching, role-gated navigation and company-scoped product visibility in `tests/e2e/roles-and-company-space.spec.ts`

**Checkpoint**: Role separation and company-space behavior are clear enough for the client presentation.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Finish the client-facing demo quality, deployment readiness and documentation checks after selected user stories are complete.

- [X] T062 [P] Improve responsive dashboard styling and table readability in `app/globals.css` and `components/dashboard/AppShell.tsx`
- [X] T063 [P] Review and finalize illustrative compliance disclaimer copy in `components/dashboard/DemoDisclaimer.tsx`
- [X] T064 [P] Align implementation behavior with the API contract in `specs/001-screening-demo-mvp/contracts/openapi.yaml`
- [X] T065 Verify local setup, migration, seed, test, build and E2E commands against `specs/001-screening-demo-mvp/quickstart.md`
- [X] T066 Configure final GitHub Actions migration, seed and Render deploy hook steps in `.github/workflows/deploy.yml`
- [X] T067 Run final client-demo smoke flow and record any demo caveats in `specs/001-screening-demo-mvp/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP checkpoint.
- **Phase 4 US2**: Depends on Phase 2; integrates with US1 after both are available.
- **Phase 5 US3**: Depends on Phase 2; integrates with US1 after both are available.
- **Phase 6 US4**: Depends on Phase 2; can be developed alongside US2/US3.
- **Final Phase**: Depends on all desired user stories for the demo milestone.

### User Story Dependencies

- **US1**: MVP and first independently demonstrable slice after foundation.
- **US2**: Independent product-data workflow; improves realism for US1.
- **US3**: Independent rule-management workflow; affects US1 screening decisions.
- **US4**: Independent access-control workflow; wraps all screens with role context.

### Implementation Strategy

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 only, then stop and validate the MVP screening result flow.
3. Add Phase 4 and validate product data management.
4. Add Phase 5 and validate rule configuration changes screening output.
5. Add Phase 6 and validate role/company visibility.
6. Complete Final Phase for polish and deploy readiness.

---

## Parallel Execution Examples

### Setup

Run T003, T004, T005, T006, T007 and T008 in parallel after T001 establishes the project metadata.

### Foundation

Run T011, T012, T013, T014, T015, T016, T019, T020, T021 and T022 in parallel after T010 defines the schema target.

### User Stories

After Phase 2, separate implementers can work on US2, US3 and US4 in parallel. US1 should be completed first for the MVP checkpoint, but its tests T023, T024 and T025 can be written in parallel.

---

## Notes

- Tests in each user story should be written before implementation and should fail until the corresponding implementation tasks are complete.
- Keep demo data synthetic; do not add real customer or regulated data to `prisma/seed.ts`.
- Do not start implementation from this file until `speckit-implement` is explicitly requested.
