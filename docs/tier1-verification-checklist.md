# Tier 1 Design System Update - Verification Checklist

## ✅ Deployment Status

- [x] Files committed to main branch
- [x] Pushed to origin/main
- [ ] Netlify build completed (check Netlify dashboard)
- [ ] Demo site updated (https://capacity-planner.netlify.app)

## 🎨 Visual Verification

Visit https://capacity-planner.netlify.app and verify:

### 1. Global Theme
- [ ] Background is dark (`#0a0a0f` - very dark blue-black)
- [ ] Text is white/light gray
- [ ] Overall dark theme is applied consistently

### 2. Header/Navigation
- [ ] Header background is `#141419` (slightly lighter dark)
- [ ] "Capacity Planner" title is visible
- [ ] Navigation links (Scenarios, Committed Plan, Guide, Settings) are visible
- [ ] Active page button uses cyan gradient (`#00d9ff` accent)
- [ ] Inactive links are gray with hover effects
- [ ] Header has subtle border at bottom

### 3. Buttons
- [ ] Primary buttons use cyan gradient with shadow
- [ ] Buttons have hover effects (slight lift, brighter shadow)
- [ ] Outline buttons have subtle borders
- [ ] Ghost buttons have hover background

### 4. Modals/Dialogs
- [ ] Modal backgrounds are `#141419`
- [ ] Modal borders are subtle white (`rgba(255, 255, 255, 0.1)`)
- [ ] Modal shadows have cyan tint

### 5. General
- [ ] No console errors (open DevTools → Console)
- [ ] No TypeScript/build errors
- [ ] All pages load correctly
- [ ] Navigation works between pages

## 🔍 Detailed Checks

### Home Page
- [ ] Dark background visible
- [ ] Cards/panels use `#141419` background
- [ ] Cyan accent color (`#00d9ff`) appears on icons/links

### Scenarios Page
- [ ] Dark theme applied
- [ ] Scenario cards styled correctly
- [ ] Create scenario button uses new theme

### Any Page
- [ ] Consistent dark theme throughout
- [ ] No white/light backgrounds (except content areas)
- [ ] All interactive elements styled with new theme

## 🐛 Troubleshooting

### If theme doesn't appear:
1. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear cache**: Browser settings → Clear browsing data
3. **Check Netlify build**: Ensure build completed successfully
4. **Check console**: Look for JavaScript errors

### If only partial theme:
- Theme might be cached - try incognito/private window
- Check if Netlify build is still in progress
- Verify files were committed correctly: `git log -1 --stat`

### If errors appear:
- Check browser console for specific errors
- Verify Netlify build logs
- Rollback if needed: `git reset --hard main-backup-YYYYMMDD-HHMMSS`

## ✅ Success Criteria

The update is successful if:
- ✅ Dark theme is visible on all pages
- ✅ Header has new styling with cyan accents
- ✅ Buttons use new theme variants
- ✅ No console errors
- ✅ All existing functionality still works

## 📝 Notes

- **Risk Level**: 🟢 Low - Pure styling changes
- **Rollback Time**: < 1 minute if needed
- **Files Updated**: 3 core files only
- **Impact**: Visual only, no functional changes

## 🚀 Next Steps (Optional)

After verifying Tier 1 works:
1. Consider updating to Tier 2 (adds page-level styling)
2. Monitor demo site for any issues
3. Gather user feedback on new design
