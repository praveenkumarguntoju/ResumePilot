'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AIReviewDialogProps {
  resumeText: string
}

interface ReviewFeedback {
  overallRating: number
  strengths: string[]
  weakBullets: string[]
  missingMetrics: string[]
  genericPhrasing: string[]
  improvements: string[]
  jobDescriptionMatch?: {
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    recommendations: string[]
  }
}

export function AIReviewDialog({ resumeText }: AIReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null)

  const handleReview = async () => {
    if (jobDescription.trim().length < 50) {
      setError('Please enter a job description with at least 50 characters')
      return
    }

    setLoading(true)
    setError('')
    setFeedback(null)

    try {
      const response = await fetch('/api/resume/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim()
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to review resume')
      }

      const data = await response.json()
      setFeedback(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review resume')
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 dark:text-green-400'
    if (rating >= 6) return 'text-yellow-600 dark:text-yellow-400'
    if (rating >= 4) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
          Get AI review
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-600" />
            AI Resume Review
          </DialogTitle>
          <DialogDescription>
            Paste a job description to get AI-powered feedback on how well your resume matches
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!feedback ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Job Description</label>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {jobDescription.length} characters (minimum 50)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleReview}
                disabled={loading || jobDescription.trim().length < 50}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Review
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              {/* Overall Rating */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getRatingColor(feedback.overallRating)}`}>
                      {feedback.overallRating}/10
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Overall Resume Quality</p>
                  </div>
                </CardContent>
              </Card>

              {/* Job Match Score */}
              {feedback.jobDescriptionMatch && (
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Job Description Match
                    </h3>
                    <div className="text-center mb-4">
                      <div className={`text-5xl font-bold ${getMatchColor(feedback.jobDescriptionMatch.matchScore)}`}>
                        {feedback.jobDescriptionMatch.matchScore}%
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Match Score</p>
                    </div>

                    {feedback.jobDescriptionMatch.matchedSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Matched Skills ({feedback.jobDescriptionMatch.matchedSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.jobDescriptionMatch.matchedSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.jobDescriptionMatch.missingSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Missing Skills ({feedback.jobDescriptionMatch.missingSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.jobDescriptionMatch.missingSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.jobDescriptionMatch.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {feedback.jobDescriptionMatch.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weak Bullets */}
              {feedback.weakBullets.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertCircle className="h-5 w-5" />
                    Weak Bullet Points
                  </h3>
                  <ul className="space-y-2">
                    {feedback.weakBullets.map((bullet, idx) => (
                      <li key={idx} className="text-sm p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Metrics */}
              {feedback.missingMetrics.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <TrendingDown className="h-5 w-5" />
                    Missing Metrics
                  </h3>
                  <ul className="space-y-2">
                    {feedback.missingMetrics.map((metric, idx) => (
                      <li key={idx} className="text-sm p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100">
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Generic Phrasing */}
              {feedback.genericPhrasing.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <AlertCircle className="h-5 w-5" />
                    Generic Phrasing
                  </h3>
                  <ul className="space-y-2">
                    {feedback.genericPhrasing.map((phrase, idx) => (
                      <li key={idx} className="text-sm p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100">
                        {phrase}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Sparkles className="h-5 w-5" />
                    Suggested Improvements
                  </h3>
                  <ul className="space-y-2">
                    {feedback.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100">
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setFeedback(null)
                    setJobDescription('')
                    setError('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Try Another Job
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
