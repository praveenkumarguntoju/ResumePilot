'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MessageSquare, Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  commentText: string
  createdAt: string
  advisor: {
    name: string
    email: string
  }
}

export default function FeedbackPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComments() {
      try {
        const response = await fetch(`/api/university/${slug}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data)
        }
      } catch (error) {
        console.error('Failed to load comments:', error)
      } finally {
        setLoading(false)
      }
    }
    loadComments()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/u/${slug}/student`}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Advisor Feedback
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review feedback and comments from your advisors
          </p>
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  No feedback yet
                </h3>
                <p className="text-zinc-500">
                  Your advisors haven't provided any feedback yet. Check back later!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{comment.advisor.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {comment.advisor.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-zinc-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {comment.commentText}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
