import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { company, role, notes } = createSchema.parse(body)

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        company,
        role,
        notes: notes || null,
        status: 'applied',
      },
    })

    return NextResponse.json({
      message: 'Application created successfully',
      applicationId: application.id,
    })
  } catch (error) {
    console.error('Application creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
