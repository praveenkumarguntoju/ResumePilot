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
    const format = searchParams.get('format')

    if (!format || !['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf or docx' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile?.rawResumeText) {
      return NextResponse.json(
        { error: 'No resume found' },
        { status: 404 }
      )
    }

    const resumeText = profile.rawResumeText

    if (format === 'pdf') {
      const pdfBytes = await generateResumePDF(resumeText)

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="my-resume.pdf"',
        },
      })
    } else {
      const paragraphs = resumeText.split('\n').map((line: string) => {
        const isBold = line.trim().length > 0 &&
          (line.trim().toUpperCase() === line.trim() ||
            line.endsWith(':') ||
            line.startsWith('# ') ||
            line.startsWith('## '))

        const cleanLine = line.replace(/^#+\s+/, '').replace(/\*\*/g, '')

        return new Paragraph({
          children: [
            new TextRun({
              text: cleanLine || ' ',
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
          'Content-Disposition': 'attachment; filename="my-resume.docx"',
        },
      })
    }
  } catch (error) {
    console.error('Profile download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    )
  }
}
