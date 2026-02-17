# 🚀 Quick Deployment Guide - ResumePilot

## Deploy in 15 Minutes (Free)

### Step 1: Get a Free PostgreSQL Database (2 minutes)

1. Go to **https://neon.tech**
2. Sign up with GitHub
3. Create a new project: "resumepilot"
4. Copy your connection string - it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this somewhere safe

### Step 2: Push to GitHub (3 minutes)

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/resumepilot.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (5 minutes)

1. Go to **https://vercel.com/new**
2. Sign up with GitHub
3. Click "Import Project"
4. Select your `resumepilot` repository
5. Click "Deploy" (don't configure anything yet)

### Step 4: Add Environment Variables (5 minutes)

In Vercel dashboard → Settings → Environment Variables, add these:

#### DATABASE_URL
```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```
(Your Neon connection string from Step 1)

#### NEXTAUTH_URL
```
https://your-project-name.vercel.app
```
(Your Vercel app URL - shown after deployment)

#### NEXTAUTH_SECRET
Generate this by running in your terminal:
```bash
openssl rand -base64 32
```
Copy the output and paste it

#### OPENAI_API_KEY
```
sk-proj-xxxxxxxxxxxxx
```
(Your OpenAI API key from https://platform.openai.com/api-keys)

### Step 5: Redeploy (1 minute)

After adding environment variables:
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### Step 6: Initialize Database (1 minute)

The database schema will be automatically created on first deployment thanks to the `vercel-build` script.

### ✅ Done!

Visit your app at: `https://your-project-name.vercel.app`

---

## Testing Your Deployment

1. **Sign up** for an account
2. **Upload** your resume
3. **Optimize** for a job
4. **Download** the PDF
5. **Create** a public profile
6. **Test** the AI chat

---

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is correct in Vercel
- Make sure it includes `?sslmode=require`
- Verify database is active in Neon dashboard

### "Authentication error"
- Verify `NEXTAUTH_URL` matches your Vercel URL exactly
- Check `NEXTAUTH_SECRET` is set
- Try clearing browser cookies

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is correct
- Check you have credits in OpenAI account
- Make sure key starts with `sk-`

---

## Updating Your App

Every time you push to GitHub, Vercel automatically redeploys:

```bash
git add .
git commit -m "Your changes"
git push
```

---

## Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Vercel: Settings → Domains
3. Add your domain
4. Update DNS as instructed
5. Update `NEXTAUTH_URL` to your custom domain

---

## Monitoring

- **Logs**: Vercel Dashboard → Your Project → Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Database**: Neon Dashboard → Your Project → Monitoring

---

## Need Help?

See the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed instructions.
