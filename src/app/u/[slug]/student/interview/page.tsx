'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Sparkles, Target, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function InterviewStartPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [roleTitle, setRoleTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStartInterview = async () => {
    if (!roleTitle.trim()) {
      setError('Please enter a role title')
      return
    }

    if (!consentGiven) {
      setError('Please provide consent to proceed')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle: roleTitle.trim(),
          jobDescription: jobDescription.trim() || undefined,
          consentGiven,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create interview')
      }

      const data = await response.json()
      router.push(`/u/${slug}/student/interview/${data.sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <DashboardHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/u/${slug}/student`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              AI Mock Interview
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Practice your interview skills with AI-powered questions tailored to your resume and target role
          </p>
        </div>

        {/* How it works */}
        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                  1
                </div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Enter Role</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Choose your target position
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                  2
                </div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Generates Questions</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  5 tailored questions
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-pink-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                  3
                </div>
                <p className="text-sm font-medium text-pink-900 dark:text-pink-100">Answer & Get Feedback</p>
                <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                  Instant AI evaluation
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                  4
                </div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Review Summary</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Overall performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Interview Setup
            </CardTitle>
            <CardDescription>
              Tell us about the role you're preparing for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Role Title <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-zinc-500 mt-1">
                The position you're interviewing for
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Job Description <span className="text-zinc-500">(Optional)</span>
              </label>
              <Textarea
                placeholder="Paste the job description here for more tailored questions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Providing a job description helps generate more relevant questions
              </p>
            </div>

            {/* Interview Details */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                What to Expect
              </h4>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>5 questions</strong> tailored to your resume and role</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>5-10 minutes</strong> to complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Instant feedback</strong> on each answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Overall summary</strong> with strengths and improvements</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Your advisor can review your performance</span>
                </li>
              </ul>
            </div>

            {/* Consent */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-sm text-amber-900 dark:text-amber-100 cursor-pointer">
                  <strong>Data Consent:</strong> I agree that my mock interview responses may be stored
                  for improvement and advisor feedback. Your responses help improve the platform and
                  allow your advisor to provide personalized guidance.
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/u/${slug}/student`)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartInterview}
                disabled={loading || !roleTitle.trim() || !consentGiven}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Mock Interview
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
