'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Loader2, Sparkles, ArrowLeft, ArrowRight, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'

interface Question {
  id: string
  questionText: string
  questionType: string
  orderIndex: number
  answer?: {
    id: string
    answerText: string
    score: number
    strengths: string
    improvements: string
  }
}

interface SessionData {
  id: string
  roleTitle: string
  status: string
  questions: Question[]
}

export default function InterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<{
    score: number
    strengths: string
    improvements: string
  } | null>(null)

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/interview/${sessionId}`)
      if (!response.ok) throw new Error('Failed to load session')
      
      const data = await response.json()
      setSession(data)
      
      // Find first unanswered question
      const firstUnanswered = data.questions.findIndex((q: Question) => !q.answer)
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered)
      }
    } catch (err) {
      setError('Failed to load interview session')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!session || answer.trim().length < 10) {
      setError('Please provide an answer with at least 10 characters')
      return
    }

    setSubmitting(true)
    setError('')
    setFeedback(null)

    try {
      const currentQuestion = session.questions[currentQuestionIndex]
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit answer')
      }

      const data = await response.json()
      setFeedback({
        score: data.score,
        strengths: data.strengths,
        improvements: data.improvements,
      })

      // Update session with answer
      await loadSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (!session) return
    
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswer('')
      setFeedback(null)
      setError('')
    }
  }

  const handleCompleteInterview = async () => {
    if (!session) return

    setCompleting(true)
    setError('')

    try {
      const response = await fetch('/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete interview')
      }

      router.push(`/u/${slug}/student/interview/${sessionId}/results`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </main>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-red-600">Session not found</p>
            <Button onClick={() => router.push(`/u/${slug}/student`)} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const currentQuestion = session.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1
  const allAnswered = session.questions.every(q => q.answer)
  const currentAnswer = currentQuestion.answer

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

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {session.roleTitle}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Mock Interview Session
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Question {currentQuestionIndex + 1} of {session.questions.length}
              </p>
              <p className="text-xs text-zinc-500">
                {session.questions.filter(q => q.answer).length} answered
              </p>
            </div>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / session.questions.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400">
                    {currentQuestion.questionType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Question {currentQuestion.orderIndex}
                  </span>
                </div>
                <CardTitle className="text-lg">
                  {currentQuestion.questionText}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentAnswer ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Your Answer
                  </label>
                  <Textarea
                    placeholder="Type your answer here... Be specific and use examples where possible."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                    className="resize-none"
                    disabled={submitting}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    {answer.length} characters (minimum 10)
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || answer.trim().length < 10}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Evaluating Answer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Your Answer:
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {currentAnswer.answerText}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {currentAnswer.score}/10
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Score
                    </p>
                  </div>
                  <div className="col-span-2 space-y-3">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Strengths
                      </p>
                      <p className="text-sm text-green-900 dark:text-green-100">
                        {currentAnswer.strengths}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Improvements
                      </p>
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        {currentAnswer.improvements}
                      </p>
                    </div>
                  </div>
                </div>

                {!isLastQuestion ? (
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full"
                    size="lg"
                  >
                    Next Question
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                ) : allAnswered ? (
                  <Button
                    onClick={handleCompleteInterview}
                    disabled={completing}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Complete Interview
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback from previous answer */}
        {feedback && !currentAnswer && (
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Answer Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-4 rounded-lg bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-800">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {feedback.score}/10
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Your Score
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                  ✓ Strengths
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {feedback.strengths}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  ⚡ Improvements
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {feedback.improvements}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
