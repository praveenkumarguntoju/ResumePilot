'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, Users, Target, MessageSquare, Send, ChevronDown, ChevronUp, Bell, Plus } from 'lucide-react'

interface Student {
  id: string
  name: string | null
  email: string
  isApproved: boolean
  readinessScore: number | null
  targetRole: string | null
  hasResume: boolean
}

interface Comment {
  id: string
  commentText: string
  createdAt: string
}

interface Opportunity {
  id: string
  title: string
  description: string | null
  link: string | null
  createdAt: string
  _count: { students: number }
}

export default function AdvisorDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [showOppForm, setShowOppForm] = useState(false)
  const [creatingOpp, setCreatingOpp] = useState(false)
  const [oppTitle, setOppTitle] = useState('')
  const [oppDesc, setOppDesc] = useState('')
  const [oppLink, setOppLink] = useState('')

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch(`/api/university/${slug}/students`)
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
        }
      } catch (err) {
        console.error('Failed to load students:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
    loadOpportunities()
  }, [slug])

  async function loadOpportunities() {
    try {
      const res = await fetch(`/api/university/${slug}/opportunities`)
      if (res.ok) {
        const data = await res.json()
        setOpportunities(data)
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err)
    }
  }

  const createOpportunity = async () => {
    if (!oppTitle.trim()) return
    setCreatingOpp(true)
    try {
      const res = await fetch(`/api/university/${slug}/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: oppTitle, description: oppDesc, link: oppLink || undefined }),
      })
      if (res.ok) {
        setOppTitle('')
        setOppDesc('')
        setOppLink('')
        setShowOppForm(false)
        await loadOpportunities()
      }
    } catch (err) {
      console.error('Failed to create opportunity:', err)
    } finally {
      setCreatingOpp(false)
    }
  }

  const loadComments = async (studentId: string) => {
    try {
      const res = await fetch(`/api/university/${slug}/comments?studentId=${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setComments((prev) => ({ ...prev, [studentId]: data }))
      }
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }

  const toggleStudent = async (studentId: string) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(studentId)
      if (!comments[studentId]) {
        await loadComments(studentId)
      }
    }
  }

  const submitComment = async (studentId: string) => {
    const text = newComment[studentId]?.trim()
    if (!text) return

    setSubmitting(studentId)
    try {
      const res = await fetch(`/api/university/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, commentText: text }),
      })

      if (res.ok) {
        setNewComment((prev) => ({ ...prev, [studentId]: '' }))
        await loadComments(studentId)
      }
    } catch (err) {
      console.error('Failed to submit comment:', err)
    } finally {
      setSubmitting(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600'
    if (score >= 41) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 71) return 'bg-green-100 dark:bg-green-950'
    if (score >= 41) return 'bg-orange-100 dark:bg-orange-950'
    return 'bg-red-100 dark:bg-red-950'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session?.user?.email || null} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Advisor Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review students, add feedback, and track readiness
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-zinc-500">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {students.filter((s) => s.readinessScore !== null && s.readinessScore >= 60).length}
                  </p>
                  <p className="text-xs text-zinc-500">Interview Ready (60%+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {Object.values(comments).reduce((sum, c) => sum + c.length, 0)}
                  </p>
                  <p className="text-xs text-zinc-500">Comments Given</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Click on a student to view details and add feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No students registered yet</p>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleStudent(student.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">
                          {(student.name || student.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{student.name || student.email}</p>
                          <p className="text-xs text-zinc-500">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {student.readinessScore !== null ? (
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreBg(student.readinessScore)} ${getScoreColor(student.readinessScore)}`}>
                            {student.readinessScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                            Not assessed
                          </span>
                        )}
                        {expandedStudent === student.id ? (
                          <ChevronUp className="h-4 w-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {expandedStudent === student.id && (
                      <div className="border-t px-4 py-4 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
                          <div>
                            <span className="text-zinc-500">Target Role:</span>
                            <p className="font-medium">{student.targetRole || 'Not set'}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Resume:</span>
                            <p className="font-medium">{student.hasResume ? 'Uploaded' : 'Not uploaded'}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Status:</span>
                            <p className="font-medium">{student.isApproved ? 'Active' : 'Pending'}</p>
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Feedback History</p>
                          {comments[student.id]?.length ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {comments[student.id].map((c) => (
                                <div key={c.id} className="p-2 rounded bg-white dark:bg-zinc-800 border text-sm">
                                  <p className="text-zinc-700 dark:text-zinc-300">{c.commentText}</p>
                                  <p className="text-xs text-zinc-400 mt-1">
                                    {new Date(c.createdAt).toLocaleDateString('en-GB')}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">No feedback yet</p>
                          )}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Add feedback for this student..."
                            value={newComment[student.id] || ''}
                            onChange={(e) =>
                              setNewComment((prev) => ({ ...prev, [student.id]: e.target.value }))
                            }
                            rows={2}
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => submitComment(student.id)}
                            disabled={submitting === student.id || !newComment[student.id]?.trim()}
                            className="self-end"
                          >
                            {submitting === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Opportunities
                </CardTitle>
                <CardDescription>Create and manage opportunity notifications for students</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowOppForm(!showOppForm)}
                variant={showOppForm ? 'outline' : 'default'}
              >
                <Plus className="h-4 w-4 mr-1" />
                {showOppForm ? 'Cancel' : 'New Opportunity'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showOppForm && (
              <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/20 space-y-3">
                <Input
                  placeholder="Opportunity title (e.g. Graduate Scheme at Deloitte)"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  disabled={creatingOpp}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={oppDesc}
                  onChange={(e) => setOppDesc(e.target.value)}
                  rows={2}
                  disabled={creatingOpp}
                />
                <Input
                  placeholder="Link (optional, e.g. https://...)"
                  value={oppLink}
                  onChange={(e) => setOppLink(e.target.value)}
                  disabled={creatingOpp}
                />
                <Button
                  onClick={createOpportunity}
                  disabled={creatingOpp || !oppTitle.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {creatingOpp ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send to All Students
                </Button>
              </div>
            )}

            {opportunities.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">No opportunities posted yet</p>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="flex items-start justify-between p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900">
                    <div>
                      <p className="text-sm font-medium">{opp.title}</p>
                      {opp.description && (
                        <p className="text-xs text-zinc-500 mt-1">{opp.description}</p>
                      )}
                      {opp.link && (
                        <a href={opp.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                          {opp.link}
                        </a>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-zinc-500">{new Date(opp.createdAt).toLocaleDateString('en-GB')}</p>
                      <p className="text-xs text-zinc-400 mt-1">Sent to {opp._count.students} students</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
