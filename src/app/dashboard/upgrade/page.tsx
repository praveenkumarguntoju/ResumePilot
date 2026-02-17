'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

const PLANS = {
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
    optimizations: 'Unlimited',
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

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Unlock unlimited resume optimizations and advanced features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.free.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  ${PLANS.free.price}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PLANS.free.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-2 border-zinc-900 dark:border-zinc-50">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.pro.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  ${PLANS.pro.price}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PLANS.pro.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleUpgrade} className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  )
}
