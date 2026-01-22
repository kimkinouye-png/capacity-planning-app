# Fix: Environment Variable Not Loading in Netlify Dev

## Problem

Even though `NETLIFY_DATABASE_URL` is set in the Netlify dashboard, `npx netlify dev` still shows:
```
Error: Failed retrieving addons for site e0e58877-9c44-433d-bbb2-c269cf0bf156: Not Found.
```

## Solution: Re-authenticate Netlify CLI

The Netlify CLI might need to be re-authenticated to pick up the environment variable from the dashboard.

### Step 1: Log Out

```bash
npx netlify logout
```

### Step 2: Log Back In

```bash
npx netlify login
```

This will open a browser window for you to authenticate.

### Step 3: Verify You're Logged In

```bash
npx netlify status
```

Should show your site information.

### Step 4: Try Netlify Dev Again

```bash
npx netlify dev
```

The environment variable should now be fetched from the dashboard, and the addon error should be gone!

## Alternative: Clear Netlify Cache

If re-authenticating doesn't work, try clearing the Netlify cache:

```bash
# Remove Netlify CLI cache
rm -rf ~/.netlify

# Then log back in
npx netlify login

# Try again
npx netlify dev
```

## Why This Happens

The Netlify CLI caches authentication and site configuration. When you add a new environment variable in the dashboard, the CLI might still be using cached configuration that doesn't include it. Re-authenticating forces the CLI to fetch fresh configuration from the Netlify API.

## Verification

After re-authenticating and running `npx netlify dev`, you should see:

1. ✅ No "Failed retrieving addons" error
2. ✅ "Injecting environment variable values for all scopes" with no errors
3. ✅ Server starting successfully
4. ✅ Can access functions at `http://localhost:8888/.netlify/functions/get-settings`
