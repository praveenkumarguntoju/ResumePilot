'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'

export function DownloadButtons({ resumeId }: { resumeId: string }) {
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null)

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setDownloading(format)

    try {
      const response = await fetch(`/api/resume/download?id=${resumeId}&format=${format}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download resume. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Resume
        </CardTitle>
        <CardDescription>
          Export your optimized resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href={`/dashboard/resumes/${resumeId}/preview`}>
          <Button
            variant="default"
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview PDF
          </Button>
        </Link>
        <Button
          onClick={() => handleDownload('pdf')}
          variant="outline"
          className="w-full"
          disabled={downloading !== null}
        >
          {downloading === 'pdf' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Download as PDF
            </>
          )}
        </Button>
        <Button
          onClick={() => handleDownload('docx')}
          variant="outline"
          className="w-full"
          disabled={downloading !== null}
        >
          {downloading === 'docx' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating DOCX...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Download as DOCX
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
