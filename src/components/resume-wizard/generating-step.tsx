'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface GeneratingStepProps {
  formData: ResumeFormData
  onNext: () => void
  setGeneratedResume: (resume: string) => void
}

export function GeneratingStep({ formData, onNext, setGeneratedResume }: GeneratingStepProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    generateResume()
  }, [])

  const generateResume = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate resume')
      }

      setGeneratedResume(data.resume)
      setTimeout(() => {
        onNext()
      }, 1000)
    } catch (err) {
      console.error('Generate resume error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 py-12">
      <div className="text-center">
        {loading ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                <Sparkles className="h-8 w-8 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Creating Your Resume...</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Our AI is crafting a professional resume tailored to your profile
            </p>
            <div className="mt-8 space-y-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">✓ Analyzing your education and experience</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">✓ Highlighting your projects and skills</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">✓ Aligning with your target role</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">✓ Optimizing for ATS systems</p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="text-red-600 dark:text-red-400 mb-4">
              <h2 className="text-2xl font-bold mb-2">Generation Failed</h2>
              <p>{error}</p>
            </div>
            <Button onClick={generateResume}>
              Try Again
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Resume Generated!</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Redirecting to review...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
