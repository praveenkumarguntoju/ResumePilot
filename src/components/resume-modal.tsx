'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye } from 'lucide-react'

interface ResumeModalProps {
  resumeText: string
}

export function ResumeModal({ resumeText }: ResumeModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Full Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Optimized Resume</DialogTitle>
          <DialogDescription>
            Full resume tailored for this job posting
          </DialogDescription>
        </DialogHeader>
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
          {resumeText.split('\n').map((line, i) => {
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            
            // Headers (lines ending with :)
            if (line.trim().endsWith(':') && line.trim().length > 2) {
              return <h3 key={i} className="text-base font-bold mt-3 mb-1 text-zinc-900 dark:text-zinc-100" dangerouslySetInnerHTML={{ __html: formattedLine }} />
            }
            
            // Bullet points
            if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
              return <li key={i} className="ml-4 text-sm mb-1 text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }} />
            }
            
            // Section dividers
            if (line.trim() === '---' || line.trim() === '___') {
              return <hr key={i} className="my-3 border-zinc-300 dark:border-zinc-700" />
            }
            
            // Empty lines
            if (line.trim() === '') {
              return <br key={i} />
            }
            
            // Regular paragraphs
            return <p key={i} className="text-sm mb-1 text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
