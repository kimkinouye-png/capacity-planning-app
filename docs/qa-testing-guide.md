# QA Testing Guide - Database Integration & Settings

## Pre-Testing Setup

1. **Start Local Development Server:**
   ```bash
   npm run dev:netlify
   ```
   - Verify server starts without errors
   - Note the local URL (usually `http://localhost:5173`)

2. **Verify Database Connection:**
   - Check Netlify dashboard: Environment variables should show `NETLIFY_DATABASE_URL`
   - Check Neon dashboard: Tables should exist (`settings`, `scenarios`, `roadmap_items`, `activity_log`)

---

## Test 1: Settings Page - Load Default Settings

**Steps:**
1. Navigate to `/settings` in your browser
2. Wait for the page to load

**Expected Results:**
- ✅ Page loads without errors
- ✅ Settings form displays with default values:
  - UX Factor Weights: Product Risk (1.2), Problem Ambiguity (1.0), Discovery Depth (0.9)
  - Content Factor Weights: Content Surface Area (1.3), Localization Scope (1.0), Regulatory & Brand Risk (1.2), Legal Compliance Dependency (1.1)
  - PM Intake Multiplier: 1.0
  - Focus-time Ratio: 0.75
  - Size-band Thresholds: XS (1.6), S (2.6), M (3.6), L (4.6), XL (5.0)
- ✅ No loading spinner stuck on screen
- ✅ No error messages displayed

**Check Browser Console:**
- No JavaScript errors
- Network tab shows successful GET request to `/.netlify/functions/get-settings`

---

## Test 2: Settings Page - Update and Save Settings

**Steps:**
1. On the Settings page, change one value:
   - Change "Product Risk" weight from 1.2 to 1.5
2. Click "Save Settings" button
3. Wait for save confirmation

**Expected Results:**
- ✅ Success toast notification appears: "Settings saved."
- ✅ Form values update to reflect the change
- ✅ No error messages

**Verify in Database:**
1. Go to Neon dashboard → Tables → `settings`
2. Click on the settings row
3. Check `effort_model` JSONB field
4. Verify `ux.productRisk` is now 1.5

**Check Browser Console:**
- Network tab shows successful PUT request to `/.netlify/functions/update-settings`
- Response contains updated settings

---

## Test 3: Settings Page - Reset to Defaults

**Steps:**
1. On Settings page, change multiple values
2. Click "Reset to Defaults" button
3. Confirm the reset

**Expected Results:**
- ✅ Info toast notification: "Settings reset to defaults."
- ✅ All form values revert to default values
- ✅ Settings saved to database with defaults

**Verify in Database:**
- Check Neon dashboard → `settings` table
- Verify all values match the original defaults

---

## Test 4: Effort Calculation Uses Settings

**Steps:**
1. Navigate to a scenario (or create a new one)
2. Add a roadmap item
3. Go to the item detail page
4. Open "Product Design" tab
5. Set factor scores (e.g., all to 3)
6. Note the calculated effort (focus weeks, work weeks, size band)

**Expected Results:**
- ✅ Effort calculations use settings from database
- ✅ If you changed "Product Risk" weight to 1.5, calculations should reflect this
- ✅ Size bands use thresholds from settings
- ✅ Work weeks calculation uses focus-time ratio from settings

**Test with Different Settings:**
1. Go back to Settings page
2. Change "Focus-time Ratio" from 0.75 to 0.60
3. Save settings
4. Go back to item detail page
5. Verify work weeks calculation changed (should be higher since ratio is lower)

---

## Test 5: Settings Persistence Across Sessions

**Steps:**
1. Update a setting value
2. Save settings
3. Refresh the page (F5 or Cmd+R)
4. Navigate away and come back to Settings page

**Expected Results:**
- ✅ Settings persist after page refresh
- ✅ Settings persist when navigating away and back
- ✅ Settings match what was saved in database

---

## Test 6: Error Handling - Network Failure

**Steps:**
1. Stop the Netlify dev server (`Ctrl+C`)
2. Try to load Settings page
3. Try to save settings

**Expected Results:**
- ✅ Error message displayed: "Failed to load settings. Using defaults."
- ✅ Page still renders with default values
- ✅ User can still interact with the page (graceful degradation)

