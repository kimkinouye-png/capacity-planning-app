# Setting Up Netlify DB (Recommended Method)

Netlify DB is powered by Neon and provides the easiest way to set up your database. It automatically provisions, connects, and configures everything for you.

## Quick Setup

### 1. Initialize Netlify DB

Run this command in your project root:

```bash
npx netlify db init
```

This will:
- ✅ Provision a Neon Postgres database automatically
- ✅ Set up the connection
- ✅ Configure environment variables in your Netlify project
- ✅ Set `NETLIFY_DATABASE_URL` automatically

### 2. Verify Setup

After running `npx netlify db init`, check:

1. **Netlify Dashboard**: Go to your site settings > Environment variables
   - You should see `NETLIFY_DATABASE_URL` automatically set

2. **Local Development**: The connection string is also available when you run `netlify dev`

### 3. Run Database Schema

After the database is provisioned, you still need to run the schema:

1. Get your connection string from Netlify dashboard (Site settings > Environment variables)
2. Connect to the database using a SQL client
3. Run the SQL script from `database/schema.sql`

Or, if you have `psql` installed:

```bash
# Get the connection string from Netlify dashboard, then:
psql "your-connection-string-here" -f database/schema.sql
```

## Benefits of Netlify DB

- **Automatic provisioning**: No manual Neon account setup needed
- **Integrated**: Works seamlessly with Netlify Functions
- **Secure**: Environment variables managed by Netlify
- **Free tier**: Generous free tier for development
- **Easy upgrades**: Can upgrade to Neon's full platform when needed

## Alternative: Manual Neon Setup

If you prefer to set up Neon manually:
1. Sign up at https://neon.tech
2. Create a project
3. Get the connection string
4. Set `NETLIFY_DATABASE_URL` in Netlify dashboard

See `docs/get-neon-connection-string.md` for manual setup instructions.
