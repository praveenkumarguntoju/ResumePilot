'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Users, UserCheck, UserX, Shield, CheckCircle2, XCircle, Target, BarChart3, Bell, Plus, Send } from 'lucide-react'

interface UniversityUser {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  isApproved: boolean
  createdAt: string
}

interface Opportunity {
  id: string
  title: string
  description: string | null
  link: string | null
  createdAt: string
  _count: { students: number }
}

export default function UniversityAdminPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [users, setUsers] = useState<UniversityUser[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showOppForm, setShowOppForm] = useState(false)
  const [oppTitle, setOppTitle] = useState('')
  const [oppDesc, setOppDesc] = useState('')
  const [oppLink, setOppLink] = useState('')
  const [creatingOpp, setCreatingOpp] = useState(false)

  useEffect(() => {
    loadUsers()
    loadOpportunities()
  }, [slug])

  async function loadUsers() {
    try {
      const res = await fetch(`/api/university/${slug}/users`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: Record<string, unknown>) => {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/university/${slug}/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      })
      if (res.ok) {
        await loadUsers()
      }
    } catch (err) {
      console.error('Failed to update user:', err)
    } finally {
      setUpdating(null)
    }
  }

  async function loadOpportunities() {
    try {
      const res = await fetch(`/api/university/${slug}/opportunities`)
      if (res.ok) {
        const data = await res.json()
        setOpportunities(data)
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err)
    }
  }

  const createOpportunity = async () => {
    if (!oppTitle.trim()) return
    setCreatingOpp(true)
    try {
      const res = await fetch(`/api/university/${slug}/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: oppTitle, description: oppDesc, link: oppLink || undefined }),
      })
      if (res.ok) {
        setOppTitle('')
        setOppDesc('')
        setOppLink('')
        setShowOppForm(false)
        await loadOpportunities()
      }
    } catch (err) {
      console.error('Failed to create opportunity:', err)
    } finally {
      setCreatingOpp(false)
    }
  }

  const universityName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const students = users.filter((u) => u.role === 'student')
  const advisors = users.filter((u) => u.role === 'advisor')
  const pendingApproval = users.filter((u) => !u.isApproved)
  const activeUsers = users.filter((u) => u.isActive && u.isApproved)

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={session?.user?.email || null} />

      <div className="container mx-auto px-4 py-4">
        <BackButton />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">{universityName} Admin</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage users, approvals, and university settings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-zinc-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-zinc-500">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{advisors.length}</p>
                  <p className="text-xs text-zinc-500">Advisors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UserX className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingApproval.length}</p>
                  <p className="text-xs text-zinc-500">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        {pendingApproval.length > 0 && (
          <Card className="mb-8 border-2 border-orange-300 dark:border-orange-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <UserCheck className="h-5 w-5" />
                Pending Approvals ({pendingApproval.length})
              </CardTitle>
              <CardDescription>These users are waiting for your approval to access the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApproval.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                    <div>
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-xs text-zinc-500">{user.email} · {user.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateUser(user.id, { isApproved: true })}
                        disabled={updating === user.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateUser(user.id, { isActive: false })}
                        disabled={updating === user.id}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>Manage roles and access for all university users</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No users registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-zinc-500">Name</th>
                      <th className="pb-3 font-medium text-zinc-500">Email</th>
                      <th className="pb-3 font-medium text-zinc-500">Role</th>
                      <th className="pb-3 font-medium text-zinc-500">Status</th>
                      <th className="pb-3 font-medium text-zinc-500">Joined</th>
                      <th className="pb-3 font-medium text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3">{user.name || '—'}</td>
                        <td className="py-3 text-zinc-500">{user.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : user.role === 'advisor'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          {!user.isActive ? (
                            <span className="text-xs text-red-600">Disabled</span>
                          ) : !user.isApproved ? (
                            <span className="text-xs text-orange-600">Pending</span>
                          ) : (
                            <span className="text-xs text-green-600">Active</span>
                          )}
                        </td>
                        <td className="py-3 text-zinc-500">
                          {new Date(user.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2 items-center">
                            {user.id !== session?.user?.id && (
                              <select
                                className="text-xs border rounded px-2 py-1 bg-white dark:bg-zinc-800 dark:border-zinc-600"
                                value={user.role}
                                onChange={(e) => updateUser(user.id, { role: e.target.value })}
                                disabled={updating === user.id}
                              >
                                <option value="student">student</option>
                                <option value="advisor">advisor</option>
                                <option value="admin">admin</option>
                              </select>
                            )}
                            {!user.isApproved && user.isActive && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-green-600"
                                onClick={() => updateUser(user.id, { isApproved: true })}
                                disabled={updating === user.id}
                              >
                                Approve
                              </Button>
                            )}
                            {user.isActive ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-red-600"
                                onClick={() => updateUser(user.id, { isActive: false })}
                                disabled={updating === user.id || user.id === session?.user?.id}
                              >
                                Disable
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-green-600"
                                onClick={() => updateUser(user.id, { isActive: true, isApproved: true })}
                                disabled={updating === user.id}
                              >
                                Enable
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Opportunities */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Opportunities
                </CardTitle>
                <CardDescription>Create and manage opportunity notifications for students</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowOppForm(!showOppForm)}
                variant={showOppForm ? 'outline' : 'default'}
              >
                <Plus className="h-4 w-4 mr-1" />
                {showOppForm ? 'Cancel' : 'New Opportunity'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showOppForm && (
              <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/20 space-y-3">
                <Input
                  placeholder="Opportunity title (e.g. Graduate Scheme at Deloitte)"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  disabled={creatingOpp}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={oppDesc}
                  onChange={(e) => setOppDesc(e.target.value)}
                  rows={2}
                  disabled={creatingOpp}
                />
                <Input
                  placeholder="Link (optional, e.g. https://...)"
                  value={oppLink}
                  onChange={(e) => setOppLink(e.target.value)}
                  disabled={creatingOpp}
                />
                <Button
                  onClick={createOpportunity}
                  disabled={creatingOpp || !oppTitle.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {creatingOpp ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send to All Students
                </Button>
              </div>
            )}

            {opportunities.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">No opportunities posted yet</p>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="flex items-start justify-between p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900">
                    <div>
                      <p className="text-sm font-medium">{opp.title}</p>
                      {opp.description && (
                        <p className="text-xs text-zinc-500 mt-1">{opp.description}</p>
                      )}
                      {opp.link && (
                        <a href={opp.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                          {opp.link}
                        </a>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-zinc-500">{new Date(opp.createdAt).toLocaleDateString('en-GB')}</p>
                      <p className="text-xs text-zinc-400 mt-1">Sent to {opp._count.students} students</p>
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
