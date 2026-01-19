# Quick Setup Commands

Since `netlify-cli` is installed as a dev dependency (not globally), use `npx` to run all Netlify commands.

## Step-by-Step Commands

### 1. Login to Netlify
```bash
npx netlify login
```
This will open a browser window for authentication.

### 2. Link Your Project
```bash
npx netlify link
```
Follow the prompts to select your Netlify site. This creates a `.netlify` directory with site configuration.

### 3. Initialize Database
```bash
npx netlify db init
```
When prompted "Set up Drizzle boilerplate?", answer **`n`** (No) since we're using raw SQL.

### 4. Run Database Schema
After the database is provisioned, you'll need to run the schema:
- Get the connection string from Netlify dashboard (Site settings > Environment variables)
- Connect to the database and run `database/schema.sql`

### 5. Start Development
```bash
npm run dev:netlify
```
Or:
```bash
npx netlify dev
```

## All Commands Use `npx`

Remember: Since `netlify-cli` is a dev dependency, always use:
- `npx netlify login` (not `netlify login`)
- `npx netlify link` (not `netlify link`)
- `npx netlify db init` (not `netlify db init`)
- `npx netlify dev` (not `netlify dev`)
