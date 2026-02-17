'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Loader2 } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface ResumeCardProps {
  hasResume: boolean
  resumeText?: string
}

export function ResumeCard({ hasResume, resumeText }: ResumeCardProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!resumeText) return
    
    setDownloading(true)

    try {
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      
      const fontSize = 11
      const margin = 50
      const lineHeight = fontSize * 1.2
      
      let page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      const maxWidth = width - (margin * 2)
      let yPosition = height - margin

      const sanitizeText = (text: string): string => {
        return text
          .replace(/●/g, '•')
          .replace(/•/g, '-')
          .replace(/[^\x20-\x7E]/g, '')
      }

      const lines = resumeText.split('\n')

      for (const line of lines) {
        const text = sanitizeText(line) || ' '
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        
        if (textWidth > maxWidth) {
          const words = text.split(' ')
          let currentLine = ''
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word
            const testWidth = font.widthOfTextAtSize(testLine, fontSize)
            
            if (testWidth > maxWidth && currentLine) {
              if (yPosition < margin + lineHeight) {
                page = pdfDoc.addPage()
                yPosition = height - margin
              }
              
              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              })
              
              yPosition -= lineHeight
              currentLine = word
            } else {
              currentLine = testLine
            }
          }
          
          if (currentLine) {
            if (yPosition < margin + lineHeight) {
              page = pdfDoc.addPage()
              yPosition = height - margin
            }
            
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            })
            
            yPosition -= lineHeight
          }
        } else {
          if (yPosition < margin + lineHeight) {
            page = pdfDoc.addPage()
            yPosition = height - margin
          }
          
          page.drawText(text, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          })
          
          yPosition -= lineHeight
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'original-resume.pdf'
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
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resume</CardTitle>
        <div className="flex items-center gap-2">
          {hasResume && resumeText && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors disabled:opacity-50"
              title="Download PDF"
            >
              {downloading ? (
                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          )}
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{hasResume ? 'Uploaded' : 'None'}</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          {hasResume ? 'Ready to optimize' : 'Upload your resume to get started'}
        </p>
      </CardContent>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-950/20 rounded-full -mr-16 -mt-16 opacity-50" />
    </Card>
  )
}
