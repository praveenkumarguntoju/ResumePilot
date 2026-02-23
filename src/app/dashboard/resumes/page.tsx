import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Globe } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'

export default async function ResumesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { publicProfiles: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session.user.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Optimized Resumes   <BackButton /></h2>
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
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(resume.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Globe className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {resume._count?.publicProfiles || 0}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {resume._count?.publicProfiles === 1 ? 'profile' : 'profiles'}
                        </span>
                      </div>
                    </div>
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
