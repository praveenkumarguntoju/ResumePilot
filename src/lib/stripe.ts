import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility during build
export const stripe = {} as Stripe

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    optimizations: 3,
    features: [
      '3 resume optimizations',
      'Basic ATS scoring',
      'Cover letter generation',
      'Application tracker',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    optimizations: -1,
    features: [
      'Unlimited resume optimizations',
      'Advanced ATS scoring',
      'Cover letter generation',
      'Application tracker',
      'Priority support',
      'Export to multiple formats',
    ],
  },
}
