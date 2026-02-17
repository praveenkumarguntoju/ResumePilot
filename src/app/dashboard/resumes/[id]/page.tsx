import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { DownloadButtons } from '@/components/download-buttons'
import { CoverLetterGenerator } from '@/components/cover-letter-generator'
import { ReoptimizeButton } from '@/components/reoptimize-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { CreatePublicProfile } from '@/components/create-public-profile'

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!resume) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{resume.jobTitle}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{resume.company}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
              <Target className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resume.atsScore || 0}%</div>
              <p className="text-xs text-zinc-500 mt-1">
                {(resume.atsScore || 0) >= 80 ? 'Excellent match!' : (resume.atsScore || 0) >= 60 ? 'Good match' : 'Needs improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keyword Match</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resume.keywordMatch?.toFixed(0) || 0}%</div>
              <p className="text-xs text-zinc-500 mt-1">
                Keywords from job description
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <FileText className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Ready</div>
              <p className="text-xs text-zinc-500 mt-1">
                Download and apply
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimized Resume</CardTitle>
                <CardDescription>
                  Tailored for this specific job posting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {resume.tailoredResumeText}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <DownloadButtons resumeId={resume.id} />

            <Card>
              <CardHeader>
                <CardTitle>Not satisfied?</CardTitle>
                <CardDescription>
                  Generate a new version with different phrasing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReoptimizeButton resumeId={resume.id} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Original posting used for optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 max-h-[300px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {resume.jobDescription}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <CoverLetterGenerator resumeId={resume.id} />

            <CreatePublicProfile resumeId={resume.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
