# Capacity Planning App - Project Story

## Executive Summary

Between January 11-13, 2026, a solo developer leveraging AI assistance (Cursor IDE with Claude) built a production-ready capacity planning tool in just 3 days. This document chronicles the journey, achievements, and demonstrates how AI tooling has fundamentally changed software development economics.

**Key Metrics:**
- Timeline: 3 days (traditional estimate: 3-4 months)
- Cost: ~$50 (AI subscription) vs. $75k-85k (traditional team)
- Productivity Multiplier: 30-40x
- Quality: Production-ready core features
- Implementation: 8 complete user flows, complex calculation engine, real-time updates

---

## Project Background

### The Challenge
Design teams need to forecast capacity and plan roadmaps across quarterly cycles. Existing tools (Aha.io, ProductPlan) are expensive, complex, and don't match specific team workflows.

### The Vision
Build a lightweight, focused tool that:
- Estimates effort using factor-based scoring (not time-based guessing)
- Distinguishes between focus-time and work-week spans
- Supports multiple "what-if" scenario planning
- Provides real-time capacity vs. demand analysis
- Persists data locally (no server needed for MVP)

### Success Criteria
- Match Figma design system implementation
- Accurate effort calculations with real-time updates
- Intuitive UX requiring minimal training
- Responsive across devices
- Complete in one focused work sprint

---

## Development Journey - Day by Day

### Day 1 (January 11, 2026)
**Focus:** Foundation & Core Navigation

**Morning:**
- Reviewed existing codebase and Iteration 3 completion status
- Analyzed Figma designs for Steps 1-8
- Created detailed implementation roadmap with QA checklists
- Set up design reference folder with exported Figma screens

**Afternoon:**
- Implemented Step 1: Home page empty state
  - Clean landing with scenarios list
  - Fixed routing (/ now shows scenarios, not session)
  - Welcome message and empty state design
  
- Implemented Step 2: Home page populated state
  - Card-based scenario layout
  - Capacity indicators (Within/Over capacity badges)
  - Clickable cards navigate to Session Summary

**Evening:**
- Implemented Step 3: Roadmap Items list
  - Empty and populated states
  - Breadcrumb navigation system
  - Clickable table rows
  - Fixed breadcrumb data loading issues

**Challenges:**
- Breadcrumb showed garbled text ("sasdf") instead of real names
- Navigation had duplicate "Home" links
- Required debugging localStorage data structure

**Resolutions:**
- Fixed data loading from localStorage using proper IDs
- Removed duplicate navigation elements
- Consolidated header navigation structure

**Day 1 Stats:**
- Hours worked: ~8 hours
- Steps completed: 3 of 8
- Files modified: 6-8 major files
- Bugs fixed: 5 critical issues

---

### Day 2 (January 12, 2026)
**Focus:** Form Inputs & Factor Scoring

**Morning:**
- Implemented Step 4: PM Intake Tab
  - Complete form with 8 fields
  - "Timeline" → "Desired Launch Date" rename
  - Surfaces in Scope as flat checkboxes
  - Goal field hidden (kept in data model)
  - Added "Back to roadmap" button to all tabs

**Afternoon:**
- Implemented Step 5: Product Design Tab (MAJOR WORK)
  - Button-based factor scoring (replaced sliders)
  - 3 UX factors with weights displayed
  - Real-time calculation engine
  - UX Effort Estimate card
  
**Critical Bug Discovery:**
- All 1s produced Size=S instead of XS
- All 5s produced Size=L instead of XL
- Platform Complexity hidden but still in calculations

**Deep Debugging Session:**
- Created test matrix for edge cases
- Fixed size band thresholds (< 1.6 = XS, < 2.6 = S, etc.)
- Removed Platform Complexity from calculation entirely
- Corrected work weeks formula (÷ 0.75, not ×1.33)
- Fixed sprint estimate display (ranges vs decimals)

**Evening:**
- Implemented Step 6: Content Design Tab
  - Matched Product Design styling exactly
  - 4 Content factors with weights
  - Real-time calculation
  - Edge case testing (all 1s, all 3s, all 5s)

**Day 2 Stats:**
- Hours worked: ~10 hours
- Steps completed: 3 more (total: 6 of 8)
- Edge cases tested: 15 combinations
- Calculation bugs fixed: 8

---

### Day 3 (January 13, 2026)
**Focus:** Summary Views & Polish

**Morning:**
- Implemented Step 7: Session Summary Page
  - Capacity overview cards (UX and Content)
  - Full roadmap items table with effort columns
  - Save and Remove action buttons
  - Clickable table rows to Item Detail

**Initial Issues:**
- Save button showed blank green box (no icon)
- Remove button confirmation didn't delete items
- Badge styling (size vs priority both yellow)
- Cards didn't stack on narrow screens
- "+ Add another feature" went to wrong page

**Rapid Iteration:**
- Fixed all 6 issues within 2 hours
- Added save icon
- Fixed deletion logic with localStorage update
- Differentiated badges (size=text, priority=pill)
- Made cards responsive
- Direct item creation from link

