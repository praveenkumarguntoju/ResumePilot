import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResumePDF } from '@/lib/pdf-generator'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const profile = await prisma.publicProfile.findUnique({
      where: { slug, isActive: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const pdfBytes = await generateResumePDF(profile.resumeText)

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${profile.name.replace(/\s+/g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    )
  }
}
