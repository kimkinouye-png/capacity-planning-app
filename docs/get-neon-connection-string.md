# How to Get Your Neon Database Connection String

## Step 1: Access Your Neon Dashboard

1. Go to https://console.neon.tech
2. Log in to your Neon account
3. Select your project (or create a new one if you haven't)

## Step 2: Find Your Connection String

### Option A: From the Dashboard (Recommended)

1. In your Neon project dashboard, you'll see a section called **"Connection Details"** or **"Connection String"**
2. Look for a connection string that looks like:
   ```
   postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
3. Click the **"Copy"** button next to it

### Option B: From Project Settings

1. Click on your project name
2. Go to **Settings** or **Connection Details**
3. You'll see connection strings for different environments
4. Copy the connection string (it may be labeled as "Connection string" or "Postgres connection string")

### Option C: Build It Manually

If you need to build it manually, you'll need:

1. **Username**: Found in your Neon project settings (usually something like `neondb_owner` or a custom username)
2. **Password**: The password you set when creating the database (or reset it in settings)
3. **Host**: Found in connection details (looks like `ep-xxxx-xxxx.region.aws.neon.tech`)
4. **Database**: Usually `neondb` or the name you gave it

Format:
```
postgresql://<username>:<password>@<host>/<database>?sslmode=require
```

## Step 3: Create Your .env File

1. In your project root directory, create a file named `.env` (if it doesn't exist)
2. Add the connection string:

```bash
NETLIFY_DATABASE_URL=postgresql://your-username:your-password@your-host/your-database?sslmode=require
```

**Important**: Replace the entire connection string with the one you copied from Neon.

## Example

If Neon gives you:
```
postgresql://neondb_owner:MyPassword123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Your `.env` file should contain:
```bash
NETLIFY_DATABASE_URL=postgresql://neondb_owner:MyPassword123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Security Notes

⚠️ **Never commit your `.env` file to git!** It's already in `.gitignore`, but double-check.

- The `.env` file is for local development only
- For production, set `NETLIFY_DATABASE_URL` in your Netlify dashboard (Site settings > Environment variables)
- The connection string contains sensitive credentials

## Troubleshooting

### "Connection refused" or "Cannot connect"
- Verify the connection string is correct
- Check that your Neon database is not paused (Neon pauses inactive databases)
- Ensure `sslmode=require` is included

### "Authentication failed"
- Double-check your username and password
- You can reset your password in Neon dashboard under project settings

### "Database does not exist"
- Verify the database name in the connection string
- Check that you've run the schema migration (`database/schema.sql`)

## Next Steps

After setting up your `.env` file:

1. Run the database schema: Execute `database/schema.sql` against your Neon database
2. Test the connection: Run `npm run dev:netlify` and check if the Settings page loads
3. Verify functions work: Check the browser console and terminal for any errors
