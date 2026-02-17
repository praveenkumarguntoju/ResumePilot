# CareerPilot Deployment Guide

## Free Deployment Stack (Recommended)

- **Frontend & Backend**: Vercel (Free tier)
- **Database**: Neon PostgreSQL (Free tier - 512MB storage)
- **File Storage**: Vercel Blob (Free tier - 1GB)

---

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Neon account (sign up at https://neon.tech)

---

## Step 1: Prepare Your Database

### Option A: Neon PostgreSQL (Recommended - Free)

1. Go to https://neon.tech and sign up
2. Create a new project called "careerpilot"
3. Copy your connection string (it looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
4. Save this - you'll need it for Vercel

### Option B: Supabase (Alternative - Free)

1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Replace `[YOUR-PASSWORD]` with your actual password

---

## Step 2: Update Database Configuration

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Run migration locally to test:

```bash
npx prisma migrate dev --name init
```

---

## Step 3: Push to GitHub

1. Initialize git (if not already done):

```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

2. Create a new repository on GitHub

3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/careerpilot.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. Add Environment Variables (click "Environment Variables"):

```env
# Database
DATABASE_URL=your-neon-postgresql-url-here

# NextAuth
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
```

5. Click **Deploy**

---

## Step 5: Run Database Migration on Production

After deployment, you need to push the database schema:

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Link your project:

```bash
vercel link
```

4. Pull environment variables:

```bash
vercel env pull .env.local
```

5. Push database schema:

```bash
npx prisma db push
```

Or use Vercel's built-in Prisma integration:

```bash
vercel env add DATABASE_URL
# Paste your Neon database URL
```

---

## Step 6: Generate Secrets

### NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and add it to Vercel environment variables.

---

## Environment Variables Checklist

Make sure you have these in Vercel:

- ✅ `DATABASE_URL` - Your Neon PostgreSQL connection string
- ✅ `NEXTAUTH_URL` - Your Vercel app URL (e.g., https://careerpilot.vercel.app)
- ✅ `NEXTAUTH_SECRET` - Generated secret from openssl
- ✅ `OPENAI_API_KEY` - Your OpenAI API key

---

## Post-Deployment Steps

1. **Test the deployment**: Visit your Vercel URL
2. **Create an account**: Sign up on your deployed app
3. **Test all features**:
   - Upload resume
   - Optimize for a job
   - Download PDF
   - Create public profile
   - Test AI chat
   - Track applications

---

## Updating Your Deployment

Every time you push to GitHub, Vercel will automatically redeploy:

```bash
git add .
git commit -m "Your changes"
git push
```

---

## Database Management

### View your database:

```bash
npx prisma studio
```

### Run migrations:

```bash
npx prisma migrate deploy
```

### Reset database (CAUTION - deletes all data):

```bash
npx prisma migrate reset
```

---

## Troubleshooting

### Build fails on Vercel

1. Check build logs in Vercel dashboard
2. Make sure all environment variables are set
3. Try building locally: `npm run build`

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Make sure it includes `?sslmode=require` for Neon
3. Check if database is active in Neon dashboard

### Authentication not working

1. Verify `NEXTAUTH_URL` matches your Vercel URL
2. Make sure `NEXTAUTH_SECRET` is set
3. Check browser console for errors

---

## Cost Breakdown (Free Tier Limits)

- **Vercel**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  
- **Neon PostgreSQL**:
  - 512MB storage
  - 1 project
  - Always available

- **OpenAI API**:
  - Pay-as-you-go (very cheap for personal use)
  - ~$0.002 per 1K tokens with GPT-4o-mini

**Total Monthly Cost**: $0 (except OpenAI usage, typically $1-5/month for light use)

---

## Custom Domain (Optional)

1. Buy a domain from Namecheap, GoDaddy, etc.
2. In Vercel dashboard → Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain

---

## Monitoring & Analytics

Vercel provides built-in:
- Real-time logs
- Performance analytics
- Error tracking

Access via: Vercel Dashboard → Your Project → Analytics

---

## Backup Strategy

1. **Database backups**: Neon provides automatic backups
2. **Code backups**: GitHub repository
3. **Export data**: Use Prisma Studio to export data periodically

---

## Security Checklist

- ✅ All environment variables are in Vercel (not in code)
- ✅ `.env.local` is in `.gitignore`
- ✅ NEXTAUTH_SECRET is strong and random
- ✅ Database uses SSL connection
- ✅ CORS is properly configured
- ✅ Rate limiting on API routes (consider adding)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
