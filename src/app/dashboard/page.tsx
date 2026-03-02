import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ResumeUpload } from '@/components/resume-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Briefcase, FileEdit, Globe, GraduationCap, Sparkles, Target, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard-header'
import { ResumeCard } from '@/components/resume-card'
import { MarkdownRenderer } from '@/components/markdown-renderer'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const [profile, currentUser] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImage: true },
    }),
  ])

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const resumeCount = resumes.length

  const applicationCount = await prisma.application.count({
    where: { userId: session.user.id },
  })

  const profileCount = await prisma.publicProfile.count({
    where: { userId: session.user.id },
  })

  const hasResume = !!profile?.rawResumeText

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session.user.email} profileImage={currentUser?.profileImage} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your resumes and job applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <ResumeCard hasResume={hasResume} resumeText={profile?.rawResumeText || undefined} />

          <Link href="/dashboard/create">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-blue-500 dark:border-blue-400 shadow-blue-500/50 dark:shadow-blue-400/50 shadow-lg animate-pulse-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Create Resume</CardTitle>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">Start from scratch</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Perfect for students & graduates
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI POWERED
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/resumes">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Optimized Resumes</CardTitle>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <FileEdit className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{resumeCount}</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Tailored for specific jobs
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
            </Card>
          </Link>

          <Link href="/dashboard/applications">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Applications</CardTitle>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{applicationCount}</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Jobs tracked
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
            </Card>
          </Link>

          <Link href="/dashboard/profiles">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-orange-500 dark:border-orange-400 shadow-orange-500/50 dark:shadow-orange-400/50 shadow-lg animate-pulse-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Public Profiles</CardTitle>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{profileCount}</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Shareable profiles
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI POWERED
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/readiness">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-cyan-500 dark:border-cyan-400 shadow-cyan-500/50 dark:shadow-cyan-400/50 shadow-lg animate-pulse-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Interview Readiness</CardTitle>
                <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center">
                  <Target className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Check your score</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  AI-powered readiness assessment
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 dark:bg-cyan-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                NEW
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/review">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-rose-500 dark:border-rose-400 shadow-rose-500/50 dark:shadow-rose-400/50 shadow-lg animate-pulse-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resume Review</CardTitle>
                <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">Get AI feedback</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Detailed resume critique
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                NEW
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Upload Resume</h3>
            <ResumeUpload />
            {hasResume && (
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Resume</CardTitle>
                    <CardDescription>
                      Your original resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-h-[600px] overflow-y-auto mb-4 border border-zinc-200 dark:border-zinc-800">
                      <MarkdownRenderer content={profile.rawResumeText?.trim() || ''} />
                    </div>
                    <Link href="/dashboard/optimize">
                      <Button className="w-full">
                        Optimize Resume
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Optimize Resume</CardTitle>
                  <CardDescription>
                    Tailor your resume for a specific job posting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/optimize">
                    <Button className="w-full" disabled={!hasResume}>
                      {hasResume ? 'Start Optimizing' : 'Upload Resume First'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Tracker</CardTitle>
                  <CardDescription>
                    Manage your job applications in one place
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/applications">
                    <Button className="w-full" variant="outline">
                      View Applications
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
