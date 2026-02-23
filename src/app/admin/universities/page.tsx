'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Building2, Plus, Users, CheckCircle2, XCircle, ExternalLink, Copy } from 'lucide-react'

interface University {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  _count: { users: number }
}

export default function UniversityManagementPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Form fields
  const [uniName, setUniName] = useState('')
  const [uniSlug, setUniSlug] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        if (!session?.user || session.user.role !== 'superadmin') {
          router.push('/dashboard')
          return
        }
        setUserEmail(session.user.email)
        await loadUniversities()
      } catch {
        router.push('/dashboard')
      }
    }
    init()
  }, [router])

  async function loadUniversities() {
    try {
      const res = await fetch('/api/admin/universities')
      if (res.ok) {
        const data = await res.json()
        setUniversities(data)
      }
    } catch (err) {
      console.error('Failed to load universities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setUniName(name)
    setUniSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    )
  }

  const createUniversity = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uniName,
          slug: uniSlug,
          adminName,
          adminEmail,
          adminPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create university')
      }

      setSuccess(`University "${uniName}" created! Admin login: ${adminEmail}`)
      setUniName('')
      setUniSlug('')
      setAdminName('')
      setAdminEmail('')
      setAdminPassword('')
      setShowForm(false)
      await loadUniversities()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create university')
    } finally {
      setCreating(false)
    }
  }

  const toggleUniversity = async (id: string, isActive: boolean) => {
    setUpdating(id)
    try {
      await fetch('/api/admin/universities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      })
      await loadUniversities()
    } catch (err) {
      console.error('Failed to update university:', err)
    } finally {
      setUpdating(null)
    }
  }

  const copyLoginUrl = (slug: string) => {
    const url = `${window.location.origin}/u/${slug}/login`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={userEmail} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">University Management</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Create and manage university tenants on ResumePilot
            </p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add University'}
          </Button>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 inline mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            <XCircle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <Card className="mb-8 border-2 border-dashed border-blue-300 dark:border-blue-700">
            <CardHeader>
              <CardTitle>Create New University</CardTitle>
              <CardDescription>
                This will create the university and its first admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUniversity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">University Name</label>
                    <Input
                      placeholder="e.g. University of Buckingham"
                      value={uniName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      disabled={creating}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">URL Slug</label>
                    <Input
                      placeholder="e.g. buckingham"
                      value={uniSlug}
                      onChange={(e) => setUniSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                      disabled={creating}
                      className="mt-1"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Login URL: /u/<strong>{uniSlug || '...'}</strong>/login
                    </p>
                  </div>
                </div>

                <hr className="my-2" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">University Admin Account</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Admin Name</label>
                    <Input
                      placeholder="Jane Smith"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      disabled={creating}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Admin Email</label>
                    <Input
                      type="email"
                      placeholder="admin@buckingham.ac.uk"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={creating}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Admin Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={creating}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={creating} className="w-full md:w-auto">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create University
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{universities.length}</p>
                  <p className="text-xs text-zinc-500">Total Universities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{universities.filter((u) => u.isActive).length}</p>
                  <p className="text-xs text-zinc-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{universities.reduce((sum, u) => sum + u._count.users, 0)}</p>
                  <p className="text-xs text-zinc-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* University List */}
        <Card>
          <CardHeader>
            <CardTitle>Universities</CardTitle>
          </CardHeader>
          <CardContent>
            {universities.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">
                No universities yet. Click &quot;Add University&quot; to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {universities.map((uni) => (
                  <div
                    key={uni.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      uni.isActive
                        ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{uni.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-zinc-500">/u/{uni.slug}</span>
                          <span className="text-xs text-zinc-400">·</span>
                          <span className="text-xs text-zinc-500">{uni._count.users} users</span>
                          <span className="text-xs text-zinc-400">·</span>
                          <span className={`text-xs font-medium ${uni.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {uni.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyLoginUrl(uni.slug)}
                        title="Copy login URL"
                      >
                        {copiedSlug === uni.slug ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <a href={`/u/${uni.slug}/login`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" title="Open login page">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      {uni.isActive ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => toggleUniversity(uni.id, false)}
                          disabled={updating === uni.id}
                        >
                          {updating === uni.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Disable'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                          onClick={() => toggleUniversity(uni.id, true)}
                          disabled={updating === uni.id}
                        >
                          {updating === uni.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enable'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
