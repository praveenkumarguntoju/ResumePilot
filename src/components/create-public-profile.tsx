'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Globe, Copy, Check } from 'lucide-react'

export function CreatePublicProfile({ resumeId }: { resumeId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          name,
          headline,
          location,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to create profile'
        throw new Error(errorMsg)
      }

      const fullUrl = `${window.location.origin}${data.url}`
      setProfileUrl(fullUrl)
    } catch (err) {
      console.error('Create profile error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create public profile')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (profileUrl) {
    return (
      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Globe className="h-5 w-5" />
            Public Profile Created!
          </CardTitle>
          <CardDescription>
            Share this link with recruiters and employers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={profileUrl}
              readOnly
              className="bg-white dark:bg-zinc-900"
            />
            <Button onClick={copyToClipboard} variant="outline">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Button
            onClick={() => window.open(profileUrl, '_blank')}
            className="w-full"
          >
            View Public Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Create Public Profile
        </CardTitle>
        <CardDescription>
          Share your resume with recruiters via AI-powered chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium">
              Professional Headline
            </label>
            <Input
              id="headline"
              placeholder="Full Stack Developer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="location"
              placeholder="London, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Create Public Profile
              </>
            )}
          </Button>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Recruiters will be able to view your resume and ask questions via AI chat
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
