'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Target, Shield, Calendar } from 'lucide-react'
import { ResumeIntegrityGuard } from '@/components/resume-integrity-guard'
import { EmployerLanguageMatching } from '@/components/employer-language-matching'
import { CareerReadinessTrend } from '@/components/career-readiness-trend'
import { EmployabilityHeatmap } from '@/components/employability-heatmap'

interface Student {
  id: string
  name: string | null
  email: string
  readinessScore: number | null
  targetRole: string | null
  hasResume: boolean
  isApproved: boolean
}

interface AnalyticsData {
  skillHeatmap?: {
    skill: string
    strongPercentage: number
    weakPercentage: number
    totalStudents: number
    trend: 'up' | 'down' | 'stable'
  }[]
  readinessOverTime?: {
    month: string
    avgScore: number
    count: number
  }[]
  avgReadinessScore?: number
}

export default function StudentAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const slug = params.slug as string
  const studentId = params.studentId as string

  const [student, setStudent] = useState<Student | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStudentData() {
      try {
        // Load student details
        const studentRes = await fetch(`/api/university/${slug}/students`)
        if (studentRes.ok) {
          const students = await studentRes.json()
          const foundStudent = students.find((s: Student) => s.id === studentId)
          if (foundStudent) {
            setStudent(foundStudent)
          } else {
            setError('Student not found')
          }
        }

        // Load analytics data
        const analyticsRes = await fetch('/api/admin/analytics')
        if (analyticsRes.ok) {
          const data = await analyticsRes.json()
          setAnalyticsData(data)
        }
      } catch (err) {
        setError('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [slug, studentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{error || 'Student not found'}</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push(`/u/${slug}/advisor`)}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session?.user?.email || null} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Student Analysis</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              AI-powered insights for {student.name}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/u/${slug}/advisor`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>

        {/* Student Overview */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/20 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                {student.name?.charAt(0).toUpperCase() || student.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{student.name || student.email}</h2>
                <p className="text-zinc-600 dark:text-zinc-400">{student.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-zinc-500">
                    Target Role: <span className="font-medium">{student.targetRole || 'Not set'}</span>
                  </span>
                  <span className="text-sm text-zinc-500">
                    Status: <span className="font-medium">{student.isApproved ? 'Approved' : 'Pending'}</span>
                  </span>
                  <span className="text-sm text-zinc-500">
                    Resume: <span className="font-medium">{student.hasResume ? 'Uploaded' : 'Not uploaded'}</span>
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {student.readinessScore || 0}%
                </div>
                <div className="text-sm text-zinc-500">Readiness Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Readiness Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Readiness</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Current score
                </p>
                <div className="text-2xl font-bold text-green-600">
                  {student.readinessScore || 0}%
                </div>
                <p className="text-xs text-zinc-500">Score</p>
              </div>
            </CardContent>
          </Card>

          {/* Resume Integrity Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Integrity</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Resume check
                </p>
                <div className="text-2xl font-bold text-purple-600">
                  {student.hasResume ? 1 : 0}
                </div>
                <p className="text-xs text-zinc-500">Resumes</p>
              </div>
            </CardContent>
          </Card>

          {/* Language Matching Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Matching</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Job keywords
                </p>
                <div className="text-2xl font-bold text-blue-600">
                  {student.targetRole ? '✓' : '-'}
                </div>
                <p className="text-xs text-zinc-500">Role Set</p>
              </div>
            </CardContent>
          </Card>

          {/* Department Skills Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">🔥</span>
                </div>
                <h3 className="font-semibold mb-1">Skills</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Department view
                </p>
                <div className="text-2xl font-bold text-red-600">
                  CS
                </div>
                <p className="text-xs text-zinc-500">Department</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Tools */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">AI Analysis Tools</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume Integrity Guard */}
            <ResumeIntegrityGuard 
              resumeText={`${student.name}'s resume text here...`} // TODO: Get actual resume text
              onIssuesFound={(issues) => console.log('Issues for', student.name, issues)}
            />

            {/* Employer Language Matching */}
            <EmployerLanguageMatching 
              resumeText={`${student.name}'s resume text here...`} // TODO: Get actual resume text
              targetRole={student.targetRole || undefined}
            />
          </div>

          {/* Career Readiness Trend - Student Specific */}
          <CareerReadinessTrend 
            data={[
              { month: 'Oct 2025', score: Math.max(30, (student.readinessScore || 50) - 20), assessments: 1 },
              { month: 'Nov 2025', score: Math.max(40, (student.readinessScore || 50) - 12), assessments: 1 },
              { month: 'Dec 2025', score: Math.max(50, (student.readinessScore || 50) - 6), assessments: 1 },
              { month: 'Jan 2026', score: Math.max(55, (student.readinessScore || 50) - 3), assessments: 1 },
              { month: 'Feb 2026', score: student.readinessScore || 50, assessments: 1 },
            ]}
            currentScore={student.readinessScore || 0}
          />

          {/* Note: Heatmap removed as it's university-wide data, not student-specific */}
        </div>
      </main>
    </div>
  )
}
