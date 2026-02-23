import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const saveResumeSchema = z.object({
  resumeText: z.string().min(1),
  contact: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeText, contact } = saveResumeSchema.parse(body)

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    const updateData: any = { rawResumeText: resumeText }
    if (contact) {
      updateData.fullName = contact.fullName
      updateData.email = contact.email
      updateData.phone = contact.phone || null
    }

    if (existingProfile) {
      // Update existing profile
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: updateData,
      })
    } else {
      // Create new profile
      await prisma.profile.create({
        data: {
          userId: session.user.id,
          rawResumeText: resumeText,
          ...updateData,
        },
      })
    }

    return NextResponse.json({
      message: 'Resume saved successfully',
    })
  } catch (error) {
    console.error('Save resume error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    )
  }
}
