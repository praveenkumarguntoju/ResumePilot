'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Star, ArrowRight, MessageSquare, BarChart3, Lightbulb, Upload, FileText } from 'lucide-react'

interface ReviewFeedback {
  overallRating: number
  weakBullets: { text: string; issue: string; suggestion: string }[]
  missingMetrics: { section: string; suggestion: string }[]
  genericPhrasing: { text: string; betterVersion: string }[]
  improvements: string[]
  strengths: string[]
  summary: string
}

export default function ResumeReviewPage() {
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError('')
    setUploadedFileName('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/resume/extract-text', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text')
      }

      setResumeText(data.text)
      setUploadedFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: uploading || loading,
  })

  const handleReview = async () => {
    if (resumeText.trim().length < 50) {
      setError('Please paste a resume with at least 50 characters')
      return
    }

    setLoading(true)
    setError('')
    setFeedback(null)

    try {
      const response = await fetch('/api/resume/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeText.trim() }),
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

  const getRatingBg = (rating: number) => {
    if (rating >= 8) return 'bg-green-50 dark:bg-green-950/20 border-green-500'
    if (rating >= 6) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
    if (rating >= 4) return 'bg-orange-50 dark:bg-orange-950/20 border-orange-500'
    return 'bg-red-50 dark:bg-red-950/20 border-red-500'
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'Excellent'
    if (rating >= 8) return 'Very Good'
    if (rating >= 6) return 'Good'
    if (rating >= 4) return 'Needs Improvement'
    return 'Significant Work Needed'
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={null} />

      <div className="container mx-auto px-4 py-4">
        <BackButton />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Resume Review</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Paste a resume to get detailed AI-powered feedback — ideal for career advisors and students
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload a PDF, DOCX, or TXT file to extract text automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20'
                  : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600'
              } ${uploading || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                ) : uploadedFileName ? (
                  <FileText className="h-10 w-10 text-green-500" />
                ) : (
                  <Upload className="h-10 w-10 text-zinc-400" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {uploading
                      ? 'Extracting text...'
                      : uploadedFileName
                      ? `Loaded: ${uploadedFileName}`
                      : isDragActive
                      ? 'Drop your resume here'
                      : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Supports PDF, DOCX, DOC, or TXT files
                  </p>
                </div>
                {!uploading && !uploadedFileName && (
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paste Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {uploadedFileName ? 'Extracted Resume Text' : 'Paste Resume Text'}
            </CardTitle>
            <CardDescription>
              {uploadedFileName
                ? 'Text extracted from your uploaded file — you can edit it before reviewing'
                : 'Or paste the full resume text below manually'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the resume text here or upload a file above..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={12}
              className="mb-4 font-mono text-sm"
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {resumeText.length} characters
              </p>
              <Button
                onClick={handleReview}
                disabled={loading || resumeText.trim().length < 50}
                className="min-w-[160px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  'Review Resume'
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {feedback && (
          <div className="space-y-6">
            {/* Overall Rating */}
            <Card className={`border-2 ${getRatingBg(feedback.overallRating)}`}>
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < feedback.overallRating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-zinc-300 dark:text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold">
                      <span className={getRatingColor(feedback.overallRating)}>
                        {feedback.overallRating}/10
                      </span>
                      {' '}&mdash; {getRatingLabel(feedback.overallRating)}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm">
                      {feedback.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedback.strengths.map((strength, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-300">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weak Bullet Points */}
            {feedback.weakBullets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Weak Bullet Points
                  </CardTitle>
                  <CardDescription>
                    These statements need strengthening
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.weakBullets.map((bullet, i) => (
                      <div key={i} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-start gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 line-through opacity-70">
                            {bullet.text}
                          </p>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 ml-6 mb-2">
                          Issue: {bullet.issue}
                        </p>
                        <div className="flex items-start gap-2 ml-6">
                          <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                            {bullet.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Metrics */}
            {feedback.missingMetrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    Missing Quantification
                  </CardTitle>
                  <CardDescription>
                    Add numbers and metrics to make these sections more impactful
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.missingMetrics.map((metric, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                            {metric.section}
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                            {metric.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generic Phrasing */}
            {feedback.genericPhrasing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Generic Phrasing Detected
                  </CardTitle>
                  <CardDescription>
                    Replace these overused phrases with specific, impactful language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.genericPhrasing.map((phrase, i) => (
                      <div key={i} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-through">
                              {phrase.text}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                              {phrase.betterVersion}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Improvement Suggestions */}
            {feedback.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedback.improvements.map((improvement, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
