import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard-header'
import { PublicProfilesTable } from '@/components/public-profiles-table'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PublicProfilesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const publicProfiles = await prisma.publicProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session.user.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-3xl font-bold mb-2">Public Profiles</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and share your AI-powered resume profiles
          </p>
        </div>

        <PublicProfilesTable profiles={publicProfiles} />
      </main>
    </div>
  )
}