---

## Test 7: Settings Context - Multiple Components

**Steps:**
1. Update settings (e.g., change a factor weight)
2. Save settings
3. Navigate to different pages that use settings:
   - Settings page
   - Item detail page (Product Design tab)
   - Item detail page (Content Design tab)

**Expected Results:**
- ✅ All components use the updated settings
- ✅ Effort calculations reflect the new settings across all pages
- ✅ Settings are consistent across the app

---

## Test 8: Database Schema Verification

**Steps:**
1. Go to Neon dashboard → Tables
2. Verify all tables exist:
   - `settings` (should have 1 row)
   - `scenarios` (may be empty)
   - `roadmap_items` (may be empty)
   - `activity_log` (may be empty)

**Expected Results:**
- ✅ All 4 tables exist
- ✅ `settings` table has 1 row with default data
- ✅ Table structures match schema.sql

---

## Test 9: Netlify Functions - Direct API Testing

**Steps:**
1. With dev server running, test functions directly:
   ```bash
   # Test get-settings
   curl http://localhost:8888/.netlify/functions/get-settings
   
   # Test update-settings (replace with actual JSON)
   curl -X PUT http://localhost:8888/.netlify/functions/update-settings \
     -H "Content-Type: application/json" \
     -d '{"effortModel":{"uxFactorWeights":{"productRisk":1.5},"contentFactorWeights":{},"pmIntakeMultiplier":1.0},"timeModel":{"focusTimeRatio":0.75},"sizeBands":{"xs":1.6,"s":2.6,"m":3.6,"l":4.6,"xl":5.0}}'
   ```

**Expected Results:**
- ✅ GET request returns settings JSON
- ✅ PUT request updates settings and returns updated JSON
- ✅ No CORS errors
- ✅ Proper error handling for invalid requests

---

## Test 10: Production Deployment

**Steps:**
1. Push changes to GitHub (if using CI/CD)
2. Wait for Netlify deployment to complete
3. Visit production site
4. Test Settings page on production

**Expected Results:**
- ✅ Settings page loads in production
- ✅ Settings save successfully
- ✅ Database connection works in production
- ✅ Environment variables are set correctly

---

## Test 11: Concurrent Users (Optional)

**Steps:**
1. Open Settings page in two browser windows
2. Update settings in window 1
3. Save settings
4. Refresh window 2
5. Verify window 2 shows updated settings

**Expected Results:**
- ✅ Settings updates are reflected across all sessions
- ✅ Last write wins (expected behavior)

---

## Test 12: Invalid Data Handling

**Steps:**
1. On Settings page, try to enter invalid values:
   - Negative numbers
   - Numbers outside valid range (e.g., focus-time ratio > 1.0)
   - Non-numeric values
2. Try to save

**Expected Results:**
- ✅ Form validation prevents invalid input
- ✅ Error messages displayed for invalid values
- ✅ Settings not saved if validation fails

---

## Checklist Summary

- [ ] Settings page loads default values from database
- [ ] Settings can be updated and saved
- [ ] Settings persist across page refreshes
- [ ] Reset to defaults works correctly
- [ ] Effort calculations use settings from database
- [ ] Settings changes affect calculations immediately
- [ ] Error handling works (network failures, invalid data)
- [ ] Database schema is correct (all tables exist)
- [ ] Netlify Functions work correctly
- [ ] Production deployment works
- [ ] No console errors
- [ ] No network errors

---

## Common Issues to Watch For

1. **Settings not loading:**
   - Check `NETLIFY_DATABASE_URL` is set
   - Check database connection in Neon dashboard
   - Check browser console for errors

2. **Settings not saving:**
   - Check Netlify Functions logs
   - Verify database permissions
   - Check network tab for failed requests

3. **Calculations not updating:**
   - Verify SettingsContext is being used
   - Check that components re-render after settings update
   - Verify settings are passed to calculation functions

4. **CORS errors:**
   - Check Netlify Functions CORS headers
   - Verify local dev server is running

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Settings persist correctly
✅ Calculations use database settings
✅ Error handling works gracefully
✅ Production deployment successful
