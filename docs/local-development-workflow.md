# Local Development Workflow

## The Situation

Netlify dev exits immediately when it can't fetch addons, preventing the local development server from starting. This is a limitation of Netlify CLI.

## Recommended Workflow

### For React App Development (Local)

Use Vite directly:

```bash
npm run dev
```

This starts Vite on **http://localhost:5173**

**What works:**
- ✅ React app runs locally
- ✅ Hot reloading
- ✅ Fast development experience
- ✅ All React features work

**What doesn't work locally:**
- ❌ Netlify Functions won't run (they need the Netlify environment)

### For Function Testing

Functions work perfectly in **production** (deployed to Netlify):

1. **Deploy to Netlify:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Netlify automatically deploys** (if connected to Git)

3. **Test functions in production:**
   ```bash
   curl https://your-site.netlify.app/.netlify/functions/get-settings
   ```

   Functions will use `NETLIFY_DATABASE_URL` from the Netlify dashboard automatically!

## Why This Works

- **React app**: Uses client-side code, doesn't need Netlify Functions locally
- **Functions**: Use `@netlify/neon` which reads `NETLIFY_DATABASE_URL` from environment
- **Production**: Netlify automatically provides environment variables from the dashboard
- **Database**: Already connected and working (schema is set up)

## Development Process

1. **Make changes to React app:**
   - Run `npm run dev`
   - Develop locally at http://localhost:5173
   - Test UI and React functionality

2. **Test functions:**
   - Deploy to Netlify (or use Netlify's deploy previews)
   - Test functions at production URL
   - Functions automatically use database from dashboard env var

3. **Iterate:**
   - Make changes
   - Test React app locally
   - Deploy and test functions in production

## Alternative: Mock Functions Locally (Advanced)

If you need to test functions locally, you could:

1. Create mock API responses in your React app
2. Use a local function runner (more complex setup)
3. Wait for Netlify CLI to fix the addon issue

But for most development, the workflow above (Vite locally + test functions in production) works great!

## Summary

- ✅ **Local development**: `npm run dev` (React app)
- ✅ **Function testing**: Deploy to Netlify (uses dashboard env vars)
- ✅ **Database**: Already connected and working
- ❌ **Netlify dev**: Currently blocked by addon fetch error

This is a practical, working solution while we wait for Netlify CLI to handle addon errors more gracefully.
