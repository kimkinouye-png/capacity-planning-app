# Troubleshooting: Design Not Updating

If the new design (header, empty state) isn't showing, try these steps:

## 1. Hard Refresh Browser Cache

**Chrome/Edge:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- Mac: `Cmd + Option + R`

**Firefox:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## 2. Restart Dev Server

Stop your dev server (`Ctrl + C`) and restart:

```bash
npm run dev
```

## 3. Clear Browser Cache Completely

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or manually:
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Safari: Develop → Empty Caches

## 4. Check if You're Viewing Empty State

The new design only shows when **no scenarios exist**. If you have scenarios in localStorage:

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find "Local Storage" → your domain
4. Delete the key: `designCapacity.sessions`
5. Refresh the page

You should now see the empty state with:
- Calendar icon
- "Welcome to Capacity Planning!" heading
- Black "+ Create New Scenario" button

## 5. Verify You're on Local Dev Server

Make sure you're accessing:
- `http://localhost:5173` (or your ngrok URL pointing to localhost)
- NOT a deployed Netlify URL (unless you've pushed the latest changes)

## 6. Check Console for Errors

Open browser DevTools → Console tab and look for:
- Red error messages
- Failed imports
- Theme loading issues

## 7. Verify Files Are Updated

Check that these files have the new code:
- `src/App.tsx` - Should have header with "Capacity Planning" title
- `src/pages/SessionsListPage.tsx` - Should have empty state with calendar icon
- `src/theme.ts` - Should exist with black color scheme
- `src/main.tsx` - Should import and use the theme

## Quick Test

1. Clear localStorage (see step 4)
2. Hard refresh (see step 1)
3. You should see the empty state design

If it still doesn't work, check the browser console for errors!
