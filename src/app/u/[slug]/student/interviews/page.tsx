'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, MessageSquare, ChevronDown, ChevronUp, CheckCircle, TrendingUp, Sparkles, Calendar, Target } from 'lucide-react'

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
  } | null
}

interface InterviewSession {
  id: string
  roleTitle: string
  status: string
  overallScore: number | null
  totalQuestions: number
  answeredQuestions: number
  createdAt: string
  summary: {
    strengths: string[]
    improvements: string[]
    recommendedPractice: string[]
    advisorComment?: string
  } | null
}

interface SessionDetail {
  id: string
  roleTitle: string
  jobDescription: string | null
  status: string
  overallScore: number | null
  createdAt: string
  questions: Question[]
  summary: {
    overallScore: number
    strengths: string[]
    improvements: string[]
    recommendedPractice: string[]
    advisorComment?: string
  } | null
}

export default function InterviewHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [sessionDetails, setSessionDetails] = useState<Record<string, SessionDetail>>({})
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/interview/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSessionDetails = async (sessionId: string) => {
    if (sessionDetails[sessionId]) return // Already loaded

    setLoadingDetails(sessionId)
    try {
      const response = await fetch(`/api/interview/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionDetails(prev => ({ ...prev, [sessionId]: data }))
      }
    } catch (err) {
      console.error('Failed to load session details:', err)
    } finally {
      setLoadingDetails(null)
    }
  }

  const toggleSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null)
    } else {
      setExpandedSession(sessionId)
      await loadSessionDetails(sessionId)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-950/20 border-green-200 dark:border-green-800'
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-100 dark:bg-red-950/20 border-red-200 dark:border-red-800'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Mock Interview History
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review your practice interview sessions and track your progress
          </p>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                No interviews yet
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Start your first mock interview to practice and improve your skills
              </p>
              <Button
                onClick={() => router.push(`/u/${slug}/student/interview`)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Mock Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedSession === session.id
              const details = sessionDetails[session.id]
              const isLoadingDetails = loadingDetails === session.id

              return (
                <Card key={session.id} className="overflow-hidden">
                  <div
                    onClick={() => toggleSession(session.id)}
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {session.roleTitle}
                          </h3>
                          {session.status === 'completed' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-medium">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {session.answeredQuestions}/{session.totalQuestions} questions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.overallScore !== null && (
                          <div className="text-right">
                            <div className={`text-4xl font-bold ${getScoreColor(session.overallScore)}`}>
                              {session.overallScore}%
                            </div>
                            <p className="text-xs text-zinc-500">Overall Score</p>
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6 text-zinc-400" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-zinc-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6">
                      {isLoadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        </div>
                      ) : details ? (
                        <div className="space-y-6">
                          {/* Summary */}
                          {details.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className={`border ${getScoreBg(details.summary.overallScore)}`}>
                                <CardHeader>
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Strengths
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {details.summary.strengths.map((strength, idx) => (
                                      <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-green-600 font-bold shrink-0">✓</span>
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>

                              <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                                <CardHeader>
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Areas to Improve
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {details.summary.improvements.map((improvement, idx) => (
                                      <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                                        <span>{improvement}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {/* Recommended Practice */}
                          {details.summary?.recommendedPractice && details.summary.recommendedPractice.length > 0 && (
                            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                              <CardHeader>
                                <CardTitle className="text-sm">Recommended Practice Topics</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {details.summary.recommendedPractice.map((topic, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm font-medium"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Questions & Answers */}
                          <div>
                            <h4 className="font-semibold text-lg mb-4">Question-by-Question Analysis</h4>
                            <div className="space-y-4">
                              {details.questions.map((question, idx) => (
                                <Card key={question.id} className="border-zinc-200 dark:border-zinc-800">
                                  <CardHeader>
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400">
                                            Q{idx + 1}
                                          </span>
                                          <span className="text-xs text-zinc-500">
                                            {question.questionType.replace('_', ' ').toUpperCase()}
                                          </span>
                                        </div>
                                        <CardTitle className="text-base">{question.questionText}</CardTitle>
                                      </div>
                                      {question.answer && (
                                        <div className={`text-2xl font-bold ml-4 ${getScoreColor(question.answer.score * 10)}`}>
                                          {question.answer.score}/10
                                        </div>
                                      )}
                                    </div>
                                  </CardHeader>
                                  {question.answer && (
                                    <CardContent className="space-y-3">
                                      <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Your Answer:</p>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{question.answer.answerText}</p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">✓ Strengths</p>
                                          <p className="text-sm text-green-900 dark:text-green-100">{question.answer.strengths}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚡ Improvements</p>
                                          <p className="text-sm text-amber-900 dark:text-amber-100">{question.answer.improvements}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  )}
                                </Card>
                              ))}
                            </div>
                          </div>

                          {/* Advisor Comment */}
                          {details.summary?.advisorComment && (
                            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                              <CardHeader>
                                <CardTitle className="text-sm">Advisor Feedback</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{details.summary.advisorComment}</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => router.push(`/u/${slug}/student/interview`)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start New Mock Interview
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
