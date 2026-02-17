import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
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
          <Link 
            href={`/dashboard/resumes/${id}`} 
            className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume
          </Link>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">{resume.jobTitle}</span> at {resume.company}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={`/api/resume/preview?id=${id}`}
            className="w-full h-[calc(100vh-12rem)] border-0"
            title="Resume Preview"
          />
        </div>
      </main>
    </div>
  )
}
