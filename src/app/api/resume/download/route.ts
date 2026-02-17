import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateResumePDF } from '@/lib/pdf-generator'
import { Document, Packer, Paragraph, TextRun } from 'docx'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('id')
    const format = searchParams.get('format')

    if (!resumeId || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    if (format === 'pdf') {
      const pdfBytes = await generateResumePDF(resume.tailoredResumeText)

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="resume-${resume.company}-${resume.jobTitle}.pdf"`,
        },
      })
    } else if (format === 'docx') {
      const paragraphs = resume.tailoredResumeText.split('\n').map((line: string) => {
        const isBold = line.trim().length > 0 && 
                      (line.trim().toUpperCase() === line.trim() || 
                       line.endsWith(':'))
        
        return new Paragraph({
          children: [
            new TextRun({
              text: line || ' ',
              bold: isBold,
              size: isBold ? 24 : 22,
            }),
          ],
          spacing: {
            after: 100,
          },
        })
      })

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      })

      const buffer = await Packer.toBuffer(doc)

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="resume-${resume.company}-${resume.jobTitle}.docx"`,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf or docx' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    )
  }
}
