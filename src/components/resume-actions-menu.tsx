'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, Loader2, Eye, MoreVertical } from 'lucide-react'
import Link from 'next/link'

export function ResumeActionsMenu({ resumeId }: { resumeId: string }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={downloading !== null}>
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/resumes/${resumeId}/preview`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Preview PDF
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={downloading !== null}>
          <FileText className="mr-2 h-4 w-4" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('docx')} disabled={downloading !== null}>
          <FileText className="mr-2 h-4 w-4" />
          Download as DOCX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
