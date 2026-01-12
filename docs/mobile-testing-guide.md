# Mobile Testing Guide - QR Code Setup

## Option 1: Deploy to Netlify (Recommended - Best for External Testing)

### Steps:
1. **Push to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Deploy to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - If site not connected: Add new site → Import from Git → Select your repo
   - Netlify will auto-deploy on push to `main`
   - Wait for build to complete (~2-3 minutes)

3. **Get your Netlify URL**:
   - Your site will be at: `https://your-site-name.netlify.app`
   - Or check Netlify dashboard for the URL

4. **Generate QR Code**:
   - Use any QR code generator (e.g., https://qr-code-generator.com/)
   - Enter your Netlify URL
   - Download/print the QR code
   - Share with testers

**Pros**: 
- ✅ Publicly accessible (anyone can test)
- ✅ Stable URL
- ✅ No local dev server needed
- ✅ Works on any network

**Cons**: 
- ⚠️ Requires GitHub push and Netlify deployment
- ⚠️ Changes require new deployment

---

## Option 2: Use ngrok (Quick Local Testing)

### Steps:
1. **Install ngrok**:
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your dev server**:
   ```bash
   npm run dev
   ```
   Note the port (usually `http://localhost:5173`)

3. **Expose localhost with ngrok**:
   ```bash
   ngrok http 5173
   ```
   (Replace 5173 with your actual port)

4. **Get the ngrok URL**:
   - ngrok will show a URL like: `https://abc123.ngrok.io`
   - Copy this URL

5. **Generate QR Code**:
   - Use QR code generator with the ngrok URL
   - Share with testers

**Pros**: 
- ✅ Very quick setup
- ✅ Works with local dev server
- ✅ See changes instantly (no deployment)

**Cons**: 
- ⚠️ Requires ngrok account (free tier available)
- ⚠️ URL changes each time (unless paid plan)
- ⚠️ Local dev server must stay running
- ⚠️ Only works while ngrok is active

---

## Option 3: Local Network IP (Same WiFi Only)

### Steps:
1. **Find your local IP address**:
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or check System Preferences → Network
   ```
   You'll get something like: `192.168.1.100`

2. **Start Vite with host flag**:
   ```bash
   npm run dev -- --host
   ```
   Or update `vite.config.ts`:
   ```ts
   export default {
     server: {
       host: '0.0.0.0'
     }
   }
   ```

3. **Access from mobile**:
   - Connect mobile device to same WiFi network
   - Open browser on mobile: `http://192.168.1.100:5173`
   - (Replace with your actual IP and port)

4. **Generate QR Code**:
   - Use QR code generator with: `http://YOUR_IP:5173`

**Pros**: 
- ✅ No external services needed
- ✅ Free
- ✅ Fast local testing

**Cons**: 
- ⚠️ Only works on same WiFi network
- ⚠️ IP address may change
- ⚠️ Dev server must stay running
- ⚠️ Not accessible outside your network

---

## QR Code Generators

- **Online**: https://qr-code-generator.com/
- **Online**: https://www.qr-code-generator.com/
- **CLI tool**: `npm install -g qrcode-terminal` then `qrcode "https://your-url.com"`

---

## Recommended Approach

**For external testing**: Use **Option 1 (Netlify)** - most reliable and professional

**For quick internal testing**: Use **Option 2 (ngrok)** - fastest setup

**For same-office testing**: Use **Option 3 (Local IP)** - simplest

---

## Testing Checklist

Once testers can access the app:

- [ ] Empty state displays correctly on mobile
- [ ] Create scenario form works on mobile
- [ ] Navigation works (header links)
- [ ] Tables are readable/scrollable
- [ ] Forms are usable on mobile
- [ ] Touch interactions work (buttons, checkboxes)
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling issues
