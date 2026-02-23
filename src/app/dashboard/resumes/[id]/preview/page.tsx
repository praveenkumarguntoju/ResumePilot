import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'

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
      <DashboardHeader userEmail={session.user.email} />
      <BackButton />

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
