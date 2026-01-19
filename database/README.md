# Database Setup Guide

## Neon Postgres Database Setup

This application uses Neon Postgres (via Netlify DB) for persistent storage of settings, scenarios, roadmap items, and activity logs.

### Prerequisites

1. A Neon Postgres database (sign up at https://neon.tech)
2. Netlify account with Netlify DB enabled
3. `NETLIFY_DATABASE_URL` environment variable set in Netlify

### Setup Steps

1. **Create Neon Database**
   - Sign up for Neon at https://neon.tech
   - Create a new project and database
   - Copy the connection string

2. **Configure Netlify**
   - In your Netlify dashboard, go to Site settings > Environment variables
   - Add `NETLIFY_DATABASE_URL` with your Neon connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`

3. **Run Database Schema**
   - Connect to your Neon database using your preferred SQL client
   - Run the SQL script from `database/schema.sql`
   - This creates all necessary tables, indexes, and triggers

4. **Verify Setup**
   - The schema creates a default settings row with ID `00000000-0000-0000-0000-000000000000`
   - Netlify Functions will automatically create this row if it doesn't exist on first access

### Schema Overview

- **settings**: Global configuration (effort model weights, focus-time ratio, size-band thresholds)
- **scenarios**: Planning scenarios with quarterly periods
- **roadmap_items**: Individual roadmap items with PM/UX/Content inputs and calculated effort
- **activity_log**: Activity tracking for scenarios and items

### Migration from localStorage

The app currently uses localStorage as a fallback. Future migration scripts will be added to move existing data to Neon.

### Local Development

For local development, Netlify Functions run on `http://localhost:8888` by default. The React app will automatically use the correct API base URL based on the environment.