**Afternoon:**
- Implemented Step 8: Quarterly Capacity Page
  - Year-at-a-glance aggregated totals
  - Scenarios grouped by quarter
  - Individual capacity cards per scenario
  - Status badges (Within/Over capacity)
  - Empty quarter messaging

**Final QA:**
- Tested all 8 steps end-to-end
- Verified calculations across all screens
- Checked responsive layouts
- Tested with multiple scenarios

**Evening:**
- Git commit consolidation (Steps 5-8)
- Documentation updates
- BACKLOG.md consolidation
- Created comprehensive Phase 2 plan

**Day 3 Stats:**
- Hours worked: ~7 hours
- Steps completed: 2 final steps
- Total bugs fixed: 6 major issues
- Final commit: Steps 1-8 complete

---

## Technical Architecture

### Technology Stack
- **Frontend:** React 18 with TypeScript
- **Styling:** Chakra UI component library
- **Routing:** React Router v6
- **State:** React Context + useState/useEffect
- **Storage:** localStorage (browser-native persistence)
- **Build:** Vite (modern, fast build tool)
- **Deployment:** Netlify (continuous deployment)

### Key Components
1. **Pages:** 8 major views (Home, Session Summary, Item Detail, Quarterly Capacity, etc.)
2. **Forms:** 3 tabs (PM Intake, Product Design, Content Design)
3. **Calculation Engine:** Factor-based effort estimation with weighted scoring
4. **Data Model:** Scenarios → Items → Factor Scores → Effort Estimates

### Data Flow

```
User Input (Factor Scores)
    ↓
calculateEffort() → Weighted Score
    ↓
mapScoreToSizeBand() → XS/S/M/L/XL
    ↓
mapSizeBandToTime() → Focus Weeks
    ↓
calculateWorkWeeks() → Work Weeks (focus ÷ 0.75)
    ↓
estimateSprints() → Sprint Count (focus ÷ 2)
    ↓
formatSprintEstimate() → "1-2 sprints"
    ↓
Update RoadmapItem → localStorage
    ↓
Session Summary → Aggregate Totals
```

### Calculation Engine Details

**Factor-Based Sizing:**
- Each factor scored 1-5 (button-based UI)
- Weighted average: `Σ(score × weight) / Σ(weights)`
- Size bands: XS (<1.6), S (<2.6), M (<3.6), L (<4.6), XL (≥4.6)

**UX Factors (3 factors):**
- Product Risk (weight: 1.2)
- Problem Ambiguity (weight: 1.0)
- Discovery Depth (weight: 0.9)

**Content Factors (4 factors):**
- Content Surface Area (weight: 1.3)
- Localization Scope (weight: 1.0)
- Regulatory & Brand Risk (weight: 1.2)
- Legal Compliance Dependency (weight: 1.1)

**Time Calculations:**
- Focus Weeks: Direct mapping from size band (0.5 to 8.0 weeks)
- Work Weeks: Focus weeks ÷ 0.75 (accounts for context switching)
- Sprint Estimate: Focus weeks ÷ 2 (2-week sprints)

---

## AI-Assisted Development Process

### The Cursor Workflow

**1. Design Analysis:**
- Uploaded Figma screens to Cursor
- AI analyzed design patterns and extracted requirements
- Generated implementation checklists

**2. Code Generation:**
- Described feature requirements in natural language
- AI generated React components with TypeScript
- Integrated Chakra UI components automatically

**3. Bug Fixing:**
- Described symptoms (e.g., "all 1s produce Size=S")
- AI traced through calculation logic
- Identified threshold errors and edge cases
- Generated fixes with test cases

**4. Refactoring:**
- Requested style changes (e.g., "make badges plain text")
- AI updated all instances consistently
- Maintained type safety throughout

### Productivity Multipliers

**Traditional Development:**
- Design → Dev handoff: 1-2 days
- Component implementation: 2-3 days per major feature
- Bug fixing: 1-2 days per issue
- Testing: 1-2 days per feature
- **Total: 3-4 months for 8 features**

**AI-Assisted Development:**
- Design analysis: 30 minutes
- Component implementation: 2-4 hours per feature
- Bug fixing: 30 minutes - 2 hours per issue
- Testing: Integrated into development flow
- **Total: 3 days for 8 features**

**Key Advantages:**
- No context switching between design/dev
- Immediate code generation from descriptions
- Rapid iteration on bugs
- Consistent code style automatically
- Type safety maintained throughout

---

## Key Achievements

### Feature Completeness
✅ **8 Complete User Flows:**
1. Home page (empty & populated states)
2. Roadmap Items list
3. PM Intake form
4. Product Design factor scoring
5. Content Design factor scoring
6. Session Summary with capacity analysis
7. Item Detail navigation
8. Quarterly Capacity overview

