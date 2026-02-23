'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Target, TrendingUp, Briefcase, BarChart3, AlertTriangle, CheckCircle2, XCircle, Lightbulb, BookOpen, Wrench } from 'lucide-react'

interface SkillSuggestion {
  skill: string
  projects: string[]
  certifications: string[]
  steps: string[]
}

interface ReadinessResult {
  id: string
  resumeQualityScore: number
  skillMatchScore: number
  experienceScore: number
  marketDemandScore: number
  overallScore: number
  missingSkills: string[]
  weakAreas: string[]
  resumeQualityDetail: string
  suggestions: SkillSuggestion[]
}

interface InterviewReadinessScoreProps {
  resumeId?: string
}

export function InterviewReadinessScore({ resumeId }: InterviewReadinessScoreProps) {
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReadinessResult | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = async () => {
    if (!targetRole.trim()) {
      setError('Please enter a target role')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/interview-readiness/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: targetRole.trim(),
          resumeId: resumeId || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to calculate')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate readiness score')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600 dark:text-green-400'
    if (score >= 41) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 71) return 'bg-green-50 dark:bg-green-950/20 border-green-500'
    if (score >= 41) return 'bg-orange-50 dark:bg-orange-950/20 border-orange-500'
    return 'bg-red-50 dark:bg-red-950/20 border-red-500'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 71) return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (score >= 41) return <AlertTriangle className="h-5 w-5 text-orange-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 71) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 41) return 'Needs Work'
    return 'Low'
  }

  const getOverallRing = (score: number) => {
    const circumference = 2 * Math.PI * 54
    const offset = circumference - (score / 100) * circumference
    let color = '#ef4444'
    if (score >= 71) color = '#22c55e'
    else if (score >= 41) color = '#f97316'
    return { circumference, offset, color }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Interview Readiness Score
          </CardTitle>
          <CardDescription>
            Enter your target role to get a personalised readiness assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleCalculate}
              disabled={loading || !targetRole.trim()}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysing...
                </>
              ) : (
                'Calculate Score'
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Overall Score - Big Circle */}
          <Card className={`border-2 ${getScoreBg(result.overallScore)}`}>
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="68"
                      cy="68"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-zinc-200 dark:text-zinc-700"
                    />
                    <circle
                      cx="68"
                      cy="68"
                      r="54"
                      stroke={getOverallRing(result.overallScore).color}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={getOverallRing(result.overallScore).circumference}
                      strokeDashoffset={getOverallRing(result.overallScore).offset}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}%
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {getScoreLabel(result.overallScore)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    Your Interview Readiness: {result.overallScore}%
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                    for <span className="font-semibold text-zinc-900 dark:text-zinc-100">{targetRole}</span>
                  </p>
                  {result.overallScore >= 71 ? (
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      You&apos;re well-prepared for this role. Keep refining your skills!
                    </p>
                  ) : result.overallScore >= 41 ? (
                    <p className="text-orange-700 dark:text-orange-400 text-sm">
                      You&apos;re on the right track. Focus on the areas below to improve.
                    </p>
                  ) : (
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      There&apos;s significant room for improvement. Start with the recommendations below.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`border-2 ${getScoreBg(result.resumeQualityScore)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resume Quality</CardTitle>
                {getScoreIcon(result.resumeQualityScore)}
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(result.resumeQualityScore)}`}>
                  {result.resumeQualityScore}%
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Clarity, impact & ATS friendliness
                </p>
                <div className="mt-2 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      result.resumeQualityScore >= 71 ? 'bg-green-500' :
                      result.resumeQualityScore >= 41 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.resumeQualityScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getScoreBg(result.skillMatchScore)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skill Match</CardTitle>
                {getScoreIcon(result.skillMatchScore)}
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(result.skillMatchScore)}`}>
                  {result.skillMatchScore}%
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Skills aligned to {targetRole}
                </p>
                <div className="mt-2 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      result.skillMatchScore >= 71 ? 'bg-green-500' :
                      result.skillMatchScore >= 41 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.skillMatchScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getScoreBg(result.experienceScore)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Experience</CardTitle>
                {getScoreIcon(result.experienceScore)}
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(result.experienceScore)}`}>
                  {result.experienceScore}%
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Work, projects & leadership
                </p>
                <div className="mt-2 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      result.experienceScore >= 71 ? 'bg-green-500' :
                      result.experienceScore >= 41 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.experienceScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getScoreBg(result.marketDemandScore)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Demand</CardTitle>
                {getScoreIcon(result.marketDemandScore)}
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(result.marketDemandScore)}`}>
                  {result.marketDemandScore}%
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  UK job market demand
                </p>
                <div className="mt-2 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      result.marketDemandScore >= 71 ? 'bg-green-500' :
                      result.marketDemandScore >= 41 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.marketDemandScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Missing Skills & Weak Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.missingSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Missing Skills
                  </CardTitle>
                  <CardDescription>
                    Add these to your resume to improve your score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {result.missingSkills.length > 3 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                      Focus on learning <strong>{result.missingSkills.slice(0, 3).join(', ')}</strong> first to see the biggest improvement.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {result.weakAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    Areas to Improve
                  </CardTitle>
                  <CardDescription>
                    Focus on these areas to boost your readiness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.weakAreas.map((area, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{area}</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                            {area === 'Resume Quality' && 'Improve clarity, add quantified achievements, and use stronger action verbs.'}
                            {area === 'Skill Match' && 'Learn the missing skills listed above or highlight existing ones better.'}
                            {area === 'Experience' && 'Add internships, projects, or leadership roles to strengthen your profile.'}
                            {area === 'Market Demand' && 'Consider targeting roles with higher demand in the UK market.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Skill Gap Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  AI Action Plan
                </CardTitle>
                <CardDescription>
                  Personalised recommendations to improve your readiness from {result.overallScore}% to {Math.min(result.overallScore + 15, 95)}%+
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.suggestions.map((suggestion, i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                          {i + 1}
                        </span>
                        {suggestion.skill}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            <Wrench className="h-3.5 w-3.5" />
                            Project to Build
                          </div>
                          {suggestion.projects.map((project, j) => (
                            <p key={j} className="text-sm text-zinc-700 dark:text-zinc-300 pl-5">
                              {project}
                            </p>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            <BookOpen className="h-3.5 w-3.5" />
                            Course / Certification
                          </div>
                          {suggestion.certifications.map((cert, j) => (
                            <p key={j} className="text-sm text-zinc-700 dark:text-zinc-300 pl-5">
                              {cert}
                            </p>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Do This Week
                          </div>
                          {suggestion.steps.map((step, j) => (
                            <p key={j} className="text-sm text-zinc-700 dark:text-zinc-300 pl-5">
                              {step}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Weights Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Your Score is Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">30%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Resume Quality</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">30%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Skill Match</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">20%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Experience</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">20%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Market Demand</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
