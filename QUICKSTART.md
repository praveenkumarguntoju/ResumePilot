# Quick Start Guide

## Prerequisites

Before you begin, ensure you have:
- **Node.js 20+** installed
- **PostgreSQL** database running
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))
- **Stripe account** for payments ([Sign up](https://stripe.com))

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy the template:
```bash
cp env.template .env.local
```

Edit `.env.local` with your credentials:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/careerpilot?schema=public"

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# OpenAI - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

# Stripe - Get from https://dashboard.stripe.com
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Set Up Database

Generate Prisma client and create tables:
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the App

### Create an Account
1. Click "Get Started" or "Sign Up"
2. Enter email and password
3. You'll be redirected to the dashboard

### Upload Resume
1. On the dashboard, drag and drop your resume (PDF, DOCX, or TXT)
2. Wait for the upload to complete

### Optimize Resume
1. Click "Optimize Resume"
2. Enter job title, company, and paste the job description
3. Click "Optimize Resume" and wait for AI processing
4. View your optimized resume with ATS score

### Generate Cover Letter
1. On the optimized resume page, click "Generate Cover Letter"
2. Copy or download the generated cover letter

### Track Applications
1. Navigate to "Application Tracker"
2. Click "Add Application"
3. Enter company and role details
4. Drag cards between columns to update status

## Stripe Setup (Optional for Testing)

### 1. Create Stripe Product
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products → Add Product
3. Name: "CareerPilot Pro"
4. Price: $19/month (recurring)
5. Copy the Price ID to `STRIPE_PRO_PRICE_ID`

### 2. Set Up Webhook
1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `http://localhost:3000/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Payments
Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any billing ZIP code

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### OpenAI API Error
- Check API key is valid
- Ensure you have credits in your OpenAI account
- Verify API key has correct permissions

### Stripe Webhook Not Working
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook secret matches

## Production Deployment

### Environment Variables
Set all production values:
- Use production PostgreSQL database
- Generate new NEXTAUTH_SECRET
- Use production Stripe keys
- Set NEXTAUTH_URL to your domain

### Database Migration
```bash
npx prisma migrate deploy
```

### Build
```bash
npm run build
npm start
```

## Next Steps

1. **Customize branding**: Update colors, logo, and copy
2. **Add analytics**: Integrate PostHog, Mixpanel, or Google Analytics
3. **Email notifications**: Add Resend or SendGrid for transactional emails
4. **SEO optimization**: Add meta tags and sitemap
5. **Performance monitoring**: Set up Sentry or similar

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review the code comments
- Open a GitHub issue

---

**Ready to launch!** 🚀
