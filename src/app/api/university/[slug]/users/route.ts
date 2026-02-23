import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    if (session.user.role !== 'admin' || session.user.universitySlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const university = await prisma.university.findUnique({
      where: { slug },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const users = await prisma.user.findMany({
      where: { universityId: university.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Users list error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

const updateSchema = z.object({
  userId: z.string().min(1),
  isApproved: z.boolean().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['student', 'advisor', 'admin']).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    if (session.user.role !== 'admin' || session.user.universitySlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, isApproved, isActive, role } = updateSchema.parse(body)

    // Verify user belongs to same university
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { university: true },
    })

    if (!targetUser || targetUser.university?.slug !== slug) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (isApproved !== undefined) updateData.isApproved = isApproved
    if (isActive !== undefined) updateData.isActive = isActive
    if (role !== undefined) updateData.role = role

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      isApproved: (updated as Record<string, unknown>).isApproved,
      isActive: (updated as Record<string, unknown>).isActive,
      role: (updated as Record<string, unknown>).role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
