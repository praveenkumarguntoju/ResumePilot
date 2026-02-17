import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ResumeUpload } from '@/components/resume-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Briefcase, FileEdit, Globe } from 'lucide-react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard-header'
import { ResumeCard } from '@/components/resume-card'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

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
      <DashboardHeader userEmail={session.user.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your resumes and job applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ResumeCard hasResume={hasResume} resumeText={profile?.rawResumeText || undefined} />

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
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
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
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 max-h-[300px] overflow-y-auto mb-4">
                      <pre className="whitespace-pre-wrap text-xs font-mono text-zinc-700 dark:text-zinc-300">{profile.rawResumeText?.trim().slice(0, 500)}...</pre>
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
