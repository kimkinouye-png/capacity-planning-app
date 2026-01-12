# Setting Up ngrok Authentication

ngrok requires a free account to use. Here's how to set it up:

## Step 1: Sign Up for ngrok (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with your email (free account is sufficient)
3. Verify your email if required

## Step 2: Get Your Authtoken

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (it looks like: `2abc123def456ghi789jkl012mno345pq_6RSTUVWXYZ7abcdefghijkl`)

## Step 3: Configure ngrok

In your terminal, run:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

Replace `YOUR_AUTHTOKEN_HERE` with the token you copied.

## Step 4: Test ngrok

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. In another terminal, start ngrok:
   ```bash
   ngrok http 5173
   ```
   (Replace `5173` with your actual Vite port)

3. You should see output like:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:5173
   ```

4. Copy the `https://` URL and use it to generate your QR code!

## Free ngrok Limitations

- ✅ Free tier is perfect for testing
- ⚠️ URL changes each time you restart ngrok (unless you have a paid plan)
- ⚠️ Limited connections per minute (usually fine for testing)

## Alternative: Use Netlify Instead

If you don't want to set up ngrok, deploying to Netlify is actually easier:

1. Push to GitHub:
   ```bash
   git push origin main
   ```

2. Netlify auto-deploys (if connected to your repo)
3. Get your Netlify URL (e.g., `https://your-site.netlify.app`)
4. Generate QR code with that URL
5. ✅ Stable URL that doesn't change
6. ✅ No need to keep terminals running
