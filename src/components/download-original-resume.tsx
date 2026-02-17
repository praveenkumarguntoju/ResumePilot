'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export function DownloadOriginalResume({ resumeText }: { resumeText: string }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
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
    <Button
      onClick={handleDownload}
      size="sm"
      variant="outline"
      disabled={downloading}
      className="w-full"
    >
      {downloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  )
}
