# Research: Pierwsze Demo MVP Screeningu

## Decision: Use Render Postgres for the hosted demo database

**Rationale**: The user wants an online demo deployable through Render. SQLite would be fast locally, but a hosted SQLite file needs durable filesystem storage. Render persistent disks are a paid-service feature, while Render Postgres is a better fit for an online demo and matches the future SaaS direction.

**Alternatives considered**:

- SQLite local only: fastest, but not suitable for a shareable hosted demo.
- SQLite with Render persistent disk: workable, but adds paid disk dependency and is less aligned with production direction.
- Supabase/Neon Postgres: valid, but adds another external provider when Render Postgres is enough for the first demo.

## Decision: Use demo login, not production authentication

**Rationale**: The demo must show three roles and role-gated screens without expanding scope into account recovery, registration, password security and operational auth concerns. Demo login gives a credible SaaS flow while staying focused on the client call.

**Alternatives considered**:

- Role switcher only: fastest, but less credible for a multi-tenant SaaS presentation.
- Full production auth: stronger long term, but too large for the first demo plan.

## Decision: Implement deterministic matching and simple rules

**Rationale**: The demo needs to prove the screening concept, not become a complete compliance engine. Matching should be deterministic and explainable: exact CAS, exact EC, then normalized/fuzzy name fallback. Rules should support a first-demo `AND` condition using product type and concentration.

**Alternatives considered**:

- UI-only fake results: faster, but fails to prove the core screening behavior.
- Full rule engine: too broad before the client confirms final MVP scope and budget.

## Decision: Use GitHub Actions plus Render deploy hook

**Rationale**: GitHub Actions can run install, checks, tests, build and migration/seed steps before deployment. Render deploy hook keeps hosting simple and avoids manual deploy steps.

**Alternatives considered**:

- Render auto-deploy only: simpler, but less control over pre-deploy validation.
- Manual deploy: acceptable for a throwaway demo, but weaker for a client-facing SaaS workflow.

## Decision: Keep result wording illustrative

**Rationale**: The system is a demo and must not imply final legal or chemical compliance advice. Every presented result should be framed as a demonstrative screening outcome.

**Alternatives considered**:

- Domain-specific legal wording: could look polished, but requires legal/domain approval.
- No disclaimer: risky and inconsistent with the spec.
