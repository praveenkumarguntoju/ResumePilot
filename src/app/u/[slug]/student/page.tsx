'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Target, MessageSquare, Briefcase, Bell, FileText, TrendingUp, ShieldCheck, Sparkles, Globe } from 'lucide-react'
import Link from 'next/link'
import { ResumeModal } from '@/components/resume-modal'

interface ReadinessData {
  id: string
  overallScore: number
  targetRole: string
  resumeQualityScore: number
  skillMatchScore: number
  experienceScore: number
  marketDemandScore: number
  suggestions: string | null
  createdAt: string
}

interface Comment {
  id: string
  commentText: string
  createdAt: string
  advisor: { name: string | null; email: string }
}

interface OpportunityNotif {
  id: string
  isRead: boolean
  opportunity: { title: string; description: string | null; link: string | null }
}

interface ResumeItem {
  id: string
  jobTitle: string
  company: string
  atsScore: number | null
  keywordMatch: number | null
  createdAt: string
}

interface ProfileData {
  id: string
  fullName?: string
  email?: string
  phone?: string
  rawResumeText: string | null
  updatedAt: string
  profileImage?: string | null
}

export default function StudentDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [readiness, setReadiness] = useState<ReadinessData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [opportunities, setOpportunities] = useState<OpportunityNotif[]>([])
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [readinessRes, commentsRes, oppsRes, resumesRes, profileRes] = await Promise.all([
          fetch('/api/interview-readiness'),
          fetch(`/api/university/${slug}/comments`),
          fetch(`/api/university/${slug}/opportunities/student`),
          fetch('/api/resume/list'),
          fetch('/api/profile/me'),
        ])

        if (readinessRes.ok) {
          const data = await readinessRes.json()
          if (data.length > 0) setReadiness(data[0])
        }
        if (commentsRes.ok) {
          const data = await commentsRes.json()
          setComments(data)
        }
        if (oppsRes.ok) {
          const data = await oppsRes.json()
          setOpportunities(data)
        }
        if (resumesRes.ok) {
          const data = await resumesRes.json()
          setResumes(data)
        }
        if (profileRes.ok) {
          const data = await profileRes.json()
          if (data?.rawResumeText) setProfile(data)
        }
      } catch (err) {
        console.error('Failed to load student data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600 dark:text-green-400'
    if (score >= 41) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const unreadCount = opportunities.filter((o) => !o.isRead).length

  const getScoreBadgeColor = (score: number) => {
    if (score >= 71) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
    if (score >= 41) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Excellent'
    if (score >= 41) return 'Needs Work'
    return 'Low'
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session?.user?.email || null} profileImage={profile?.profileImage} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Student Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Readiness Score */}
          <Link href="/dashboard/readiness">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interview Readiness</CardTitle>
                <Target className="h-5 w-5 text-cyan-600" />
              </CardHeader>
              <CardContent>
                {readiness ? (
                  <>
                    <p className={`text-3xl font-bold ${getScoreColor(readiness.overallScore)}`}>
                      {readiness.overallScore}%
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Target: {readiness.targetRole}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-zinc-400">Not assessed</p>
                    <p className="text-xs text-zinc-500 mt-1">Click to check your score</p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Advisor Comments */}
          <Link href={`/u/${slug}/feedback`}>
            <Card className="cursor-pointer hover:shadow-xl transition-all hover:border-blue-400 dark:hover:border-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Advisor Feedback</CardTitle>
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{comments.length}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {comments.length === 0 ? 'No feedback yet' : 'comments from advisors'}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Opportunities */}
          <Link href={`/u/${slug}/opportunities`}>
            <Card className="cursor-pointer hover:shadow-xl transition-all hover:border-yellow-400 dark:hover:border-yellow-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                <Bell className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{opportunities.length}</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    {unreadCount} new
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions — ordered by student workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <Link href="/dashboard/create">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-blue-400 dark:border-blue-600 relative overflow-hidden h-full">
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full mb-3">
                      ✨ AI POWERED
                    </span>
                    <p className="font-semibold text-base">Create Resume</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2">Start from scratch</p>
                    <p className="text-xs text-zinc-500 mt-1">Perfect for students &amp; graduates</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 ml-3">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/optimize">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-amber-400 dark:border-amber-600 relative overflow-hidden h-full">
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full mb-3">
                      ✨ AI POWERED
                    </span>
                    <p className="font-semibold text-base">Optimize Resume</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-2">Tailor for a job</p>
                    <p className="text-xs text-zinc-500 mt-1">Match to specific job postings</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 ml-3">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/review">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-rose-400 dark:border-rose-600 relative overflow-hidden h-full">
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 rounded-full mb-3">
                      ✨ NEW
                    </span>
                    <p className="font-semibold text-base">Resume Review</p>
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mt-2">Get AI feedback</p>
                    <p className="text-xs text-zinc-500 mt-1">Detailed resume critique</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0 ml-3">
                    <FileText className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/readiness">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-cyan-400 dark:border-cyan-600 relative overflow-hidden h-full">
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-500 px-3 py-1 rounded-full mb-3">
                      ✨ AI POWERED
                    </span>
                    <p className="font-semibold text-base">Readiness Score</p>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-2">Check your score</p>
                    <p className="text-xs text-zinc-500 mt-1">AI-powered assessment</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center shrink-0 ml-3">
                    <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/u/${slug}/consent`}>
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-green-400 dark:border-green-600 relative overflow-hidden h-full">
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full mb-3">
                      🔒 GDPR
                    </span>
                    <p className="font-semibold text-base">Data Consent</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">Manage preferences</p>
                    <p className="text-xs text-zinc-500 mt-1">Privacy &amp; data sharing</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0 ml-3">
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* My Resume (from Create wizard) */}
        {profile && profile.rawResumeText && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  My Resume
                </CardTitle>
                <Link href="/dashboard/create" className="text-sm text-blue-600 hover:underline">
                  Edit resume →
                </Link>
              </div>
              <CardDescription>
                Last updated {new Date(profile.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <ResumeModal 
                  resumeText={profile.rawResumeText} 
                  contactInfo={{
                    fullName: profile.fullName || undefined,
                    email: profile.email || undefined,
                    phone: profile.phone || undefined
                  }} 
                />
                <Link href="/dashboard/optimize">
                  <button className="text-sm px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    Optimize for a job
                  </button>
                </Link>
                <Link href="/dashboard/review">
                  <button className="text-sm px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                    Get AI review
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimized Resumes */}
        {resumes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  My Resumes
                </CardTitle>
                <Link href="/dashboard/resumes" className="text-sm text-blue-600 hover:underline">
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumes.slice(0, 6).map((resume, index) => (
                  <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`}>
                    <div className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                      index === 0
                        ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{resume.jobTitle}</p>
                          <p className="text-xs text-zinc-500 truncate">{resume.company}</p>
                        </div>
                        {index === 0 && (
                          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500 text-white rounded-full shrink-0 ml-2">Latest</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500">ATS</span>
                          <p className={`font-semibold ${
                            (resume.atsScore || 0) >= 71 ? 'text-green-600' :
                            (resume.atsScore || 0) >= 41 ? 'text-orange-600' : 'text-red-600'
                          }`}>{resume.atsScore || 0}%</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Keywords</span>
                          <p className="font-semibold">{resume.keywordMatch || 0}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">
                        {new Date(resume.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Comments */}
        {comments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Recent Advisor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comments.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{comment.commentText}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      — {comment.advisor.name || comment.advisor.email} · {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
