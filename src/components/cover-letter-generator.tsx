'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileText, Copy, Check } from 'lucide-react'

export function CoverLetterGenerator({ resumeId }: { resumeId: string }) {
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setCoverLetter('')

    try {
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter')
      }

      setCoverLetter(data.coverLetter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Cover Letter
        </CardTitle>
        <CardDescription>
          Generate a tailored cover letter for this application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!coverLetter && !loading && (
          <Button onClick={handleGenerate} className="w-full" disabled={loading}>
            Generate Cover Letter
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {coverLetter && (
          <>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {coverLetter}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button onClick={handleGenerate} variant="outline">
                Regenerate
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
