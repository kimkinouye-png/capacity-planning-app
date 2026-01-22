# Setting Up .env from Neon Connection Dialog

## Steps

1. **Click "Show password"** in the connection dialog to reveal the full connection string (password is currently masked)

2. **Click "Copy snippet"** button to copy the entire connection string to your clipboard

3. **Create `.env` file** in your project root with:
   ```bash
   NETLIFY_DATABASE_URL=postgresql://neondb_owner:your-actual-password@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

   Replace `your-actual-password` with the password shown after clicking "Show password"

4. **Note about Connection Pooling**: The connection string shows `-pooler` in the hostname, which is good for serverless functions. This is the recommended connection for Netlify Functions.

5. **Restart Netlify dev**:
   ```bash
   pkill -f "netlify dev"
   npx netlify dev
   ```

## Alternative: Use Non-Pooler Connection

If you prefer a direct connection (without pooling), you can:
- Look for a connection string without `-pooler` in the hostname
- Or remove `-pooler` from the hostname (though this may not work - better to get the direct connection string from Neon)

For Netlify Functions, the pooler connection is recommended for better performance with serverless functions.
