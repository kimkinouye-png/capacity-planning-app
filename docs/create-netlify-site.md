# Creating a Netlify Site

You need to create a Netlify site before you can link your local project. Here are two options:

## Option 1: Create via Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** as your Git provider
4. Find and select your `capacity-planning-app` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**

After the site is created, you can link it locally:
```bash
npx netlify link
```
Then select "Search by full or partial project name" and type your site name.

## Option 2: Create via CLI

Run this command:
```bash
npx netlify sites:create
```

Follow the prompts to:
- Enter a site name (or leave blank for auto-generated name)
- Choose a team (if you're part of multiple teams)

After creation, link it:
```bash
npx netlify link
```

## After Creating the Site

Once you have a Netlify site:

1. **Link your local project:**
   ```bash
   npx netlify link
   ```
   - Select "Search by full or partial project name"
   - Type your site name

2. **Initialize the database:**
   ```bash
   npx netlify db init
   ```
   - Answer `n` to Drizzle boilerplate

3. **Run database schema:**
   - Get connection string from Netlify dashboard
   - Run `database/schema.sql` against your database

4. **Start development:**
   ```bash
   npm run dev:netlify
   ```
