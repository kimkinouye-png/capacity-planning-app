# QA Quick Checklist - Database Integration

## Quick Test Steps

### 1. Start Server
```bash
npm run dev:netlify
```
✅ Server starts without errors

---

### 2. Test Settings Page Load
- Navigate to `/settings`
- ✅ Page loads
- ✅ Default values displayed:
  - Product Risk: 1.2
  - Focus-time Ratio: 0.75
  - Size bands: XS (1.6), S (2.6), M (3.6), L (4.6), XL (5.0)
- ✅ No errors in console

---

### 3. Test Save Settings
- Change "Product Risk" from 1.2 to 1.5
- Click "Save Settings"
- ✅ Success toast appears
- ✅ Value updates in form

**Verify in Neon:**
- Go to Neon dashboard → Tables → `settings`
- ✅ `effort_model.ux.productRisk` = 1.5

---

### 4. Test Reset to Defaults
- Click "Reset to Defaults"
- ✅ All values revert to defaults
- ✅ Info toast appears

---

### 5. Test Effort Calculation Uses Settings
- Go to a roadmap item → Product Design tab
- Set all factors to 3
- ✅ Calculations use settings from database
- ✅ If you changed Product Risk to 1.5, calculations reflect this

---

### 6. Test Persistence
- Update a setting
- Save
- Refresh page (F5)
- ✅ Settings persist after refresh

---

### 7. Test Error Handling
- Stop dev server (Ctrl+C)
- Try to load Settings page
- ✅ Error message shown
- ✅ Page still works with defaults

---

### 8. Verify Database Tables
- Go to Neon dashboard → Tables
- ✅ All 4 tables exist: `settings`, `scenarios`, `roadmap_items`, `activity_log`
- ✅ `settings` table has 1 row

---

## All Tests Pass? ✅

If all checkboxes are checked, the database integration is working correctly!
