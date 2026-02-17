#!/bin/bash

echo "🚀 CareerPilot Setup Script"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.template .env.local
    echo "✅ .env.local created. Please edit it with your credentials."
    echo ""
    echo "Required environment variables:"
    echo "  - DATABASE_URL (PostgreSQL connection string)"
    echo "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "  - OPENAI_API_KEY (from OpenAI dashboard)"
    echo "  - STRIPE_SECRET_KEY (from Stripe dashboard)"
    echo "  - STRIPE_PRO_PRICE_ID (Stripe price ID for Pro plan)"
    echo "  - STRIPE_WEBHOOK_SECRET (from Stripe webhook settings)"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
