'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export default function PendingApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { data: session, update } = useSession()

  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const checkStatus = async () => {
    setChecking(true)
    try {
      // Re-fetch session to get latest approval status
      await update()
      const res = await fetch('/api/auth/session')
      const sess = await res.json()

      if (sess?.user?.isApproved) {
        setStatus('approved')
        const role = sess.user.role
        setTimeout(() => {
          router.push(`/u/${slug}/${role}`)
        }, 1500)
      } else if (!sess?.user) {
        setStatus('rejected')
      }
    } catch (err) {
      console.error('Status check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    // Check on load
    if (session?.user?.isApproved) {
      setStatus('approved')
      const role = session.user.role
      router.push(`/u/${slug}/${role}`)
    }
  }, [session, slug, router])

  const universityName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          {status === 'pending' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Awaiting Approval</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Your registration at <strong>{universityName}</strong> is pending approval
                  from the university administrator.
                </p>
                <p className="text-zinc-500 text-xs mt-3">
                  You will be able to access the platform once your account has been approved.
                  This usually takes 1–2 working days.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={checkStatus}
                  disabled={checking}
                  variant="outline"
                >
                  {checking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Check Status
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: `/u/${slug}/login` })}
                >
                  Sign Out
                </Button>
              </div>
            </>
          )}

          {status === 'approved' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Approved!</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Your account has been approved. Redirecting you now...
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-green-500 mx-auto" />
            </>
          )}

          {status === 'rejected' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Account Issue</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  There was an issue with your account. Please contact the university
                  administrator for assistance.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: `/u/${slug}/login` })}
              >
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
