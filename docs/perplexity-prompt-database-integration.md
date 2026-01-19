# Perplexity Prompt: Database Integration Update

Use this prompt in Perplexity to document the database integration changes:

---

## Prompt for Perplexity

**Document the following updates to the Capacity Planning App database integration:**

### Phase 4: Database Integration & Global Settings (Completed January 19, 2026)

**What was implemented:**

1. **Neon Postgres Database Setup**
   - Integrated Neon Postgres database via Netlify DB
   - Created complete database schema with 4 tables: `settings`, `scenarios`, `roadmap_items`, `activity_log`
   - Configured automatic environment variable (`NETLIFY_DATABASE_URL`) via Netlify DB extension
   - Database connection using `@netlify/neon` package (automatically uses environment variable)

2. **Global Settings Page**
   - New `/settings` route with comprehensive settings form
   - Configurable UX Factor Weights (3 factors: Product Risk, Problem Ambiguity, Discovery Depth)
   - Configurable Content Factor Weights (4 factors: Content Surface Area, Localization Scope, Regulatory & Brand Risk, Legal Compliance Dependency)
   - PM Intake Overall Multiplier configuration
   - Focus-time Ratio configuration (0.0-1.0 range, default 0.75)
   - Size-band Thresholds configuration (XS, S, M, L, XL with custom thresholds)
   - "Reset to Defaults" functionality
   - Settings persist to Neon database and load on app start

3. **SettingsContext Implementation**
   - New React Context (`SettingsContext`) for global settings management
   - Fetches settings from database via `/.netlify/functions/get-settings`
   - Saves settings via `/.netlify/functions/update-settings`
   - Handles loading states and error handling with graceful fallback to defaults
   - Settings automatically available to all components via `useSettings()` hook

4. **Netlify Functions (Serverless API)**
   - `get-settings.ts`: Fetches global settings, creates default if missing
   - `update-settings.ts`: Updates settings with validation
   - `get-scenarios.ts`: Prepared for future integration (not yet connected to React)
   - `create-scenario.ts`: Prepared for future integration (not yet connected to React)
   - All functions use `@netlify/neon` for automatic database connection
   - CORS headers configured for local development

5. **Effort Calculation Integration**
   - Updated `calculateEffort()` function to accept optional settings parameter
   - `calculateWeightedScore()` now uses settings weights if provided
   - `mapScoreToSizeBand()` uses settings thresholds if provided
   - `calculateWorkWeeks()` uses settings focus-time ratio if provided
   - Form components (`PDInputsForm`, `CDInputsForm`) use settings from context

6. **Database Schema**
   - PostgreSQL schema with UUID primary keys
   - JSONB columns for flexible data storage (effort_model, time_model, size_bands, pm_intake, ux_factors, content_factors)
   - Automatic timestamp triggers for `updated_at` fields
   - Indexes for performance optimization
   - Foreign key relationships (roadmap_items → scenarios)

**Current Status:**
- ✅ Settings fully integrated with database (load, save, reset)
- ✅ Settings affect all effort calculations globally
- ✅ Database schema created and deployed
- ✅ Netlify Functions created and working
- ⏳ Scenarios still use localStorage (Phase 5)
- ⏳ Roadmap items still use localStorage (Phase 5)
- ⏳ Activity log still uses localStorage (Phase 5)

**Technical Stack:**
- Database: Neon Postgres (via Netlify DB)
- Backend: Netlify Functions (TypeScript)
- Frontend: React with Context API
- Connection: `@netlify/neon` package (automatic environment variable usage)

**Documentation Created:**
- Database setup guides
- QA testing guide
- Manual setup instructions
- Quick reference checklists

**Next Steps (Phase 5):**
- Integrate scenarios with database (update PlanningSessionsContext)
- Create and integrate roadmap items functions
- Create and integrate activity log functions
- Data migration from localStorage to database

---

**Please summarize these changes in a clear, technical format suitable for documentation, highlighting what was completed, what's pending, and the technical architecture.**
