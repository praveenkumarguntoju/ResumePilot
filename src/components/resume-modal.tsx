'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Download, Layout, Loader2 } from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ModernTemplate } from '@/components/resume-templates/modern-template'
import { ClassicTemplate } from '@/components/resume-templates/classic-template'
import { MinimalTemplate } from '@/components/resume-templates/minimal-template'

type TemplateType = 'simple' | 'modern' | 'classic' | 'minimal'

interface ResumeModalProps {
  resumeText: string
  contactInfo?: {
    fullName?: string
    email?: string
    phone?: string
  }
  forceTemplate?: TemplateType
}

export function ResumeModal({ resumeText, contactInfo, forceTemplate }: ResumeModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(forceTemplate || 'modern')
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch('/api/profile/download-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          contactInfo: contactInfo
        })
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${selectedTemplate}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download resume. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Full Resume & Download
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[70vw] w-[70vw] max-h-[90vh] overflow-hidden flex flex-col" style={{ maxWidth: '70%' }}>
        <DialogHeader>
          <DialogTitle>Your Professional Resume</DialogTitle>
          <DialogDescription>
            Choose a template and preview your resume before downloading
          </DialogDescription>
        </DialogHeader>

        {/* Template Selector */}
        {!forceTemplate && (
          <div className="flex items-center gap-3 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <Layout className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Template:</span>
            <div className="flex gap-2">
              <Button
                variant={selectedTemplate === 'modern' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplate('modern')}
              >
                Modern
              </Button>
              <Button
                variant={selectedTemplate === 'classic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplate('classic')}
              >
                Classic
              </Button>
              <Button
                variant={selectedTemplate === 'minimal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplate('minimal')}
              >
                Minimal
              </Button>
              <Button
                variant={selectedTemplate === 'simple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplate('simple')}
              >
                Simple
              </Button>
            </div>
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              className="ml-auto"
              disabled={downloading}
            >
              {downloading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </div>
        )}

        {/* Resume Preview */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 rounded-lg" >
          <div id="resume-preview-content">
            {selectedTemplate === 'simple' && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-4xl mx-auto">
                <MarkdownRenderer content={resumeText} contactInfo={contactInfo} />
              </div>
            )}
            {selectedTemplate === 'modern' && <ModernTemplate content={resumeText} contactInfo={contactInfo} />}
            {selectedTemplate === 'classic' && <ClassicTemplate content={resumeText} contactInfo={contactInfo} />}
            {selectedTemplate === 'minimal' && <MinimalTemplate content={resumeText} contactInfo={contactInfo} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