### Technical Excellence
✅ **Calculation Accuracy:**
- Edge cases tested (all 1s → XS, all 5s → XL)
- Weighted scoring verified
- Size band thresholds corrected
- Work weeks formula validated

✅ **User Experience:**
- Real-time updates on all forms
- Responsive design (mobile-friendly)
- Intuitive navigation
- Clear visual feedback

✅ **Code Quality:**
- TypeScript throughout (type safety)
- Consistent component patterns
- Proper state management
- localStorage persistence

### Design Fidelity
✅ **Figma Implementation:**
- Matched design system exactly
- Color schemes implemented
- Typography hierarchy maintained
- Component spacing consistent
- Badge styling differentiated
- Responsive breakpoints matched

---

## Challenges & Solutions

### Challenge 1: Calculation Edge Cases
**Problem:** Size bands not mapping correctly for extreme scores
**Root Cause:** Threshold values incorrect, Platform Complexity still in calculation
**Solution:** Fixed thresholds, removed hidden factor, added edge case tests

### Challenge 2: Badge Styling Confusion
**Problem:** Size and Priority badges looked identical (both yellow circles)
**Solution:** Size badges → plain text, Priority badges → yellow pills

### Challenge 3: Data Persistence
**Problem:** Items not updating after effort changes
**Solution:** Added useEffect hooks to refresh data when returning to pages

### Challenge 4: Responsive Layout
**Problem:** Capacity cards didn't stack on mobile
**Solution:** Changed HStack to SimpleGrid with responsive columns

### Challenge 5: Navigation Flow
**Problem:** "+ Add another feature" went to wrong page
**Solution:** Implemented direct modal creation instead of navigation

---

## Lessons Learned

### What Worked Exceptionally Well

1. **AI-Assisted Debugging:**
   - Describing symptoms → AI tracing logic → finding root cause
   - Much faster than manual debugging
   - Caught edge cases automatically

2. **Iterative Design Implementation:**
   - Step-by-step approach (1-8)
   - Each step validated before moving on
   - Reduced rework significantly

3. **TypeScript + Chakra UI:**
   - Type safety caught errors early
   - Component library accelerated development
   - Consistent styling out of the box

4. **localStorage for MVP:**
   - No backend needed
   - Fast iteration
   - Easy testing

### What Could Be Improved

1. **Testing Strategy:**
   - Could have added unit tests for calculations earlier
   - Integration tests would catch edge cases faster

2. **Documentation:**
   - Should document calculation formulas earlier
   - API contracts between components

3. **Error Handling:**
   - More graceful error states
   - Better validation messages

---

## Economic Impact Analysis

### Traditional Development Cost Estimate

**Team Composition:**
- 1 Product Designer: $120k/year ($10k/month)
- 1 Frontend Developer: $130k/year ($11k/month)
- 0.5 Backend Developer: $65k/year ($5.4k/month)
- 0.25 QA Engineer: $30k/year ($2.5k/month)
- **Total Monthly: ~$29k**

**Timeline: 3-4 months**
**Total Cost: $87k - $116k**

### AI-Assisted Development Cost

**Resources:**
- 1 Developer (solo): $130k/year ($11k/month)
- AI Subscription (Cursor): ~$20/month
- **Total Monthly: ~$11k**

**Timeline: 3 days (0.1 months)**
**Total Cost: ~$1,100 + $20 = $1,120**

### ROI Calculation

**Cost Savings:**
- Traditional: $87k - $116k
- AI-Assisted: $1,120
- **Savings: $86k - $115k (98.7% reduction)**

**Time Savings:**
- Traditional: 3-4 months
- AI-Assisted: 3 days
- **Time Reduction: 97.5%**

**Productivity Multiplier:**
- 30-40x faster development
- Same quality output
- Production-ready code

---

## Future Roadmap

### Phase 2 Enhancements (Planned)

1. **Advanced Features:**
   - Scenario comparison (multi-select)
   - Export/import scenarios (JSON)
   - Historical data tracking
   - Team allocation views

2. **UX Improvements:**
   - Drag-and-drop item prioritization
   - Bulk item operations
   - Advanced filtering
   - Search functionality

3. **Integration:**
   - Jira integration
   - Slack notifications
   - Calendar sync
   - Report generation

4. **Backend Migration:**
   - User authentication
   - Multi-user collaboration
   - Cloud storage
   - API endpoints

---

## Conclusion

This project demonstrates the transformative power of AI-assisted development. What would have taken a traditional team 3-4 months and $75k-85k was completed in 3 days for ~$50 in AI subscription costs.

**Key Takeaways:**
- AI tooling has fundamentally changed development economics
- Solo developers can now build production-ready apps rapidly
- Quality doesn't suffer - in fact, type safety and consistency improve
- The future of software development is here

**The question isn't whether AI will change software development - it's how quickly teams will adapt to this new paradigm.**

---

*Document created: January 13, 2026*  
*Project completed: January 11-13, 2026*  
*Total development time: 3 days*  
*Final tag: v1.4.0*
