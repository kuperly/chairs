# 🚀 Deployment Guide - E-commerce Live Platform

## Quick Deployment (Using Mocks)

For the initial deployment, we'll use **mock services** so you can see the app live without setting up all third-party APIs immediately.

### Required Environment Variables (Minimum)

For a working deployment with mocks, you only need:

```bash
# App Configuration
NEXT_PUBLIC_URL=https://your-app.vercel.app
NODE_ENV=production

# Mock Mode (no external services needed)
NEXT_PUBLIC_USE_MOCKS=true
MOCK_STRIPE=true
MOCK_AGORA=true
MOCK_CLOUDINARY=true

# Database (Supabase) - REQUIRED
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Step-by-Step Deployment

#### 1. Deploy to Vercel (Staging)

```bash
# In your project directory
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **[your-username]**
- Link to existing project? **N**
- Project name? **ecommerce-live** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **N**

This will deploy to a staging URL like: `ecommerce-live-[hash].vercel.app`

#### 2. Add Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/[your-username]/ecommerce-live/settings/environment-variables

2. Add these variables:

**Required for Mock Mode:**
```
NEXT_PUBLIC_URL = https://[your-staging-url].vercel.app
NODE_ENV = production
NEXT_PUBLIC_USE_MOCKS = true
MOCK_STRIPE = true
MOCK_AGORA = true
MOCK_CLOUDINARY = true
```

**Required for Database (get from Supabase):**
```
DATABASE_URL = [your-supabase-connection-string]
NEXT_PUBLIC_SUPABASE_URL = [your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
```

**Option B: Via CLI**

```bash
# Set environment variables via CLI
vercel env add NEXT_PUBLIC_URL
vercel env add NODE_ENV
vercel env add NEXT_PUBLIC_USE_MOCKS
vercel env add DATABASE_URL
# ... etc
```

#### 3. Redeploy with Environment Variables

```bash
vercel --prod
```

#### 4. Run Database Migrations

After deployment, you need to run migrations on your Supabase database:

```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run migration:run

# Seed the database
npm run seed
```

---

## Production Deployment (With Real Services)

Once you're ready to use real services, update these variables:

### Supabase (Database & Auth)

1. Create a project at https://supabase.com
2. Get your connection string and keys
3. Update environment variables:
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key]
```

### Stripe (Payments)

1. Get API keys from https://dashboard.stripe.com/test/apikeys
2. For testing, use test keys (start with `sk_test_` and `pk_test_`)
3. Update environment variables:
```bash
STRIPE_SECRET_KEY=sk_test_[your-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]

# Disable mock mode
MOCK_STRIPE=false
```

4. Set up webhook endpoint:
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Agora.io (Live Streaming)

1. Create app at https://console.agora.io
2. Get App ID and Certificate
3. Update environment variables:
```bash
AGORA_APP_ID=[your-app-id]
AGORA_APP_CERTIFICATE=[your-certificate]
NEXT_PUBLIC_AGORA_APP_ID=[your-app-id]

# Disable mock mode
MOCK_AGORA=false
```

### Cloudinary (Images)

1. Create account at https://cloudinary.com
2. Get cloud name and API credentials
3. Update environment variables:
```bash
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=[your-cloud-name]

# Disable mock mode
MOCK_CLOUDINARY=false
```

### LaunchDarkly (Feature Flags) - Optional

1. Create account at https://launchdarkly.com
2. Get SDK keys
3. Update environment variables:
```bash
LAUNCHDARKLY_SDK_KEY=sdk-[your-key]
NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID=[your-client-id]
```

---

## Deployment Commands

### Deploy to Staging
```bash
vercel
```

### Deploy to Production
```bash
vercel --prod
```

### View Deployment Logs
```bash
vercel logs [deployment-url]
```

### List Deployments
```bash
vercel list
```

### Remove Deployment
```bash
vercel remove [deployment-name]
```

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Add all required variables in Vercel dashboard
- Redeploy: `vercel --prod`

**Error: Database connection failed**
- Check DATABASE_URL is correct
- Ensure database is accessible from Vercel
- Check Supabase connection pooler settings

**Error: Module not found**
- Clear node_modules: `rm -rf node_modules && npm install`
- Commit package-lock.json if changed
- Redeploy

### Runtime Errors

**500 Internal Server Error**
- Check deployment logs: `vercel logs`
- Check environment variables are set
- Check database migrations ran successfully

**Authentication not working**
- Verify Supabase URL and keys
- Check Supabase auth settings (allowed domains)
- Add your Vercel domain to Supabase allowed URLs

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics
- Check database query performance
- Add database indexes if needed
- Enable edge caching

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Test authentication (login, register, logout)
- [ ] Test product catalog and search
- [ ] Test shopping cart and checkout
- [ ] Test admin dashboard access
- [ ] Test event creation and management
- [ ] Test on mobile devices
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Set up error tracking (Sentry)
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic with Vercel)

---

## Custom Domain Setup (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel will provide instructions)
4. Update `NEXT_PUBLIC_URL` environment variable
5. Redeploy

---

## Monitoring

### Vercel Dashboard
- https://vercel.com/[username]/[project]
- View deployments, analytics, logs

### Database Monitoring
- Supabase Dashboard: https://supabase.com/dashboard
- Monitor connections, queries, storage

### Error Tracking (Recommended)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Rollback

If something goes wrong:

```bash
# List deployments
vercel list

# Promote a previous deployment to production
vercel promote [deployment-url]
```

Or via Vercel dashboard:
1. Go to Deployments tab
2. Find the working deployment
3. Click "..." → "Promote to Production"

---

**Status:** Ready to deploy! 🚀

**Next:** Run `vercel` to start deployment
