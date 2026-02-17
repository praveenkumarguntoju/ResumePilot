import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(['applied', 'interviewing', 'offer', 'rejected']),
})

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = updateSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id, userId: session.user.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updated,
    })
  } catch (error) {
    console.error('Application update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
