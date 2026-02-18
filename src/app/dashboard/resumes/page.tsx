import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ResumesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-zinc-900 dark:text-zinc-100 border border-transparent dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Optimized Resumes</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            View all your tailored resumes for specific jobs
          </p>
        </div>

        {resumes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                  No optimized resumes yet
                </p>
                <Link href="/dashboard/optimize">
                  <Button>Create Your First Optimized Resume</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </main>
    </div>
  )
}
