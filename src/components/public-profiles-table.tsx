'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, ExternalLink, Trash2, Check } from 'lucide-react'

interface PublicProfile {
  id: string
  slug: string
  name: string
  headline: string
  createdAt: Date
  isActive: boolean
}

export function PublicProfilesTable({ profiles }: { profiles: PublicProfile[] }) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const openInNewTab = (slug: string) => {
    window.open(`/p/${slug}`, '_blank')
  }

  const deleteProfile = async (id: string, slug: string) => {
    if (!confirm('Are you sure you want to delete this public profile?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete profile')
      }
    } catch (error) {
      alert('Error deleting profile')
    } finally {
      setDeletingId(null)
    }
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-zinc-500 dark:text-zinc-400">
          <p>No public profiles yet. Create one from your optimized resumes!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Public Profiles</CardTitle>
        <CardDescription>
          Manage and share your AI-powered resume profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Title</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Created</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <td className="py-3 px-4 text-sm font-medium">{profile.name}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {profile.headline}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                      }`}
                    >
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyLink(profile.slug)}
                        title="Copy link"
                      >
                        {copiedSlug === profile.slug ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openInNewTab(profile.slug)}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteProfile(profile.id, profile.slug)}
                        disabled={deletingId === profile.id}
                        title="Delete profile"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
