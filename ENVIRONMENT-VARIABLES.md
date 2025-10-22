# Environment Variables Configuration

This file documents all required environment variables for the EpicarePlans Marketplace.

## Required Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# ==============================================================================
# SUPABASE CONFIGURATION
# ==============================================================================
# Get these from your Supabase project settings:
# https://app.supabase.com/project/YOUR_PROJECT/settings/api

NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ==============================================================================
# DASHBOARD URL
# ==============================================================================
# URL of the dashboard subdomain (for authentication sharing)

# Production:
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.epicareplans.com

# Development (if running dashboard locally):
# NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001

# ==============================================================================
# ALLSTATE API CONFIGURATION (Optional)
# ==============================================================================
# API credentials for Allstate insurance integration

ALLSTATE_API_KEY=your-allstate-api-key
ALLSTATE_API_ENDPOINT=https://api.allstate.com
```

## Setup Instructions

### 1. Create `.env.local` file

```bash
cp .env.local.example .env.local
```

Or create it manually in the root directory.

### 2. Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings > API
4. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Dashboard URL

**For Production:**
```bash
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.epicareplans.com
```

**For Local Development:**
```bash
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
```

### 4. Configure Allstate API (Optional)

If you have Allstate API credentials:
```bash
ALLSTATE_API_KEY=your-actual-api-key
ALLSTATE_API_ENDPOINT=https://api.allstate.com
```

## Important Notes

⚠️ **Security:**
- Never commit `.env.local` to version control
- The `.gitignore` file already excludes `.env.local`
- Use different values for development and production

⚠️ **Prefix Rules:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without the prefix are server-side only
- Only use `NEXT_PUBLIC_` for non-sensitive data

## Testing Your Configuration

After setting up your environment variables, restart your development server:

```bash
npm run dev
```

Check the console for any missing variable errors.

## Related Documentation

- [SUPABASE-SETUP-GUIDE.md](./SUPABASE-SETUP-GUIDE.md) - Supabase configuration guide
- [DASHBOARD-AUTH-SETUP.md](./DASHBOARD-AUTH-SETUP.md) - Dashboard authentication setup

