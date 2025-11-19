# Deployment Instructions for Coupe Québec AOE2

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free) at [vercel.com](https://vercel.com)

### Step-by-Step Deployment

#### 1. Push to GitHub (if not done yet)
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/coupe-quebec-aoe2.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: coupe-quebec-aoe2
# - Directory: ./
# - Override settings? N

# After preview deployment succeeds, deploy to production:
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `coupe-quebec-aoe2`
4. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click "Deploy"

#### 3. Set Environment Variables

After deployment, add environment variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables for **Production**:

```
TOURNAMENT_CODE=CHANGE_THIS_TO_YOUR_CODE
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
SESSION_SECRET=GENERATE_RANDOM_32_CHAR_STRING
DATABASE_PATH=./tournament.db
NODE_ENV=production
```

**Generate a secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Important: Database Considerations

**⚠️ SQLite Limitation on Vercel:**
Vercel's serverless functions are stateless, meaning the SQLite database file won't persist between deployments or across serverless function invocations.

**Solutions:**

**Option A: Use Vercel Postgres (Recommended for production)**
1. Go to your Vercel project → Storage → Create Database
2. Select "Postgres"
3. Update database code to use Postgres instead of SQLite

**Option B: Use SQLite for demo/testing only**
- Understand that data will be lost on each deployment
- Run `npm run init-db` after each deployment
- Player registrations and brackets will be temporary

**Option C: Use external database service**
- Neon (serverless Postgres)
- PlanetScale (MySQL)
- Supabase (Postgres)

#### 5. Post-Deployment Setup

After first deployment:

1. **Initialize Database** (if using SQLite)
   - Vercel doesn't support running scripts on deployment
   - You'll need to modify the init script to run on first API call
   - Or manually initialize via API endpoint

2. **Test the Application**
   ```
   https://your-project.vercel.app/
   ```

3. **Test Registration**
   - Visit `/register`
   - Use your tournament code
   - Verify player is saved

4. **Test Admin Panel**
   - Visit `/admin`
   - Login with admin credentials
   - Generate bracket when 20 players registered

#### 6. Share with Friends

Once deployed, share:
- **Registration Link:** `https://your-project.vercel.app/register`
- **Tournament Code:** (share separately for security)
- **Bracket View:** `https://your-project.vercel.app/brackets`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure TypeScript has no errors: `npm run build` locally

### Database Issues
- Remember: SQLite doesn't persist on Vercel
- Consider migrating to Vercel Postgres for production

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate automatically provisioned

## Monitoring

- View logs: Vercel Dashboard → Your Project → Logs
- Monitor performance: Vercel Dashboard → Analytics
- Check deployments: Vercel Dashboard → Deployments

---

## Alternative: Local Deployment

If you prefer to host locally or on a VPS:

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm i -g pm2
pm2 start npm --name "coupe-quebec-aoe2" -- start
```

---

**Need Help?** Check the README.md for full documentation or visit [Vercel Documentation](https://vercel.com/docs)
