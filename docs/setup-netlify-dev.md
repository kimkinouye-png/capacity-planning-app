# Setting Up Local Development with Netlify Functions

This guide will help you set up local development with Netlify Functions and Neon Postgres database.

## Prerequisites

1. Node.js 18+ installed
2. A Neon Postgres database (sign up at https://neon.tech)
3. A Netlify account

## Step-by-Step Setup

### 1. Install Dependencies

All required dependencies should already be installed:
- `@netlify/functions` - Netlify Functions TypeScript support
- `@neondatabase/serverless` - Neon Postgres client
- `pg` - PostgreSQL client (for local development)
- `netlify-cli` - Netlify CLI (installed as dev dependency)

### 2. Install Netlify CLI Globally (Optional)

If you want to use `netlify` command globally:

```bash
npm install -g netlify-cli
```

Or use it via npx:
```bash
npx netlify --version
```

### 3. Log into Netlify

```bash
netlify login
```

This will open a browser window for authentication.

### 4. Link Your Local Repo to Netlify Site

If you haven't linked your local repository to your Netlify site:

```bash
netlify link
```

Follow the prompts to select your site. This creates a `.netlify` directory with site configuration.

### 5. Set Up Database (Choose One Method)

#### Option A: Netlify DB (Recommended - Easiest)

Run this command to automatically provision and configure your database:

```bash
npx netlify db init
```

This will:
- Automatically provision a Neon Postgres database
- Set up `NETLIFY_DATABASE_URL` environment variable
- Configure everything for you

**No manual connection string needed!**

#### Option B: Manual Neon Setup

If you prefer to set up Neon manually:

1. Sign up at https://neon.tech
2. Create a project and get your connection string
3. Create a `.env` file in the project root:
   ```bash
   NETLIFY_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
4. Or set it in Netlify dashboard: Site settings > Environment variables

See `docs/get-neon-connection-string.md` for detailed instructions.

### 6. Run Database Schema

Before running the app, you need to set up the database schema:

1. Connect to your Neon database using your preferred SQL client
2. Run the SQL script from `database/schema.sql`
3. This creates all necessary tables, indexes, and triggers

### 7. Start Local Development Server

Run both Vite dev server and Netlify Functions:

```bash
npm run dev:netlify
```

Or if you have netlify-cli installed globally:

```bash
netlify dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Start Netlify Functions proxy on `http://localhost:8888`
- Automatically proxy function requests from the React app

### 8. Verify Setup

1. Open `http://localhost:5173` in your browser
2. Navigate to Settings page (`/settings`)
3. Check browser console and terminal for any errors
4. Try updating a setting and verify it saves

## Troubleshooting

### Functions Not Loading

- Check that `netlify/functions` directory exists
- Verify `netlify.toml` has correct functions directory
- Check terminal output for function compilation errors

### Database Connection Errors

- Verify `NETLIFY_DATABASE_URL` is set correctly
- Check that database schema has been run
- Ensure your Neon database is accessible (not paused)

### CORS Errors

- Functions should handle CORS automatically
- Check that functions are returning proper CORS headers
- Verify API base URL in `SettingsContext.tsx` matches your dev environment

### Port Conflicts

- Vite dev server uses port 5173
- Netlify Functions proxy uses port 8888
- If ports are in use, Netlify CLI will prompt to use different ports

## Development Workflow

1. **Make changes to React app**: Changes hot-reload automatically
2. **Make changes to Functions**: Restart `netlify dev` to reload functions
3. **Test API endpoints**: Functions are available at `http://localhost:8888/.netlify/functions/{function-name}`

## Production Deployment

When you push to your main branch:
- Netlify automatically builds and deploys
- Functions are deployed to `/.netlify/functions/{function-name}`
- Environment variables from Netlify dashboard are used

## Next Steps

- [ ] Run database schema migration
- [ ] Set `NETLIFY_DATABASE_URL` environment variable
- [ ] Test Settings page functionality
- [ ] Verify effort calculations use settings from database
