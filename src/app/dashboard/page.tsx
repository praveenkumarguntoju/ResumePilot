import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ResumeUpload } from '@/components/resume-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Briefcase, FileEdit, Globe } from 'lucide-react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard-header'

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resume</CardTitle>
              <FileText className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hasResume ? 'Uploaded' : 'None'}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {hasResume ? 'Ready to optimize' : 'Upload your resume to get started'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimized Resumes</CardTitle>
              <FileEdit className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumeCount}</div>
              <p className="text-xs text-zinc-500 mt-1">
                Tailored for specific jobs
              </p>
            </CardContent>
          </Card>

          <Link href="/dashboard/applications">
            <Card className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applicationCount}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  Jobs tracked
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/profiles">
            <Card className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public Profiles</CardTitle>
                <Globe className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileCount}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  Shareable profiles
                </p>
              </CardContent>
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

        {resumes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Optimized Resumes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume: any, index: number) => (
                <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`}>
                  <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                    index === 0 
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-950' 
                      : 'hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-1">
                            {resume.jobTitle}
                          </CardTitle>
                          <CardDescription className="line-clamp-1">
                            {resume.company}
                          </CardDescription>
                        </div>
                        {index === 0 && (
                          <span className="text-xs font-semibold px-2 py-1 bg-blue-500 text-white rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">ATS Score</span>
                            <p className="font-semibold">{resume.atsScore}%</p>
                          </div>
                          <div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Keywords</span>
                            <p className="font-semibold">{resume.keywordMatch}%</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        {new Date(resume.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
