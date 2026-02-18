import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'
// New commit

interface DashboardHeaderProps {
  userEmail?: string | null
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src="/images/resume-pilot.png" 
            alt="ResumePilot Logo"
            className="rounded-lg"
            width={250} 
            height={250}
          />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {userEmail && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {userEmail}
            </span>
          )}
          <form action={async () => {
            'use server'
            const { signOut } = await import('@/auth')
            await signOut({ redirectTo: 'https://www.resumepilot.co.uk/' })
          }}>
            <Button type="submit" variant="outline" size="sm" className="border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
