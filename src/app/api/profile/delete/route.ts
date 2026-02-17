import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const deleteSchema = z.object({
  slug: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slug } = deleteSchema.parse(body)

    const profile = await prisma.publicProfile.findUnique({
      where: { slug, userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    await prisma.publicProfile.delete({
      where: { slug },
    })

    return NextResponse.json({
      message: 'Profile deleted successfully',
    })
  } catch (error) {
    console.error('Delete profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
