import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ApplicationBoard } from '@/components/application-board'
import { BackButton } from '@/components/back-button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardHeader } from '@/components/dashboard-header'

export default async function ApplicationsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { dateApplied: 'desc' },
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session.user.email} />
      <BackButton />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your job applications in a Kanban board
          </p>
        </div>

        <ApplicationBoard initialApplications={applications} />
      </main>
    </div>
  )
}
