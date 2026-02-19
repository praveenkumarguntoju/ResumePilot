'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Download, Layout } from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ModernTemplate } from '@/components/resume-templates/modern-template'
import { ClassicTemplate } from '@/components/resume-templates/classic-template'
import { MinimalTemplate } from '@/components/resume-templates/minimal-template'

type TemplateType = 'simple' | 'modern' | 'classic' | 'minimal'

interface ResumeModalProps {
  resumeText: string
}

export function ResumeModal({ resumeText }: ResumeModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern')

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview-content')
    if (!element) return

    // Get all stylesheets to preserve template styling
    const styles = Array.from(document.styleSheets).map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n')
      } catch (e) {
        return ''
      }
    }).join('\n')

    // Open a new window with the complete template HTML and styles
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${styles}
            @page {
              margin: 0.5in;
              size: letter;
            }
            @media print {
              @page { 
                margin: 0.5in;
                size: letter;
              }
              body { 
                padding: 0; 
                margin: 0;
              }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body style="background: white; color: black;">
          ${element.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Full Resume
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
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Resume Preview */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 rounded-lg" >
          <div id="resume-preview-content">
            {selectedTemplate === 'simple' && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-4xl mx-auto">
                <MarkdownRenderer content={resumeText} />
              </div>
            )}
            {selectedTemplate === 'modern' && <ModernTemplate content={resumeText} />}
            {selectedTemplate === 'classic' && <ClassicTemplate content={resumeText} />}
            {selectedTemplate === 'minimal' && <MinimalTemplate content={resumeText} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
