# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrated (if using PostgreSQL)
- [ ] Prisma client generated
- [ ] Build passes locally (`npm run build`)
- [ ] All tests pass (if any)
- [ ] CloudFront CORS configured (for S3Bubble videos)

## Vercel Deployment

### Step 1: Prepare Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/academy.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/new
2. **Import your GitHub repository**
3. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=your-postgresql-connection-string (if using PostgreSQL)
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### Step 4: Database Setup

#### Option A: SQLite (Development Only)
- SQLite works locally but **NOT recommended for production**
- For production, use PostgreSQL

#### Option B: PostgreSQL (Recommended for Production)

1. **Set up PostgreSQL database**:
   - Use Vercel Postgres, Supabase, or any PostgreSQL provider
   - Get connection string

2. **Update Prisma schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations**:
   ```bash
   npm run db:generate
   npx prisma migrate deploy
   ```

4. **Seed database** (optional):
   ```bash
   npm run db:seed-admin
   ```

### Step 5: Build Settings

Vercel will automatically:
- Detect Next.js framework
- Run `npm install`
- Run `npm run build`
- Deploy

### Step 6: Post-Deployment

1. **Verify deployment**: Visit your Vercel URL
2. **Test admin login**: `/login` with admin credentials
3. **Configure CloudFront CORS** (if using S3Bubble):
   - Add your Vercel domain to CloudFront CORS policy
   - Wait 5-15 minutes for propagation

## Environment Variables

### Required

- `NEXTAUTH_SECRET`: Secret key for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)

### Optional

- `DATABASE_URL`: PostgreSQL connection string (if using PostgreSQL)
- `ATLAS_API_URL`: External API URL for agent authentication (future)
- `ATLAS_API_KEY`: API key for external API (future)

## Database Migration

### From SQLite to PostgreSQL

1. **Export SQLite data** (if needed):
   ```bash
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

2. **Update schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Generate and deploy**:
   ```bash
   npm run db:generate
   npx prisma migrate dev --name init
   npx prisma migrate deploy
   ```

4. **Import data** (if needed):
   - Use Prisma Studio or custom script

## Troubleshooting

### Build Fails

- Check Node.js version (Vercel uses Node 18+ by default)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run lint`

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check database is accessible from Vercel
- Ensure Prisma client is generated: `npm run db:generate`

### Authentication Not Working

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Video Playback Issues

- Configure CloudFront CORS for your Vercel domain
- Check video URLs are correct
- Verify CloudFront distribution is active

## Custom Domain

1. **Add domain in Vercel**: Settings → Domains
2. **Update DNS**: Add CNAME record pointing to Vercel
3. **Update NEXTAUTH_URL**: Set to your custom domain
4. **Redeploy**: Vercel will automatically redeploy

## Monitoring

- **Vercel Analytics**: Enable in dashboard
- **Error Tracking**: Consider adding Sentry or similar
- **Database Monitoring**: Use your PostgreSQL provider's tools

## Backup Strategy

1. **Database**: Regular backups of PostgreSQL
2. **Environment Variables**: Store securely (use Vercel's encrypted storage)
3. **Code**: Git repository is your backup

## Performance Optimization

- Enable Vercel Edge Functions (if needed)
- Use Next.js Image optimization
- Enable caching headers
- Use CDN for static assets (automatic with Vercel)
