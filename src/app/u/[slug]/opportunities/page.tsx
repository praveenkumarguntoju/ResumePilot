'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Bell, Calendar, Briefcase, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Opportunity {
  id: string
  opportunity: {
    title: string
    description: string
    link?: string
    type?: 'job' | 'internship' | 'event' | 'workshop'
    location?: string
    deadline?: string
  }
  createdAt: string
  isRead: boolean
}

export default function OpportunitiesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const response = await fetch(`/api/university/${slug}/opportunities/student`)
        if (response.ok) {
          const data = await response.json()
          setOpportunities(data)
        }
      } catch (error) {
        console.error('Failed to load opportunities:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOpportunities()
  }, [slug])

  const markAsRead = async (opportunityId: string) => {
    try {
      await fetch(`/api/university/${slug}/opportunities/student/${opportunityId}/read`, {
        method: 'POST'
      })
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId ? { ...opp, isRead: true } : opp
        )
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'internship': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'workshop': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'job': return <Briefcase className="h-4 w-4" />
      case 'internship': return <Briefcase className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'workshop': return <Calendar className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

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

  const unreadCount = opportunities.filter(opp => !opp.isRead).length

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
            <Bell className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Opportunities
            </h1>
            {unreadCount > 0 && (
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-sm font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Job opportunities, internships, events, and workshops from your university
          </p>
        </div>

        {/* Opportunities List */}
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  No opportunities yet
                </h3>
                <p className="text-zinc-500">
                  Your advisors haven't posted any opportunities yet. Check back later!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card 
                key={opportunity.id} 
                className={`hover:shadow-md transition-shadow ${
                  !opportunity.isRead ? 'border-l-4 border-l-yellow-400 dark:border-l-yellow-600' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.opportunity.type)}`}>
                          {getTypeIcon(opportunity.opportunity.type)}
                          {opportunity.opportunity.type ? opportunity.opportunity.type.charAt(0).toUpperCase() + opportunity.opportunity.type.slice(1) : 'Opportunity'}
                        </span>
                        {!opportunity.isRead && (
                          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-1">{opportunity.opportunity.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        {opportunity.opportunity.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opportunity.opportunity.location}
                          </div>
                        )}
                        {opportunity.opportunity.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {new Date(opportunity.opportunity.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {opportunity.opportunity.link && (
                      <a
                        href={opportunity.opportunity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                    {opportunity.opportunity.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      Posted {new Date(opportunity.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    {!opportunity.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(opportunity.id)}
                      >
                        Mark as read
                      </Button>
                    )}
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
