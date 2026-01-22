# How to Create .env File in Cursor

## Location

Create the `.env` file in the **project root** - the same directory where these files are:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `netlify.toml`
- `src/` folder
- `netlify/` folder

## Step-by-Step Instructions

### Method 1: Using Cursor File Explorer (Easiest)

1. **Open the File Explorer** in Cursor (left sidebar)
2. **Right-click on the project root** (the folder icon at the top, next to "capacity-planning-app")
3. **Select "New File"**
4. **Type the exact filename**: `.env` (including the dot at the beginning)
5. **Press Enter**
6. **Paste this content**:
   ```
   NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
7. **Save** (Cmd+S on Mac)

### Method 2: Using Terminal in Cursor

1. **Open the integrated terminal** in Cursor (Terminal → New Terminal)
2. **Run this command**:
   ```bash
   echo 'NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' > .env
   ```
3. **Verify it was created**:
   ```bash
   cat .env
   ```

### Method 3: Using macOS Finder

1. **Open Finder**
2. **Navigate to**: `/Users/kki/Planning Agent/capacity-planning-app`
3. **Create a new text file**: File → New Text File (or Cmd+N)
4. **Rename it to**: `.env` (make sure to include the dot at the start)
5. **Open it** in Cursor or any text editor
6. **Paste the connection string**:
   ```
   NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
7. **Save**

## Verification

After creating the file, verify it exists:

```bash
# In terminal
ls -la | grep .env

# Or check contents
cat .env
```

You should see:
```
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Important Notes

- ✅ The `.env` file should be in the **root** of your project (same level as `package.json`)
- ✅ The filename starts with a **dot** (`.`)
- ✅ No file extension (not `.env.txt` or `.env.js`)
- ✅ The file is already in `.gitignore`, so it won't be committed to git
- ✅ This file is for **local development only**

## Next Steps

After creating the `.env` file:

1. **Restart Netlify dev**:
   ```bash
   pkill -f "netlify dev"
   npx netlify dev
   ```

2. **Check if it works** - Open http://localhost:8888 and verify there are no proxy errors
