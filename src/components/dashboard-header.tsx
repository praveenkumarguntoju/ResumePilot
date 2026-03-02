'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'
import Link from 'next/link'
import { User } from 'lucide-react'

interface DashboardHeaderProps {
  userEmail?: string | null
  profileImage?: string | null
}

export function DashboardHeader({ userEmail, profileImage: propImage }: DashboardHeaderProps) {
  const [profileImage, setProfileImage] = useState<string | null>(propImage || null)

  useEffect(() => {
    if (propImage) {
      setProfileImage(propImage)
      return
    }
    async function fetchImage() {
      try {
        const res = await fetch('/api/profile/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.profileImage) setProfileImage(data.profileImage)
        }
      } catch {}
    }
    fetchImage()
  }, [propImage])

  const handleSignOut = async () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/auth/signout'
    
    const csrfRes = await fetch('/api/auth/csrf')
    const { csrfToken } = await csrfRes.json()
    
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'csrfToken'
    input.value = csrfToken
    form.appendChild(input)
    
    document.body.appendChild(form)
    form.submit()
  }

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
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border border-zinc-300 dark:border-zinc-600">
                <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </div>
            )}
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
