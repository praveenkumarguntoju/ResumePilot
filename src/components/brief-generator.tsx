'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Copy, Check } from 'lucide-react'

interface BriefGeneratorProps {
  resumeId: string
  onBriefGenerated: (brief: string) => void
}

export function BriefGenerator({ resumeId, onBriefGenerated }: BriefGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate brief')
      }

      setBrief(data.shortBrief)
      if (onBriefGenerated) {
        onBriefGenerated(data.shortBrief)
      }
    } catch (err) {
      console.error('Generate brief error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate brief')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(brief)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {!brief ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Generate a compelling professional summary from your resume to display on your public profile.
          </p>
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Brief...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Professional Brief
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {brief}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={copyToClipboard} 
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Brief
                </>
              )}
            </Button>
            <Button 
              onClick={handleGenerate} 
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
