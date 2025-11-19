# ⚠️ Important: Database Limitations on Vercel

## Current Status

The application is deployed to Vercel using SQLite, but **data will NOT persist** between deployments or serverless function cold starts.

### Why This Happens

1. **Vercel uses ephemeral storage** - `/tmp` directory is cleared between function invocations
2. **Serverless is stateless** - Each request may run on a different server
3. **Database resets frequently** - Player registrations and brackets will be lost

### This Means:

- ✅ App works for **testing and demos**
- ❌ NOT suitable for **production tournament** (data loss)
- 🔄 Database reinitializes on **every cold start**
- ⏰ Data persists only for **~15 minutes** (function lifetime)

## Solutions for Production

### Option 1: Use Vercel Postgres (Recommended)

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/charles-projects-5049ee53/aoetournaments)
2. Click "Storage" → "Create Database" → "Postgres"
3. Follow the migration guide in Vercel docs
4. Update database code to use Postgres instead of SQLite

**Benefits:**
- Persistent storage
- Better performance
- Production-ready
- Free tier available

### Option 2: Use Neon (Serverless Postgres)

1. Create account at [neon.tech](https://neon.tech)
2. Create database
3. Get connection string
4. Add to environment variables
5. Update database code

### Option 3: Deploy to Traditional Hosting

For SQLite persistence, deploy to:
- **Railway** - Easy deployment with persistent storage
- **Fly.io** - Persistent volumes supported
- **VPS** - DigitalOcean, Linode, etc.

## Quick Test (Current Setup)

You can still test the app on Vercel:

1. Visit the site
2. Register players
3. Generate bracket
4. **Note:** Data will be lost after ~15 minutes or on next deployment

## Recommended Action

**For your tournament:**
- Migrate to Vercel Postgres (takes ~10 minutes)
- OR deploy to Railway/Fly.io for SQLite persistence
- OR use for testing only and deploy elsewhere for the actual tournament

---

**Current setup works for:**
- ✅ Demonstrating the app
- ✅ Testing features
- ✅ Sharing with potential users

**NOT suitable for:**
- ❌ Actual tournament with real players
- ❌ Any scenario requiring data persistence
