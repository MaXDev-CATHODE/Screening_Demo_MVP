# Quickstart: Pierwsze Demo MVP Screeningu

## Prerequisites

- Node.js LTS installed locally.
- Access to a PostgreSQL database for local development or a Render Postgres instance.
- GitHub repository connected to Render.
- Render web service and Render Postgres database created for the demo.

## Local Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Set required environment variables in `.env`:

   ```text
   DATABASE_URL=<postgres-connection-string>
   DEMO_SESSION_SECRET=<local-demo-secret>
   ```

4. Apply database migrations:

   ```powershell
   npx prisma migrate dev
   ```

5. Seed synthetic demo data:

   ```powershell
   npm run seed
   ```

6. Run the app:

   ```powershell
   npm run dev
   ```

7. Open the local URL shown by the dev server and use demo login:

   - SuperAdministrator
   - Administrator firmy
   - Użytkownik standardowy

## Validation Commands

Run before preparing a client demo:

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` starts the app with `DEMO_DATA_MODE=memory` from `playwright.config.ts`.
This keeps local browser tests independent from a local PostgreSQL server. The deployed Render
demo still uses `DATABASE_URL` and Render Postgres.

## GitHub Actions Secrets

Configure these repository secrets before enabling deploy workflow:

```text
DATABASE_URL
DEMO_SESSION_SECRET
RENDER_DEPLOY_HOOK_URL
```

## Render Checklist

- Create a Render Postgres database.
- Create a Render web service connected to the GitHub repository.
- Set build command to install dependencies, generate Prisma client and build the app.
- Set start command to run the production Next.js server.
- Add required environment variables on Render:
  - `DATABASE_URL`
  - `DEMO_SESSION_SECRET`
- Use GitHub Actions to run checks, migrations, seed and trigger the Render deploy hook.

## Demo Script

1. Log in as SuperAdministrator.
2. Show global reference list management.
3. Show the rule: product type is mixture and concentration is greater than `0.1%`.
4. Log in as Administrator firmy.
5. Show product data with CAS, EC, name, type and concentration.
6. Log in as Użytkownik standardowy.
7. Select a product and reference list.
8. Run screening.
9. Show status, matched field, reason and ready business comment.
10. Point out that results are illustrative and not final legal or chemical compliance advice.

## Demo Caveats

- The local E2E path uses synthetic in-memory data only.
- Production-like persistence is covered by Prisma schema, migrations and Render Postgres setup.
- Demo auth intentionally uses seeded role login, not production registration or password recovery.
