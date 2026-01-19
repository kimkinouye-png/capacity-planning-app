# Next Steps After Linking to Netlify

Great! Your project is now linked to Netlify. Here's what to do next:

## 1. Initialize the Database

Now that your project is linked, you can initialize the database:

```bash
npx netlify db init
```

When prompted:
- **"Set up Drizzle boilerplate?"** → Answer **`n`** (No)

This will:
- ✅ Provision a Neon Postgres database
- ✅ Automatically set `NETLIFY_DATABASE_URL` in your Netlify project
- ✅ Make it available for local development

## 2. Run the Database Schema

After the database is provisioned, you need to create the tables:

### Option A: Using Netlify Dashboard
1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Copy the `NETLIFY_DATABASE_URL` value
4. Connect to the database using a SQL client (like DBeaver, pgAdmin, or VS Code's PostgreSQL extension)
5. Run the SQL script from `database/schema.sql`

### Option B: Using psql (if installed)
```bash
# Get connection string from Netlify dashboard, then:
psql "your-connection-string-here" -f database/schema.sql
```

## 3. Start Local Development

Once the database is set up:

```bash
npm run dev:netlify
```

Or:
```bash
npx netlify dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Start Netlify Functions proxy on `http://localhost:8888`
- Make your functions available at `http://localhost:8888/.netlify/functions/{function-name}`

## 4. Test the Setup

1. Open `http://localhost:5173` in your browser
2. Navigate to the Settings page (`/settings`)
3. Verify that settings load from the database
4. Try updating a setting and verify it saves

## Troubleshooting

### Database connection errors
- Verify `NETLIFY_DATABASE_URL` is set in Netlify dashboard
- Check that the database schema has been run
- Ensure your Neon database is not paused

### Functions not working
- Check terminal output for compilation errors
- Verify functions are in `netlify/functions/` directory
- Check that `netlify.toml` has correct functions configuration
