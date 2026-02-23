'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'
import { InterviewReadinessScore } from '@/components/interview-readiness-score'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Clock, ChevronDown, ChevronUp, Lightbulb, BookOpen, Award, Footprints, Trash2 } from 'lucide-react'

interface ReadinessHistory {
  id: string
  targetRole: string
  overallScore: number
  resumeQualityScore: number
  skillMatchScore: number
  experienceScore: number
  marketDemandScore: number
  suggestions: string | null
  createdAt: string
}

export default function ReadinessPage() {
  const [history, setHistory] = useState<ReadinessHistory[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return
    
    setDeletingId(id)
    try {
      const response = await fetch(`/api/interview-readiness?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id))
        if (expandedId === id) {
          setExpandedId(null)
        }
      } else {
        alert('Failed to delete assessment')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete assessment')
    } finally {
      setDeletingId(null)
    }
  }

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

  const getScoreBorderColor = (score: number) => {
    if (score >= 71) return 'border-green-200 dark:border-green-800'
    if (score >= 41) return 'border-orange-200 dark:border-orange-800'
    return 'border-red-200 dark:border-red-800'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Excellent'
    if (score >= 41) return 'Needs Improvement'
    return 'Low'
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
                <Card
                  key={item.id}
                  className={`hover:shadow-md transition-all cursor-pointer ${
                    expandedId === item.id ? 'ring-2 ring-cyan-400 dark:ring-cyan-600' : ''
                  }`}
                  onClick={() => toggleExpanded(item.id)}
                >
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
                      <div className="flex items-center gap-4">
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors disabled:opacity-50"
                            title="Delete assessment"
                          >
                            {deletingId === item.id ? (
                              <div className="h-4 w-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                          {expandedId === item.id ? (
                            <ChevronUp className="h-5 w-5 text-zinc-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {expandedId === item.id && (
                      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-6 mb-6">
                          <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 ${getScoreBadge(item.overallScore)} ${getScoreBorderColor(item.overallScore)}`}>
                            <span className="text-2xl font-bold">{item.overallScore}</span>
                          </div>
                          <div>
                            <p className={`text-lg font-semibold ${getScoreColor(item.overallScore)}`}>{getScoreLabel(item.overallScore)}</p>
                            <p className="text-sm text-zinc-500">Overall Readiness for {item.targetRole}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className={`p-4 rounded-lg border ${getScoreBadge(item.resumeQualityScore)} ${getScoreBorderColor(item.resumeQualityScore)}`}>
                            <p className="text-xs font-medium opacity-80 mb-1">Resume Quality</p>
                            <p className="text-2xl font-bold">{item.resumeQualityScore}%</p>
                            <p className="text-xs opacity-70 mt-1">{getScoreLabel(item.resumeQualityScore)}</p>
                          </div>
                          <div className={`p-4 rounded-lg border ${getScoreBadge(item.skillMatchScore)} ${getScoreBorderColor(item.skillMatchScore)}`}>
                            <p className="text-xs font-medium opacity-80 mb-1">Skill Match</p>
                            <p className="text-2xl font-bold">{item.skillMatchScore}%</p>
                            <p className="text-xs opacity-70 mt-1">{getScoreLabel(item.skillMatchScore)}</p>
                          </div>
                          <div className={`p-4 rounded-lg border ${getScoreBadge(item.experienceScore)} ${getScoreBorderColor(item.experienceScore)}`}>
                            <p className="text-xs font-medium opacity-80 mb-1">Experience</p>
                            <p className="text-2xl font-bold">{item.experienceScore}%</p>
                            <p className="text-xs opacity-70 mt-1">{getScoreLabel(item.experienceScore)}</p>
                          </div>
                          <div className={`p-4 rounded-lg border ${getScoreBadge(item.marketDemandScore)} ${getScoreBorderColor(item.marketDemandScore)}`}>
                            <p className="text-xs font-medium opacity-80 mb-1">Market Demand</p>
                            <p className="text-2xl font-bold">{item.marketDemandScore}%</p>
                            <p className="text-xs opacity-70 mt-1">{getScoreLabel(item.marketDemandScore)}</p>
                          </div>
                        </div>

                        {item.suggestions && (() => {
                          let parsed: Array<{ skill: string; projects?: string[]; certifications?: string[]; steps?: string[] }> = []
                          try {
                            parsed = JSON.parse(item.suggestions)
                          } catch {
                            return (
                              <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                                <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">AI Suggestions</p>
                                <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans">{item.suggestions}</pre>
                              </div>
                            )
                          }
                          if (!Array.isArray(parsed) || parsed.length === 0) return null
                          return (
                            <div className="mt-2">
                              <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                AI Action Plan — Skills to Develop
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parsed.map((s, i) => (
                                  <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <p className="font-semibold text-base text-zinc-900 dark:text-zinc-100 mb-3">{s.skill}</p>
                                    {s.projects && s.projects.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                          <BookOpen className="h-3.5 w-3.5" /> Projects
                                        </p>
                                        <ul className="space-y-1">
                                          {s.projects.map((p, j) => (
                                            <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                                              <span className="text-blue-500 mt-1 shrink-0">•</span>
                                              {p}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {s.certifications && s.certifications.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                          <Award className="h-3.5 w-3.5" /> Certifications
                                        </p>
                                        <ul className="space-y-1">
                                          {s.certifications.map((c, j) => (
                                            <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                                              <span className="text-amber-500 mt-1 shrink-0">•</span>
                                              {c}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {s.steps && s.steps.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                          <Footprints className="h-3.5 w-3.5" /> Next Steps
                                        </p>
                                        <ul className="space-y-1">
                                          {s.steps.map((st, j) => (
                                            <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                                              <span className="text-green-500 mt-1 shrink-0">•</span>
                                              {st}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
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
