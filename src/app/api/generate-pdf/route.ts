import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateResumePDF } from '@/lib/pdf-generator'

const generatePDFSchema = z.object({
  resumeId: z.string().min(1),
  style: z.enum(['modern', 'classic', 'minimal', 'simple']).optional().default('modern'),
})

export async function POST(request: Request) {
  try {
    console.log('PDF generation request received')
    
    const session = await auth()
    if (!session?.user?.id) {
      console.log('Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    const { resumeId, style } = generatePDFSchema.parse(body)

    console.log('Looking for resume:', resumeId)
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      console.log('Resume not found')
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    if (!resume.tailoredResumeText) {
      console.log('No optimized resume found')
      return NextResponse.json(
        { error: 'No optimized resume found' },
        { status: 400 }
      )
    }

    console.log('Resume text found, length:', resume.tailoredResumeText.length)
    console.log('First 200 chars:', resume.tailoredResumeText.substring(0, 200))

    // Generate PDF using the optimized resume text
    console.log('Starting PDF generation...')
    const pdfBytes = await generateResumePDF(resume.tailoredResumeText)
    console.log('PDF generated, size:', pdfBytes.length)

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${resumeId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
