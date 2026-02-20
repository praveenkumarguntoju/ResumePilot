import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateResumeStyleVariants } from '@/lib/resume-prompt-template'

const stylesSchema = z.object({
  resumeId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeId } = stylesSchema.parse(body)

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

    if (!resume.tailoredResumeText) {
      return NextResponse.json(
        { error: 'No optimized resume found' },
        { status: 400 }
      )
    }

    const styleVariants = generateResumeStyleVariants(resume.tailoredResumeText)

    return NextResponse.json({
      message: 'Resume style variants generated successfully',
      styles: styleVariants,
    })
  } catch (error) {
    console.error('Resume styles error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate resume styles' },
      { status: 500 }
    )
  }
}
