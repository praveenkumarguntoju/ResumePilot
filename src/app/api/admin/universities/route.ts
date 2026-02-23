import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  adminEmail: z.string().email(),
  adminName: z.string().min(1),
  adminPassword: z.string().min(6),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const universities = await prisma.university.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(universities)
  } catch (error) {
    console.error('Universities list error:', error)
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, adminEmail, adminName, adminPassword } = createSchema.parse(body)

    // Check slug uniqueness
    const existing = await prisma.university.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'A university with this slug already exists' }, { status: 400 })
    }

    // Check admin email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    // Create university + admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const university = await tx.university.create({
        data: { name, slug },
      })

      const passwordHash = await bcrypt.hash(adminPassword, 10)

      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash,
          planType: 'university',
          role: 'admin',
          universityId: university.id,
          isApproved: true,
        },
      })

      await tx.profile.create({
        data: { userId: adminUser.id },
      })

      return { university, adminUser }
    })

    return NextResponse.json(
      {
        university: {
          id: result.university.id,
          name: result.university.name,
          slug: result.university.slug,
        },
        admin: {
          id: result.adminUser.id,
          email: result.adminUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('University create error:', error)
    return NextResponse.json({ error: 'Failed to create university' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, isActive } = body as { id: string; isActive: boolean }

    if (!id) {
      return NextResponse.json({ error: 'University ID required' }, { status: 400 })
    }

    const updated = await prisma.university.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('University update error:', error)
    return NextResponse.json({ error: 'Failed to update university' }, { status: 500 })
  }
}
