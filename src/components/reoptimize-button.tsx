'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

export function ReoptimizeButton({ resumeId }: { resumeId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReoptimize = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/resume/reoptimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Re-optimization failed')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-optimize resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleReoptimize}
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Re-optimizing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-optimize Resume
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="text-xs text-zinc-500">
        Generate a new version with different phrasing and emphasis
      </p>
    </div>
  )
}
