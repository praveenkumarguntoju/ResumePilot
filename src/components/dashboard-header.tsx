import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardHeaderProps {
  userEmail?: string | null
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">CareerPilot</h1>
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
            await signOut()
          }}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
