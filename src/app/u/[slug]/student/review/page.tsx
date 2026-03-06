'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, AlertCircle, CheckCircle, XCircle, TrendingUp, ArrowLeft, FileText } from 'lucide-react'

interface ReviewFeedback {
  overallRating: number
  strengths: string[]
  weakBullets: string[]
  missingMetrics: string[]
  genericPhrasing: string[]
  improvements: string[]
  jobDescriptionMatch?: {
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    recommendations: string[]
  }
}

interface ProfileData {
  rawResumeText: string | null
}

export default function StudentReviewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile/me')
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
          setError('Failed to load your resume. Please create a resume first.')
        }
      } catch (err) {
        setError('Failed to load profile data')
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [])

  const handleReview = async () => {
    if (!profile?.rawResumeText) {
      setError('No resume found. Please create a resume first.')
      return
    }

    if (jobDescription.trim().length < 50) {
      setError('Please enter a job description with at least 50 characters')
      return
    }

    setLoading(true)
    setError('')
    setFeedback(null)

    try {
      const response = await fetch('/api/resume/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: profile.rawResumeText.trim(),
          jobDescription: jobDescription.trim()
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to review resume')
      }

      const data = await response.json()
      setFeedback(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review resume')
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 dark:text-green-400'
    if (rating >= 6) return 'text-yellow-600 dark:text-yellow-400'
    if (rating >= 4) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/u/${slug}/student`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-rose-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              AI Resume Review
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Get AI-powered feedback on how well your resume matches a specific job description
          </p>
        </div>

        {!feedback ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Enter Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Paste the job description you want to match your resume against
                </label>
                <Textarea
                  placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  {jobDescription.length} characters (minimum 50 required)
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button
                onClick={handleReview}
                disabled={loading || jobDescription.trim().length < 50 || !profile?.rawResumeText}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Your Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get AI Review
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Rating */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-7xl font-bold ${getRatingColor(feedback.overallRating)} mb-2`}>
                    {feedback.overallRating}/10
                  </div>
                  <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">Overall Resume Quality</p>
                </div>
              </CardContent>
            </Card>

            {/* Job Match Score */}
            {feedback.jobDescriptionMatch && (
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    Job Description Match Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 rounded-lg bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800">
                    <div className={`text-6xl font-bold ${getMatchColor(feedback.jobDescriptionMatch.matchScore)} mb-2`}>
                      {feedback.jobDescriptionMatch.matchScore}%
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Match Score</p>
                  </div>

                  {feedback.jobDescriptionMatch.matchedSkills.length > 0 && (
                    <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-800">
                      <h4 className="text-base font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Matched Skills ({feedback.jobDescriptionMatch.matchedSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.jobDescriptionMatch.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedback.jobDescriptionMatch.missingSkills.length > 0 && (
                    <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800">
                      <h4 className="text-base font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Missing Skills ({feedback.jobDescriptionMatch.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.jobDescriptionMatch.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                            ✗ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedback.jobDescriptionMatch.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-base font-semibold text-blue-700 dark:text-blue-400 mb-3">
                        💡 Recommendations to Improve Match
                      </h4>
                      <ul className="space-y-2">
                        {feedback.jobDescriptionMatch.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="text-blue-600 font-bold mt-0.5">{idx + 1}.</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100">
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>{strength}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weak Bullets */}
            {feedback.weakBullets.length > 0 && (
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertCircle className="h-6 w-6" />
                    Weak Bullet Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.weakBullets.map((bullet, idx) => (
                      <li key={idx} className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Missing Metrics */}
            {feedback.missingMetrics.length > 0 && (
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="h-6 w-6" />
                    Missing Metrics & Quantification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.missingMetrics.map((metric, idx) => (
                      <li key={idx} className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100">
                        {metric}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Generic Phrasing */}
            {feedback.genericPhrasing.length > 0 && (
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <AlertCircle className="h-6 w-6" />
                    Generic Phrasing to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.genericPhrasing.map((phrase, idx) => (
                      <li key={idx} className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100">
                        {phrase}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {feedback.improvements.length > 0 && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Sparkles className="h-6 w-6" />
                    Suggested Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.improvements.map((improvement, idx) => (
                      <li key={idx} className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">{idx + 1}.</span>
                          <span>{improvement}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setFeedback(null)
                  setJobDescription('')
                  setError('')
                }}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Try Another Job
              </Button>
              <Button
                onClick={() => router.push(`/u/${slug}/student`)}
                size="lg"
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
