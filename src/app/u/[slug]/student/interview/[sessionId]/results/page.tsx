'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, CheckCircle, TrendingUp, AlertCircle, Sparkles, Target, RotateCcw } from 'lucide-react'

interface Question {
  id: string
  questionText: string
  questionType: string
  orderIndex: number
  answer: {
    answerText: string
    score: number
    strengths: string
    improvements: string
  }
}

interface SessionData {
  id: string
  roleTitle: string
  overallScore: number
  userId: string
  questions: Question[]
  summary: {
    overallScore: number
    strengths: string[]
    improvements: string[]
    recommendedPractice: string[]
    advisorComment?: string
  }
}

export default function InterviewResultsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: userSession } = useSession()
  const slug = params.slug as string
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResults()
  }, [sessionId])

  const loadResults = async () => {
    try {
      const response = await fetch(`/api/interview/${sessionId}`)
      if (!response.ok) throw new Error('Failed to load results')
      
      const data = await response.json()
      setSession(data)
    } catch (err) {
      setError('Failed to load interview results')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800'
    if (score >= 60) return 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800'
    if (score >= 40) return 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800'
    return 'from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <DashboardHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <DashboardHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-red-600">{error || 'Results not found'}</p>
            <Button onClick={() => router.push(`/u/${slug}/student`)} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const averageScore = Math.round(
    session.questions.reduce((sum, q) => sum + q.answer.score, 0) / session.questions.length * 10
  )

  // Determine if advisor is viewing student's interview
  const isAdvisorView = userSession?.user?.role === 'advisor' && session?.userId !== userSession?.user?.id
  const studentId = session?.userId

  const handleBackNavigation = () => {
    if (isAdvisorView && studentId) {
      // Advisor viewing student's interview - go back to student analysis page
      router.push(`/u/${slug}/advisor/${studentId}`)
    } else {
      // Student viewing their own interview - go to student dashboard
      router.push(`/u/${slug}/student`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={handleBackNavigation}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isAdvisorView ? 'Back to Student Analysis' : 'Back to Dashboard'}
        </Button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Interview Complete!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {session.roleTitle} - Mock Interview Results
          </p>
        </div>

        {/* Overall Score */}
        <Card className={`mb-8 border-2 bg-gradient-to-br ${getScoreBgColor(session.summary?.overallScore || averageScore)}`}>
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Overall Performance
              </p>
              <div className={`text-7xl font-bold ${getScoreColor(session.summary?.overallScore || averageScore)} mb-2`}>
                {session.summary?.overallScore || averageScore}%
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Based on {session.questions.length} questions
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          {session.summary?.strengths && session.summary.strengths.length > 0 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-6 w-6" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {session.summary.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <span className="text-green-600 font-bold shrink-0">✓</span>
                      <span className="text-sm text-green-900 dark:text-green-100">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {session.summary?.improvements && session.summary.improvements.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {session.summary.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                      <span className="text-sm text-amber-900 dark:text-amber-100">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommended Practice */}
        {session.summary?.recommendedPractice && session.summary.recommendedPractice.length > 0 && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Target className="h-6 w-6" />
                Recommended Practice Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {session.summary.recommendedPractice.map((topic, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-center">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{topic}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advisor Comment */}
        {session.summary?.advisorComment && (
          <Card className="mb-8 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="text-purple-900 dark:text-purple-100">
                Advisor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                {session.summary.advisorComment}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Question by Question Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question-by-Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.questions.map((question, idx) => (
              <div key={question.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {question.questionType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                      {question.questionText}
                    </p>
                  </div>
                  <div className="text-center ml-4">
                    <div className={`text-2xl font-bold ${getScoreColor(question.answer.score * 10)}`}>
                      {question.answer.score}/10
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="p-2 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Your Answer:</p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">
                      {question.answer.answerText}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">✓ Strengths</p>
                      <p className="text-xs text-green-900 dark:text-green-100">
                        {question.answer.strengths}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚡ Improvements</p>
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        {question.answer.improvements}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push(`/u/${slug}/student/interview`)}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Try Another Interview
          </Button>
          <Button
            onClick={() => router.push(`/u/${slug}/student`)}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}
