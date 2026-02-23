'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users, FileText, Briefcase, Target, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'

interface Analytics {
  totalAssessments: number
  avgReadinessScore: number
  avgResumeQuality: number
  avgSkillMatch: number
  avgExperience: number
  avgMarketDemand: number
  belowThresholdPercent: number
  topRoles: { role: string; count: number }[]
  skillGaps: { skill: string; count: number }[]
  scoreDistribution: {
    excellent: number
    good: number
    fair: number
    needsWork: number
    low: number
  }
  readinessOverTime: { month: string; avgScore: number; count: number }[]
  totalUsers: number
  totalResumes: number
  totalApplications: number
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600 dark:text-green-400'
    if (score >= 41) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBarColor = (score: number) => {
    if (score >= 71) return 'bg-green-500'
    if (score >= 41) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <DashboardHeader userEmail={null} />
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        </main>
      </div>
    )
  }

  const distributionTotal = analytics.scoreDistribution.excellent +
    analytics.scoreDistribution.good +
    analytics.scoreDistribution.fair +
    analytics.scoreDistribution.needsWork +
    analytics.scoreDistribution.low

  const maxRoleCount = analytics.topRoles.length > 0
    ? Math.max(...analytics.topRoles.map(r => r.count))
    : 1

  const maxSkillCount = analytics.skillGaps.length > 0
    ? Math.max(...analytics.skillGaps.map(s => s.count))
    : 1

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={null} />

      <div className="container mx-auto px-4 py-4">
        <BackButton />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">University Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Employability analytics and cohort insights
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalResumes}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Resumes Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalApplications}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center">
                  <Target className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalAssessments}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Average Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Average Readiness Score
              </CardTitle>
              <CardDescription>Across all cohort assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="44" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-200 dark:text-zinc-700" />
                    <circle
                      cx="56" cy="56" r="44"
                      stroke={analytics.avgReadinessScore >= 71 ? '#22c55e' : analytics.avgReadinessScore >= 41 ? '#f97316' : '#ef4444'}
                      strokeWidth="8" fill="none" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      strokeDashoffset={2 * Math.PI * 44 - (analytics.avgReadinessScore / 100) * 2 * Math.PI * 44}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(analytics.avgReadinessScore)}`}>
                      {analytics.avgReadinessScore}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Resume Quality', score: analytics.avgResumeQuality },
                    { label: 'Skill Match', score: analytics.avgSkillMatch },
                    { label: 'Experience', score: analytics.avgExperience },
                    { label: 'Market Demand', score: analytics.avgMarketDemand },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">{item.label}</span>
                        <span className={`font-medium ${getScoreColor(item.score)}`}>{item.score}%</span>
                      </div>
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getBarColor(item.score)}`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                At-Risk Students
              </CardTitle>
              <CardDescription>Students scoring below 60% readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className={`text-5xl font-bold ${analytics.belowThresholdPercent > 50 ? 'text-red-600' : analytics.belowThresholdPercent > 25 ? 'text-orange-600' : 'text-green-600'}`}>
                  {analytics.belowThresholdPercent}%
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">of assessments below 60%</p>
              </div>

              {/* Score Distribution - Pie-like bar */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Score Distribution</p>
                {distributionTotal > 0 && (
                  <div className="flex rounded-full overflow-hidden h-6">
                    {analytics.scoreDistribution.excellent > 0 && (
                      <div className="bg-green-500 flex items-center justify-center" style={{ width: `${(analytics.scoreDistribution.excellent / distributionTotal) * 100}%` }}>
                        <span className="text-[10px] text-white font-bold">{analytics.scoreDistribution.excellent}</span>
                      </div>
                    )}
                    {analytics.scoreDistribution.good > 0 && (
                      <div className="bg-emerald-400 flex items-center justify-center" style={{ width: `${(analytics.scoreDistribution.good / distributionTotal) * 100}%` }}>
                        <span className="text-[10px] text-white font-bold">{analytics.scoreDistribution.good}</span>
                      </div>
                    )}
                    {analytics.scoreDistribution.fair > 0 && (
                      <div className="bg-yellow-400 flex items-center justify-center" style={{ width: `${(analytics.scoreDistribution.fair / distributionTotal) * 100}%` }}>
                        <span className="text-[10px] text-white font-bold">{analytics.scoreDistribution.fair}</span>
                      </div>
                    )}
                    {analytics.scoreDistribution.needsWork > 0 && (
                      <div className="bg-orange-500 flex items-center justify-center" style={{ width: `${(analytics.scoreDistribution.needsWork / distributionTotal) * 100}%` }}>
                        <span className="text-[10px] text-white font-bold">{analytics.scoreDistribution.needsWork}</span>
                      </div>
                    )}
                    {analytics.scoreDistribution.low > 0 && (
                      <div className="bg-red-500 flex items-center justify-center" style={{ width: `${(analytics.scoreDistribution.low / distributionTotal) * 100}%` }}>
                        <span className="text-[10px] text-white font-bold">{analytics.scoreDistribution.low}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> 80%+ Excellent</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 71-79% Good</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> 60-70% Fair</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 41-59% Needs Work</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt;41% Low</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bar Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Roles - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Top Desired Roles
              </CardTitle>
              <CardDescription>Most targeted roles by students</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topRoles.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topRoles.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate mr-2">{item.role}</span>
                        <span className="text-zinc-500 dark:text-zinc-400 flex-shrink-0">{item.count}</span>
                      </div>
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${(item.count / maxRoleCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Gaps - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Most Common Skill Gaps
              </CardTitle>
              <CardDescription>Skills students are missing most</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.skillGaps.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.skillGaps.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium capitalize">{item.skill}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">{item.count}</span>
                      </div>
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Readiness Over Time - Line-like Chart */}
        {analytics.readinessOverTime.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
                Readiness Score Over Time
              </CardTitle>
              <CardDescription>Average readiness score by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {analytics.readinessOverTime.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-xs font-bold ${getScoreColor(item.avgScore)}`}>
                      {item.avgScore}%
                    </span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-t-md relative" style={{ height: '160px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-md transition-all duration-700 ${getBarColor(item.avgScore)}`}
                        style={{ height: `${(item.avgScore / 100) * 160}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                      {item.month}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ({item.count})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
