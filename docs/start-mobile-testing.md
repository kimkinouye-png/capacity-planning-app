# Starting Mobile Testing with ngrok

## Step 1: Start Your Dev Server

In your first terminal, make sure your dev server is running:

```bash
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Note the port number** (usually `5173` or `5174`)

## Step 2: Start ngrok

Open a **new terminal window** (keep the dev server running), and run:

```bash
ngrok http 5173
```

(Replace `5173` with your actual Vite port if different)

## Step 3: Get Your ngrok URL

ngrok will display something like:

```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the `Forwarding` URL** (the `https://abc123.ngrok.io` part)

## Step 4: Generate QR Code

1. Go to: https://qr-code-generator.com/
2. Paste your ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Click "Generate" or "Download"
4. Share the QR code with your testers!

## Step 5: Keep Both Terminals Running

- ✅ Keep `npm run dev` running (first terminal)
- ✅ Keep `ngrok http 5173` running (second terminal)
- ✅ Testers can now scan the QR code and access your app!

## Testing Tips

- The ngrok URL will work as long as both terminals are running
- If you restart ngrok, you'll get a new URL (free tier limitation)
- Testers can access the app from anywhere with internet
- Changes you make will be visible immediately (hot reload works)

## Troubleshooting

**If testers can't connect:**
- Make sure both terminals are still running
- Check that ngrok shows "online" status
- Verify the dev server is running on the correct port
- Try refreshing the ngrok web interface at `http://127.0.0.1:4040`
