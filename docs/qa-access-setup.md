# QA Access Setup

**Date:** January 21, 2026  
**Feature:** Password-protected QA access for mobile testing

---

## Overview

The Capacity Planning App now includes a password-protected QA access screen that appears before users can access the application. This is designed for mobile testing and QA environments.

---

## Features

- ✅ **Password Protection**: Enter QA code to access the app
- ✅ **Mobile-Friendly**: Responsive design optimized for mobile devices
- ✅ **Session Persistence**: Authentication persists for 24 hours (configurable)
- ✅ **Password Visibility Toggle**: Show/hide password for easy entry on mobile
- ✅ **Auto-focus**: Input field automatically focused for quick entry
- ✅ **Error Handling**: Clear error messages for incorrect codes
- ✅ **Environment Variables**: QA code can be set via environment variable

---

## Configuration

### Default QA Code

The default QA code is set in `src/config/qaConfig.ts`:

```typescript
export const QA_CODE = import.meta.env.VITE_QA_CODE || 'QA2026'
```

**Default Code:** `QA2026`

### Setting QA Code via Environment Variable

You can override the default QA code using the `VITE_QA_CODE` environment variable.

#### Local Development

Create a `.env` file in the project root:

```bash
VITE_QA_CODE=your-qa-code-here
```

#### Netlify Deployment

1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add a new variable:
   - **Key:** `VITE_QA_CODE`
   - **Value:** Your QA code (e.g., `QA2026`)
3. Redeploy the site

#### Different Codes for Different Environments

You can set different QA codes for different Netlify sites:

- **Production Site** (`capacity-planner.netlify.app`): `VITE_QA_CODE=PROD2026`
- **Development Site** (`capacity-planner-2.netlify.app`): `VITE_QA_CODE=DEV2026`

---

## Session Duration

Authentication persists for **24 hours** by default. This can be changed in `src/config/qaConfig.ts`:

```typescript
export const QA_SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
```

To change the duration, modify the milliseconds value:
- **1 hour:** `1 * 60 * 60 * 1000`
- **12 hours:** `12 * 60 * 60 * 1000`
- **7 days:** `7 * 24 * 60 * 60 * 1000`

---

## Usage

### For QA Testers

1. Open the app URL on your mobile device
2. You'll see the QA Access screen
3. Enter the QA code (default: `QA2026`)
4. Tap "Access App"
5. You'll remain authenticated for 24 hours

### For Developers

To disable QA protection in development:

1. Set `VITE_QA_CODE` to an empty string or remove it
2. Or modify `src/config/qaConfig.ts` to bypass authentication in dev mode:

```typescript
// Skip QA auth in development
export const QA_CODE = import.meta.env.DEV ? '' : (import.meta.env.VITE_QA_CODE || 'QA2026')
```

---

## Mobile Optimization

The QA access screen is optimized for mobile devices:

- ✅ **Responsive Layout**: Works on all screen sizes
- ✅ **Large Touch Targets**: Buttons and inputs are easy to tap
- ✅ **Password Visibility Toggle**: Eye icon to show/hide password
- ✅ **Auto-focus**: Input field automatically focused
- ✅ **Large Fonts**: Easy to read on mobile screens
- ✅ **Full-screen Design**: Takes up full viewport for easy access

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Client-Side Only**: This is a basic client-side protection. It's not a secure authentication system.
2. **Not for Production**: This is designed for QA/testing environments, not production security.
3. **Code Visibility**: The QA code is visible in the built JavaScript bundle.
4. **Session Storage**: Authentication is stored in localStorage (can be cleared by user).

**For Production Security:**
- Use proper authentication (OAuth, JWT, etc.)
- Implement server-side authentication
- Use HTTPS only
- Implement proper session management

---

## Files Created

- `src/components/QAAuth.tsx` - QA authentication component
- `src/config/qaConfig.ts` - QA configuration and utilities
- `docs/qa-access-setup.md` - This documentation

## Files Modified

- `src/main.tsx` - Wrapped App with QAAuth component

---

## Testing

### Test on Mobile Device

1. Deploy to Netlify (or use local dev server)
2. Open the URL on your mobile device
3. Verify QA access screen appears
4. Enter the QA code
5. Verify app loads after authentication
6. Close and reopen the app - should remain authenticated
7. Clear browser data - should require authentication again

### Test Session Expiration

1. Authenticate with QA code
2. Modify `QA_SESSION_DURATION` to a short duration (e.g., 1 minute)
3. Wait for expiration
4. Refresh page - should require authentication again

---

## Troubleshooting

### QA Code Not Working

1. Check that `VITE_QA_CODE` environment variable is set correctly
2. Verify the code matches exactly (case-sensitive)
3. Clear browser localStorage and try again
4. Check browser console for errors

### Authentication Not Persisting

1. Check browser localStorage is enabled
2. Verify `QA_SESSION_DURATION` is set correctly
3. Check browser console for errors
4. Try clearing localStorage and re-authenticating

### Want to Disable QA Protection

1. Set `VITE_QA_CODE` to empty string, OR
2. Modify `src/config/qaConfig.ts` to always return `true` for `isQAAuthenticated()`

---

## Example QA Codes

Here are some example QA codes you might use:

- `QA2026` - Default
- `TEST2026` - Testing environment
- `MOBILE2026` - Mobile testing
- `DEMO2026` - Demo environment
- `STAGING2026` - Staging environment

Choose codes that are:
- Easy to type on mobile
- Not too obvious
- Easy to communicate to QA team
- Different for different environments
