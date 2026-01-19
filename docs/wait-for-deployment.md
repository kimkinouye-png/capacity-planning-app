# Waiting for Netlify Deployment

When you create a new Netlify site, it needs to complete the initial deployment before you can link to it locally.

## What to Do

1. **Wait for deployment to complete**
   - Go to your Netlify dashboard: https://app.netlify.com
   - Watch the deployment status
   - It will show "In progress" → "Building" → "Published" (or "Ready")

2. **Check deployment status**
   - The status will change from "In progress" to "Published" when complete
   - You'll see a green checkmark ✓ when it's done
   - The site URL will become active

3. **After deployment completes**
   - The site will be fully available
   - You can then link it locally with `npx netlify link`
   - The CLI will be able to find your site

## Typical Deployment Time

- First deployment: Usually 1-3 minutes
- Subsequent deployments: Usually 30-60 seconds

## What Happens During Deployment

1. **Installing dependencies** (`npm install`)
2. **Building the project** (`npm run build`)
3. **Deploying files** to Netlify's CDN
4. **Setting up functions** (if any)

## After Deployment Completes

Once you see "Published" or "Ready":

1. **Link your local project:**
   ```bash
   npx netlify link
   ```
   - Choose "Search by full or partial project name"
   - Enter your site name

2. **Initialize the database:**
   ```bash
   npx netlify db init
   ```
   - Answer `n` to Drizzle boilerplate

3. **Run database schema:**
   - Get connection string from Netlify dashboard
   - Run `database/schema.sql` against your database

4. **Start local development:**
   ```bash
   npm run dev:netlify
   ```

## Troubleshooting

If deployment fails:
- Check the build logs for errors
- Verify your `netlify.toml` configuration
- Make sure `package.json` has the correct build script
