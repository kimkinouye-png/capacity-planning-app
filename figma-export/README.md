# Figma Make Export - Capacity Planning App

This folder contains HTML exports of key components from the Capacity Planning app that can be imported into Figma Make for design system updates.

## Files Included

### 1. `header.html`
The global header/navigation component with:
- App title "Capacity Planning" (links to home)
- Subtitle text
- Navigation links: Home, Scenarios, Committed Plan, Guide
- Active state styling
- Hover states

**Use in Figma Make:** Import to create the header component with proper spacing, typography, and navigation states.

### 2. `homepage-first-time.html`
The first-time user onboarding experience with:
- Hero section with icon, title, and subtitle
- Three feature cards (Plan Your Roadmaps, Review Capacity vs Demand, Review Your Committed Plan)
- Key Features section (2x2 grid)
- CTA section with button

**Use in Figma Make:** Import to design the onboarding flow and ensure consistent messaging and layout.

### 3. `scenario-card.html`
Scenario card component showing:
- Draft scenario card
- Committed scenario card (with light green background)
- Over capacity scenario card
- Capacity indicator (green/orange dot + text)
- Commit control (radio button style)
- Scenario details (quarter, team size, item count)

**Use in Figma Make:** Import to create the scenario card component with all states and interactions.

### 4. `capacity-card.html`
Capacity overview cards showing:
- UX Design Capacity card
- Content Design Capacity card
- Metrics: Team Size, Total Capacity, Total Demand
- Surplus/Deficit section with colored indicators
- Utilization percentage

**Use in Figma Make:** Import to design the capacity cards with proper metric hierarchy and visual indicators.

### 5. `roadmap-table.html`
Roadmap items table showing:
- Table headers with neutral gray background
- Column structure (Key, Name, Priority, Status, UX columns, Content columns, Actions)
- Sample data rows
- Badge styles (Priority: yellow pill, Status: gray pill)
- Size text (plain text, no badge)
- Action buttons (Save: green, Delete: red)

**Use in Figma Make:** Import to create the table component with proper column styling and data presentation.

### 6. `design-system.html`
Complete design system reference with:
- Color palette (Primary Blue, Success Green, Warning Amber, Error Red, Grays)
- Typography scale (Heading XL/LG/MD/SM, Body LG/MD/SM/XS)
- Button styles (Primary, Secondary, Black)
- Badge styles (Priority, Status, Committed)
- Spacing scale

**Use in Figma Make:** Import as a reference document for all design tokens, colors, typography, and spacing values.

## How to Use in Figma Make

1. **Open Figma Make** and create a new project or open your existing design file
2. **Import HTML:**
   - Use Figma Make's HTML import feature
   - Select the HTML file you want to import
   - Figma Make will convert the HTML/CSS into Figma components
3. **Adjust as needed:**
   - Update colors to match your design system
   - Modify typography if needed
   - Adjust spacing and layout
   - Create component variants for different states

## Design Tokens Reference

### Colors
- **Primary Blue:** `#3B82F6`
- **Success Green:** `#10B981`
- **Warning Amber:** `#F59E0B`
- **Error Red:** `#EF4444`
- **Text Primary:** `#111827` (gray.900)
- **Text Secondary:** `#4B5563` (gray.600)
- **Background Light:** `#F9FAFB` (gray.50)
- **Border:** `#E5E7EB` (gray.200)

### Typography
- **Font Family:** Inter, system-ui, -apple-system, sans-serif
- **Heading XL:** 36px, Bold (700)
- **Heading LG:** 24px, Bold (700)
- **Heading MD:** 20px, Bold (700)
- **Heading SM:** 16px, Bold (700)
- **Body LG:** 18px, Regular (400)
- **Body MD:** 16px, Regular (400)
- **Body SM:** 14px, Regular (400)
- **Body XS:** 12px, Regular (400)

### Spacing
- Uses 4px base unit (Chakra UI spacing scale)
- Common values: 4px, 8px, 16px, 24px, 32px

### Border Radius
- **Small:** 4px (badges, buttons)
- **Medium:** 6px (buttons, cards)
- **Large:** 8px (cards, containers)
- **Full:** 50% (circular elements)

## Notes

- All HTML files are standalone and can be opened directly in a browser for preview
- Colors, spacing, and typography match the current Chakra UI theme
- Components use semantic HTML and are accessible
- Responsive breakpoints are included where applicable (mobile-first approach)
- Hover states and interactions are defined in CSS

## Current Design Principles

1. **Neutral backgrounds** - Gray.50 for cards, white for content areas
2. **Subtle borders** - Gray.200 for separation
3. **Color for status only** - Green for surplus, orange/red for deficit
4. **Clean typography** - Clear hierarchy with consistent font weights
5. **Minimal visual noise** - Focus on content over decoration
