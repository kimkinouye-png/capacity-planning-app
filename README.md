# Capacity Planning App

A web application for managing team capacity and planning quarterly design work across UX and Content Design teams.

## Features

- **Planning Scenarios**: Create and manage quarterly planning scenarios
- **Effort Estimation**: Factor-based effort estimation for UX and Content Design
- **Capacity Tracking**: Real-time capacity calculations and status indicators
- **Committed Plans**: Mark scenarios as committed and view aggregate capacity
- **Global Settings**: Configurable effort model weights, focus-time ratio, and size-band thresholds
- **Activity Logging**: Track scenario and item changes over time

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Chakra UI with custom dark mode theme
- **Backend**: Netlify Functions (TypeScript)
- **Database**: Neon Postgres (via Netlify DB)
- **Deployment**: Netlify

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon Postgres database (for production)
- Netlify account (for deployment)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Database Setup

See [database/README.md](./database/README.md) for database setup instructions.

### Environment Variables

For local development, create a `.env` file:

```env
NETLIFY_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

For production, set `NETLIFY_DATABASE_URL` in your Netlify dashboard.

## Project Structure

```
├── database/           # Database schema and migrations
├── netlify/
│   └── functions/      # Netlify Functions (API endpoints)
├── src/
│   ├── components/     # React components
│   ├── config/        # Configuration files (effort model, etc.)
│   ├── context/       # React Context providers
│   ├── domain/        # TypeScript types and domain models
│   ├── pages/         # Page components
│   └── utils/         # Utility functions
└── public/            # Static assets
```

## API Endpoints

- `GET /.netlify/functions/get-settings` - Get global settings
- `PUT /.netlify/functions/update-settings` - Update global settings
- `GET /.netlify/functions/get-scenarios` - Get all scenarios
- `POST /.netlify/functions/create-scenario` - Create a new scenario

## License

Private project - All rights reserved

**Live Demo:** https://capacity-planning-2.netlify.app/

## Features

### Contextual Homepage
- **Welcome back** section with "Open last scenario" button for quick re-entry
- **Recent scenarios** list showing the 3-5 most recently updated scenarios
- **Recent activity** log displaying the last 10 events (scenario creation, commits, updates, deletions)
- Empty state with clear call-to-action for first-time users

### Scenario Management
- **Create scenarios** for quarterly planning periods (2026-Q1 through 2026-Q4)
- **Inline editing** of scenario names directly from cards and summary pages
- **Commit scenarios** as the official quarterly plan (only one per quarter)
- **Delete empty scenarios** with confirmation dialog
- **Visual indicators** for committed vs draft scenarios
- **Smart sorting**: Committed scenarios first, then by quarter, then alphabetically

### Committed Plan Workflow
- Mark scenarios as "committed" to designate the official quarterly plan
- Only one scenario per quarter can be committed at a time
- Committed scenarios are visually distinguished and sorted to the top
- Dedicated "Committed Plan" page for viewing committed scenarios

### Real-Time Capacity Calculations
- **Factor-based effort estimation** for UX and Content Design
- **Size bands**: XS, S, M, L, XL based on weighted factor scores
- **Focus weeks vs work weeks**: Distinction between dedicated time and calendar span
- **Capacity vs demand analysis** with surplus/deficit indicators
- **Sprint estimates**: Automatic calculation of sprint ranges (e.g., "1-2 sprints")
- **Visual status indicators**: Green dot for "Within capacity", orange dot for "Over capacity"

### Activity Tracking
- Automatic logging of all key actions:
  - Scenario creation, renaming, committing, deletion
  - Roadmap item updates
  - Effort calculation changes
- Timestamped activity log with relative time display (e.g., "2 hours ago")
- Activity visible on homepage for quick context

### Roadmap Item Management
- **PM Intake** tab for project requirements and objectives
- **Product Design** tab with 3-factor scoring (Product Risk, Problem Ambiguity, Discovery Depth)
- **Content Design** tab with 4-factor scoring (Content Surface Area, Localization Scope, Regulatory & Brand Risk, Legal Compliance Dependency)
- **Real-time calculations** as factor scores are adjusted
- **Session Summary** page with full capacity overview and roadmap items table
- **Inline item creation** without leaving the summary page

### Visual Design
- Clean, neutral design with minimal visual noise
- Neutral gray backgrounds for capacity cards
- Clean table styling with subtle borders
- Color used only for status indicators (green for surplus, orange for deficit)
- Responsive layout that works on desktop and mobile

## Recent Updates (Phase 2 - January 13, 2026)

### New Features
- ✅ Contextual homepage with activity tracking
- ✅ Committed Plan workflow for quarterly planning
- ✅ Inline scenario name editing
- ✅ Scenario deletion for empty scenarios
- ✅ Activity logging for all key actions
- ✅ Visual cleanup of capacity cards and roadmap table

### Improvements
- ✅ Enhanced navigation with Home, Scenarios, Committed Plan, and Guide links
- ✅ Improved routing to keep users in context
- ✅ Smart sorting with committed scenarios prioritized
- ✅ Better visual distinction between committed and draft scenarios

## Technology Stack

- **React** with TypeScript
- **Chakra UI** for component library
- **React Router** for navigation
- **localStorage** for data persistence
- **Vite** for build tooling

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers (sessions, items, activity)
├── pages/              # Page components
├── config/             # Configuration files (effort model, quarters, sprints)
├── domain/             # Type definitions
├── estimation/         # Effort calculation logic
└── utils/              # Utility functions
```

## Key Concepts

### Focus-Time vs Work-Week Span
- **Focus weeks** = Dedicated designer time (e.g., "3 focus weeks")
- **Work weeks** = Calendar span (e.g., "6 work weeks" to complete 3 focus weeks)

Designers rarely work 100% on one item. Work weeks account for context switching, dependencies, meetings, and parallel work streams.

### Factor-Based Sizing
Items are sized using weighted factor scores (1-5) that map to size bands (XS-XL):
- **UX Factors**: Product Risk, Problem Ambiguity, Discovery Depth
- **Content Factors**: Content Surface Area, Localization Scope, Regulatory & Brand Risk, Legal Compliance Dependency

### Scenarios as What-If Plans
Each scenario represents a "what-if" capacity planning exercise for a specific quarter. Scenarios can be compared, and one can be committed as the official quarterly plan.

## Data Persistence

All data is stored in browser localStorage:
- Scenarios and their configurations
- Roadmap items and effort calculations
- PM Intake, Product Design, and Content Design inputs
- Activity log (last 10 events)

## Browser Support

Modern browsers with localStorage support. Tested on:
- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)

## License

MIT

## Contributing

This is a private project. For questions or issues, please contact the maintainer.
