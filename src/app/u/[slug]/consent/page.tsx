'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShieldCheck, ShieldOff, CheckCircle2, Info } from 'lucide-react'

export default function ConsentPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [consentGiven, setConsentGiven] = useState(false)
  const [consentAt, setConsentAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadConsent() {
      try {
        const res = await fetch(`/api/university/${slug}/consent`)
        if (res.ok) {
          const data = await res.json()
          setConsentGiven(data.consentGiven)
          setConsentAt(data.consentAt)
        }
      } catch (err) {
        console.error('Failed to load consent:', err)
      } finally {
        setLoading(false)
      }
    }
    loadConsent()
  }, [slug])

  const updateConsent = async (consent: boolean) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/university/${slug}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent }),
      })
      if (res.ok) {
        const data = await res.json()
        setConsentGiven(data.consentGiven)
        setConsentAt(data.consentAt)
      }
    } catch (err) {
      console.error('Failed to update consent:', err)
    } finally {
      setUpdating(false)
    }
  }

  const universityName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
            {consentGiven ? (
              <ShieldCheck className="h-8 w-8 text-green-600" />
            ) : (
              <ShieldOff className="h-8 w-8 text-orange-600" />
            )}
          </div>
          <CardTitle className="text-2xl">Data Sharing Consent</CardTitle>
          <CardDescription>
            {universityName} — GDPR Compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {consentGiven ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Consent granted</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  You gave consent on {consentAt ? new Date(consentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'an earlier date'}.
                  Your profile data may be shared with career advisors at {universityName}.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <Info className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Consent not given</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Your profile data is not shared with advisors. Some features may be limited.
                </p>
              </div>
            </div>
          )}

          {/* What we share */}
          <div>
            <h3 className="text-sm font-semibold mb-3">What data is shared with your university?</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Resume content</strong> — Your uploaded resume text for advisor review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Interview Readiness Score</strong> — Your overall score and breakdown</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Skill gap analysis</strong> — Missing skills and improvement suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Basic profile info</strong> — Name and email address</span>
              </li>
            </ul>
          </div>

          {/* What we don't share */}
          <div>
            <h3 className="text-sm font-semibold mb-3">What is NOT shared?</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-1">•</span>
                <span>Your password or authentication credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-1">•</span>
                <span>Job applications or application tracking data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-1">•</span>
                <span>Data with any third parties outside {universityName}</span>
              </li>
            </ul>
          </div>

          {/* Your rights */}
          <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            <p className="font-medium mb-1">Your rights under GDPR:</p>
            <p>
              You can withdraw consent at any time. Withdrawing consent will stop future data sharing
              but will not affect data already processed. You also have the right to request data
              deletion by contacting your university administrator.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {consentGiven ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => updateConsent(false)}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldOff className="h-4 w-4 mr-2" />
                )}
                Withdraw Consent
              </Button>
            ) : (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => updateConsent(true)}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                Give Consent
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
