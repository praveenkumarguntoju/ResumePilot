import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib'

interface ResumeData {
  name: string
  professionalSummary: string[]
  technicalSkills: string[]
  softSkills: string[]
  experience: string[]
  projects: string[]
  education: string[]
  certifications: string[]
}

function parseResumeText(resumeText: string): ResumeData {
  const lines = resumeText.split('\n')
  const sections: { [key: string]: string[] } = {}
  let currentSection = 'header'
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    const lineLower = trimmedLine.toLowerCase()
    
    if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
      currentSection = trimmedLine.replace(/^#+\s+/, '').toLowerCase()
      sections[currentSection] = []
    } else if (trimmedLine) {
      if (!sections[currentSection]) sections[currentSection] = []
      sections[currentSection].push(trimmedLine)
    }
  }
  
  return {
    name: sections.header?.[0]?.replace(/\*\*/g, '') || 'Your Name',
    professionalSummary: sections['professional summary'] || [],
    technicalSkills: sections['technical skills'] || sections['skills'] || [],
    softSkills: sections['soft skills'] || sections['soft skills & languages'] || [],
    experience: sections['experience'] || sections['professional experience'] || [],
    projects: sections['projects'] || [],
    education: sections['education'] || [],
    certifications: sections['certifications'] || []
  }
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, size)
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) lines.push(currentLine)
  return lines
}

function drawSectionHeader(
  page: PDFPage,
  title: string,
  x: number,
  y: number,
  endX: number,
  boldFont: PDFFont
) {
  page.drawText(title, {
    x,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.29, 0.35, 0.41),
  })
  page.drawLine({
    start: { x, y: y - 3 },
    end: { x: endX, y: y - 3 },
    thickness: 1,
    color: rgb(0.29, 0.35, 0.41),
  })
}

export async function generateResumePDF(resumeText: string): Promise<Uint8Array> {
  try {
    console.log('PDF generator: Starting generation')
    console.log('Input text length:', resumeText.length)
    
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const pageWidth = 612
    const pageHeight = 792
    const margin = 50
    const contentWidth = pageWidth - (margin * 2)
    let currentY = pageHeight - margin
    
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    
    console.log('PDF generator: Parsing resume text')
    const { name, professionalSummary, technicalSkills, softSkills, experience, projects, education, certifications } = parseResumeText(resumeText)
    
    console.log('Parsed data:', {
      name,
      professionalSummaryLength: professionalSummary.length,
      technicalSkillsLength: technicalSkills.length,
      softSkillsLength: softSkills.length,
      experienceLength: experience.length,
      projectsLength: projects.length,
      educationLength: education.length,
      certificationsLength: certifications.length
    })
    
    // Header with name
    page.drawText(name.toUpperCase(), {
      x: margin,
      y: currentY,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })
    currentY -= 35
    
    // Professional Summary
    if (professionalSummary.length > 0) {
      console.log('Adding professional summary section')
      page.drawText('PROFESSIONAL SUMMARY', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of professionalSummary) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const wrappedLines = wrapText(cleanLine, contentWidth, font, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
      currentY -= 15
    }
    
    // Technical Skills
    if (technicalSkills.length > 0) {
      console.log('Adding technical skills section')
      page.drawText('TECHNICAL SKILLS', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of technicalSkills) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const wrappedLines = wrapText('• ' + cleanLine, contentWidth, font, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
      currentY -= 15
    }
    
    // Soft Skills
    if (softSkills.length > 0) {
      console.log('Adding soft skills section')
      page.drawText('SOFT SKILLS', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of softSkills) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const wrappedLines = wrapText('• ' + cleanLine, contentWidth, font, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
      currentY -= 15
    }
    
    // Experience
    if (experience.length > 0) {
      console.log('Adding experience section')
      page.drawText('EXPERIENCE', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of experience) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const isBold = line.includes('**')
          const textFont = isBold ? boldFont : font
          const wrappedLines = wrapText(cleanLine, contentWidth, textFont, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: textFont,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
      currentY -= 15
    }
    
    // Projects
    if (projects.length > 0) {
      console.log('Adding projects section')
      page.drawText('PROJECTS', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of projects) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const isBold = line.includes('**')
          const textFont = isBold ? boldFont : font
          const wrappedLines = wrapText(cleanLine, contentWidth, textFont, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: textFont,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
      currentY -= 15
    }
    
    // Education
    if (education.length > 0) {
      console.log('Adding education section')
      page.drawText('EDUCATION', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of education) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const wrappedLines = wrapText(cleanLine, contentWidth, font, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
      currentY -= 15
    }
    
    // Certifications
    if (certifications.length > 0) {
      console.log('Adding certifications section')
      page.drawText('CERTIFICATIONS', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      })
      currentY -= 20
      
      for (const line of certifications) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/^[-•]\s*/, '').trim()
        if (cleanLine) {
          const wrappedLines = wrapText('• ' + cleanLine, contentWidth, font, 10)
          for (const wrappedLine of wrappedLines) {
            if (currentY < margin) break
            page.drawText(wrappedLine, {
              x: margin,
              y: currentY,
              size: 10,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            })
            currentY -= 14
          }
        }
      }
    }

    console.log('PDF generator: Saving document')
    const pdfBytes = await pdfDoc.save()
    console.log('PDF generator: Document saved, size:', pdfBytes.length)
    return pdfBytes
  } catch (error) {
    console.error('PDF generator error:', error)
    throw error
  }
}
