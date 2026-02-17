# ResumePilot 🚀

AI-powered resume optimization platform to help you land your dream job.

## Features

### ✅ Week 1 - Foundation
- **User Authentication**: Secure login/signup with NextAuth.js
- **Resume Upload**: Upload resumes in PDF, DOCX, or TXT format
- **PDF Text Extraction**: Automatically extract text from uploaded resumes
- **Dashboard**: Clean, modern dashboard to manage your job search

### ✅ Week 2 - AI Resume Optimization
- **Job Description Input**: Paste any job description
- **AI-Powered Optimization**: OpenAI GPT-4 tailors your resume for each job
- **ATS Score**: Get an ATS compatibility score for your resume
- **Keyword Matching**: See how well your resume matches the job requirements

### ✅ Week 3 - Cover Letter & Tracking
- **Cover Letter Generation**: AI-generated cover letters tailored to each job
- **PDF/DOCX Export**: Download optimized resumes in multiple formats
- **Application Tracker**: Kanban-style board to manage job applications
- **Drag & Drop**: Move applications between stages (Applied, Interviewing, Offer, Rejected)

### ✅ Week 4 - Monetization & Polish
- **Stripe Integration**: Secure payment processing
- **Free Plan**: 3 resume optimizations for free users
- **Pro Plan**: Unlimited optimizations for $19/month
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **AI**: OpenAI GPT-4o-mini
- **Payments**: Stripe
- **File Processing**: pdf-parse, mammoth, pdf-lib, docx
- **Drag & Drop**: @dnd-kit
- **UI Components**: Custom components with shadcn/ui patterns

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd resumepilot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.template .env.local
```

Edit `.env.local` with your credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/resumepilot"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-api-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PRO_PRICE_ID="your-stripe-price-id"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

```prisma
User
- id, email, passwordHash, planType
- Relations: Profile, Resumes, Applications

Profile
- id, userId, rawResumeText, structuredJson
- Stores the user's base resume

Resume
- id, userId, jobTitle, company, tailoredResumeText
- atsScore, keywordMatch, jobDescription
- Each optimized resume for a specific job

Application
- id, userId, company, role, status, dateApplied, notes
- Tracks job applications in the Kanban board
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── resume/       # Resume upload & optimization
│   │   ├── cover-letter/ # Cover letter generation
│   │   ├── applications/ # Application CRUD
│   │   └── stripe/       # Payment processing
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/               # Base UI components
│   └── ...               # Feature components
├── lib/                  # Utilities
│   ├── prisma.ts         # Database client
│   ├── stripe.ts         # Stripe client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript types
```

## Key Features Explained

### Resume Optimization Flow
1. User uploads base resume (stored in Profile)
2. User pastes job description and company info
3. OpenAI analyzes both and generates tailored resume
4. System calculates ATS score and keyword match percentage
5. User can download as PDF or DOCX

### Free Plan Limits
- Free users: 3 resume optimizations
- Check enforced in `/api/resume/optimize` route
- Upgrade prompt shown when limit reached

### Stripe Integration
- Checkout session created via `/api/stripe/create-checkout`
- Webhook handles subscription events at `/api/stripe/webhook`
- User's `planType` updated automatically

## Deployment

### Environment Variables (Production)
Ensure all environment variables are set in your hosting platform:
- `DATABASE_URL`: Production PostgreSQL connection string
- `NEXTAUTH_URL`: Your production domain
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY`: Your OpenAI API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PRO_PRICE_ID`: Stripe price ID for Pro plan
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

### Database Migration
```bash
npx prisma migrate deploy
```

### Build
```bash
npm run build
npm start
```

## Roadmap

Future enhancements:
- LinkedIn profile import
- Multiple resume versions
- Interview preparation AI
- Salary negotiation tips
- Job search automation
- Chrome extension for one-click applications

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
