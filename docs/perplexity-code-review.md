# Perplexity Code Review Guide

Use this guide to have Perplexity review the Capacity Planning app code, architecture, and Netlify/Neon setup.

---

## Files and Paths to Reference

### Architecture & design
- **High-level architecture** (stack, data model, API, estimation logic): `../architecture.md` (project root: `Planning Agent/architecture.md`)
- **Product overview & goals**: `../project.md` (project root: `Planning Agent/project.md`)
- **App deployment notes**: `project.md` (this repo root)

### Netlify setup
- **Build & functions config**: `netlify.toml` (repo root)
- **Netlify + Neon (recommended)**: `docs/setup-netlify-db.md`
- **Local Netlify dev**: `docs/setup-netlify-dev.md`, `docs/run-netlify-dev-with-env.md`, `docs/final-solution-netlify-dev.md`
- **Site & env**: `docs/create-netlify-site.md`, `docs/add-env-var-to-netlify.md`, `docs/enable-netlify-db.md`
- **Existing functions code review**: `docs/netlify-functions-code-review.md`

### Neon (Postgres) setup
- **Connection string**: `docs/get-neon-connection-string.md`
- **.env from Neon dialog**: `docs/setup-env-from-neon-dialog.md`
- **Neon SQL**: `docs/neon-sql-syntax.md`
- **DB schema**: `database/schema.sql`

### App code
- **Netlify functions**: `netlify/functions/` (e.g. `create-roadmap-item.ts`, `get-roadmap-items.ts`, `db-health.ts`, `db-connection.ts`, scenario/settings/activity-log handlers)
- **Frontend**: `src/` (`App.tsx`, `pages/`, `components/`, `context/`, `config/`)
- **Estimation logic**: `src/estimation/logic.ts`, `src/config/effortModel.ts`, `src/config/sprints.ts`
- **Domain types**: `src/domain/types.ts`

### Related Perplexity docs
- **Test plan**: `docs/test-plan-for-perplexity.md`
- **Test prompts**: `docs/perplexity-test-prompts.md`

---

## Suggested prompt for Perplexity

Copy and paste the following (and attach or paste the relevant files if needed):

```
Review the capacity planning app code and architecture. Focus on:

1. **Architecture & domain model** – architecture.md and project.md (high-level design, entities, estimation logic, API design).

2. **Netlify setup** – netlify.toml (build, functions, dev) and docs/setup-netlify-db.md. Check for correct build command, publish directory, functions directory, and any dev/serverless gotchas.

3. **Neon Postgres setup** – docs/get-neon-connection-string.md and docs/setup-env-from-neon-dialog.md. How the app gets NETLIFY_DATABASE_URL, pooling vs direct connection, and schema deployment (database/schema.sql).

4. **Netlify functions** – netlify/functions/ (e.g. create-roadmap-item, get-roadmap-items, db-health, db-connection, scenario/settings/activity-log). Cross-reference docs/netlify-functions-code-review.md for known security/type/error-handling issues.

5. **Database schema** – database/schema.sql and how it aligns with the domain model in architecture.md.

Summarize the design, point out any risks or inconsistencies (e.g. architecture doc still mentioning Google Sheets vs current Neon usage), and suggest concrete improvements.
```

---

## Note on architecture.md

The root `architecture.md` describes Google Sheets as the data store. The app now uses **Neon Postgres** via Netlify (Netlify DB / `NETLIFY_DATABASE_URL`). The docs under `capacity-planning-app/docs/` reflect the current Netlify + Neon setup.
