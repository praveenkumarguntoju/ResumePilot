import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib'

interface ResumeData {
  name: string
  title: string
  email: string
  phone: string
  summary: string
  skills: string[]
  experience: string[]
}

function parseResumeText(resumeText: string): ResumeData {
  const lines = resumeText.split('\n')
  let name = ''
  let title = ''
  let email = ''
  let phone = ''
  let summary = ''
  let skills: string[] = []
  let experience: string[] = []
  
  let inSummary = false
  let inSkills = false
  let inExperience = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineLower = line.toLowerCase()
    
    if (i === 0 && line) {
      name = line.replace(/\*\*/g, '')
      continue
    }
    if (i === 1 && line) {
      title = line.replace(/\*\*/g, '')
      continue
    }
    
    if (lineLower.includes('email:')) {
      email = line.split(':')[1]?.trim() || ''
      continue
    }
    if (lineLower.includes('phone:')) {
      phone = line.split(':')[1]?.trim() || ''
      continue
    }
    
    if (lineLower.includes('professional summary') || lineLower.includes('career objective')) {
      inSummary = true
      inSkills = false
      inExperience = false
      continue
    }
    if (lineLower.includes('technical skills') || lineLower.includes('key skills')) {
      inSummary = false
      inSkills = true
      inExperience = false
      continue
    }
    if (lineLower.includes('professional experience') || lineLower.includes('experience')) {
      inSummary = false
      inSkills = false
      inExperience = true
      continue
    }
    
    if (line.includes('**') && line.length < 50) {
      inSummary = false
      inSkills = false
      inExperience = false
    }
    
    if (inSummary && line && !line.includes('**')) {
      summary += line + ' '
    }
    if (inSkills && line.startsWith('-')) {
      skills.push(line.substring(1).trim())
    }
    if (inExperience && line) {
      experience.push(line)
    }
  }
  
  return { name, title, email, phone, summary, skills, experience }
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
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const pageWidth = 612
  const pageHeight = 792
  const sidebarWidth = 180
  const sidebarPadding = 20
  const mainContentX = sidebarWidth + 25
  const mainContentWidth = pageWidth - mainContentX - 25
  const headerHeight = 100
  
  const page = pdfDoc.addPage([pageWidth, pageHeight])
  
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerHeight,
    width: pageWidth,
    height: headerHeight,
    color: rgb(0.29, 0.35, 0.41),
  })
  
  page.drawRectangle({
    x: 0,
    y: 0,
    width: sidebarWidth,
    height: pageHeight - headerHeight,
    color: rgb(0.95, 0.95, 0.95),
  })
  
  const { name, title, email, phone, summary, skills, experience } = parseResumeText(resumeText)
  
  const nameWidth = boldFont.widthOfTextAtSize(name.toUpperCase(), 22)
  const nameX = mainContentX + (mainContentWidth - nameWidth) / 2
  page.drawText(name.toUpperCase(), {
    x: nameX,
    y: pageHeight - 55,
    size: 22,
    font: boldFont,
    color: rgb(1, 1, 1),
  })
  
  let sidebarY = pageHeight - headerHeight - 30
  
  page.drawText('CONTACT', {
    x: sidebarPadding,
    y: sidebarY,
    size: 11,
    font: boldFont,
    color: rgb(0.29, 0.35, 0.41),
  })
  
  page.drawLine({
    start: { x: sidebarPadding, y: sidebarY - 3 },
    end: { x: sidebarWidth - sidebarPadding, y: sidebarY - 3 },
    thickness: 1,
    color: rgb(0.29, 0.35, 0.41),
  })
  sidebarY -= 25
  
  if (phone) {
    page.drawText('Phone:', {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    sidebarY -= 14
    page.drawText(phone, {
      x: sidebarPadding,
      y: sidebarY,
      size: 9,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    })
    sidebarY -= 25
  }
  
  if (email) {
    page.drawText('Email:', {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    sidebarY -= 14
    
    const maxEmailWidth = sidebarWidth - (sidebarPadding * 2)
    let emailLines: string[] = []
    if (font.widthOfTextAtSize(email, 8) > maxEmailWidth) {
      const parts = email.split('@')
      emailLines = [parts[0], '@' + parts[1]]
    } else {
      emailLines = [email]
    }
    
    for (const emailLine of emailLines) {
      page.drawText(emailLine, {
        x: sidebarPadding,
        y: sidebarY,
        size: 8,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      })
      sidebarY -= 12
    }
    sidebarY -= 15
  }
  
  let mainY = pageHeight - headerHeight - 30
  
  if (summary) {
    drawSectionHeader(page, 'CAREER OBJECTIVE', mainContentX, mainY, pageWidth - 25, boldFont)
    mainY -= 22
    
    const summaryLines = wrapText(summary.trim(), mainContentWidth, font, 9)
    for (const line of summaryLines) {
      if (mainY < 100) break
      page.drawText(line, {
        x: mainContentX,
        y: mainY,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      })
      mainY -= 13
    }
    mainY -= 15
  }
  
  if (skills.length > 0 && mainY > 150) {
    drawSectionHeader(page, 'KEY SKILLS', mainContentX, mainY, pageWidth - 25, boldFont)
    mainY -= 22
    
    for (const skill of skills) {
      if (mainY < 100) break
      const skillLines = wrapText(skill, mainContentWidth - 15, font, 9)
      for (const skillLine of skillLines) {
        page.drawText('• ' + skillLine, {
          x: mainContentX,
          y: mainY,
          size: 9,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        })
        mainY -= 13
      }
    }
    mainY -= 15
  }
  
  if (experience.length > 0 && mainY > 100) {
    drawSectionHeader(page, 'EXPERIENCE', mainContentX, mainY, pageWidth - 25, boldFont)
    mainY -= 22
    
    for (const exp of experience) {
      if (mainY < 80) break
      
      const cleanExp = exp.replace(/\*\*/g, '')
      const isBold = exp.includes('**')
      const expFont = isBold ? boldFont : font
      const expSize = isBold ? 10 : 9
      
      const wrappedLines = wrapText(cleanExp, mainContentWidth, expFont, expSize)
      
      for (const wrappedLine of wrappedLines) {
        if (mainY < 80) break
        page.drawText(wrappedLine, {
          x: mainContentX,
          y: mainY,
          size: expSize,
          font: expFont,
          color: rgb(0.2, 0.2, 0.2),
        })
        mainY -= 13
      }
      
      if (isBold) mainY -= 4
    }
  }

  return await pdfDoc.save()
}
