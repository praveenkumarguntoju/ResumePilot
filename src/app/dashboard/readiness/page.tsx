'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'
import { InterviewReadinessScore } from '@/components/interview-readiness-score'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Clock } from 'lucide-react'

interface ReadinessHistory {
  id: string
  targetRole: string
  overallScore: number
  resumeQualityScore: number
  skillMatchScore: number
  experienceScore: number
  marketDemandScore: number
  createdAt: string
}

export default function ReadinessPage() {
  const [history, setHistory] = useState<ReadinessHistory[]>([])

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch('/api/interview-readiness')
        if (response.ok) {
          const data = await response.json()
          setHistory(data)
        }
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    }
    loadHistory()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600 dark:text-green-400'
    if (score >= 41) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 71) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (score >= 41) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={null} />

      <div className="container mx-auto px-4 py-4">
        <BackButton />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Readiness</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Get a personalised readiness score based on your resume, skills, experience, and market demand
          </p>
        </div>

        <InterviewReadinessScore />

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-500" />
              Previous Assessments
            </h2>
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getScoreBadge(item.overallScore)}`}>
                          <span className="text-lg font-bold">{item.overallScore}</span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.targetRole}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className={`font-semibold ${getScoreColor(item.resumeQualityScore)}`}>{item.resumeQualityScore}%</p>
                          <p className="text-xs text-zinc-400">Resume</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold ${getScoreColor(item.skillMatchScore)}`}>{item.skillMatchScore}%</p>
                          <p className="text-xs text-zinc-400">Skills</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold ${getScoreColor(item.experienceScore)}`}>{item.experienceScore}%</p>
                          <p className="text-xs text-zinc-400">Experience</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold ${getScoreColor(item.marketDemandScore)}`}>{item.marketDemandScore}%</p>
                          <p className="text-xs text-zinc-400">Market</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
