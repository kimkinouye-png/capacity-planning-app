# Linking to an Existing Netlify Site

If you created your site via the Netlify dashboard, the CLI might not find it automatically. Here's how to link to it:

## Option 1: Link by Site Name

Run:
```bash
npx netlify link
```

When prompted "How do you want to link this folder to a project?", choose:
- **"Search by full or partial project name"**

Then type your site name (the one you see in your Netlify dashboard).

## Option 2: Link by Site ID

1. Go to your Netlify dashboard: https://app.netlify.com
2. Click on your site
3. Go to **Site settings** → **General** → **Site details**
4. Copy the **Site ID** (it looks like: `abc123-def456-ghi789`)

Then run:
```bash
npx netlify link
```

Choose:
- **"Enter a project ID"**

Paste the Site ID you copied.

## Option 3: Check Your Account/Team

If you're part of multiple teams, make sure you're logged into the correct account:

```bash
npx netlify login
```

Then try linking again.

## Verify the Link

After linking, you should see a `.netlify` directory created. You can verify by running:

```bash
cat .netlify/state.json
```

This should show your site information.
